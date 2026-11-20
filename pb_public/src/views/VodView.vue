<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import VodDeleteDialog from "@/components/vod/VodDeleteDialog.vue";
import VodFilters from "@/components/vod/VodFilters.vue";
import { availabilityRepository } from "@/domain/repositories";
import {
  isExpired,
  money,
  qualityLabel,
  typeLabel,
} from "@/domain/vod/format";
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { AvailabilityRecord, BaseRecord } from "@/types/records";

type CountryRecord = BaseRecord & {
  nome?: string;
  codigo?: string;
};

const PER_PAGE = 24;
const countryRepository = new PocketBaseRepository<CountryRecord>("paises");
const route = useRoute();
const router = useRouter();

const items = ref<AvailabilityRecord[]>([]);
const countries = ref<CountryRecord[]>([]);
const loading = ref(true);
const actionLoadingId = ref("");
const error = ref("");
const page = ref(normalizePage(route.query.page));
const totalPages = ref(1);
const totalItems = ref(0);

const search = ref(queryString("q"));
const country = ref(queryString("pais"));
const type = ref(queryString("tipo"));
const quality = ref(queryString("qualidade"));
const status = ref(queryString("estado") || "active");
const subscription = ref(queryString("subscricao"));

const deleteTarget = ref<AvailabilityRecord | null>(null);
const deleting = ref(false);
const created = computed(() => route.query.created === "1");
const hasPreviousPage = computed(() => page.value > 1);
const hasNextPage = computed(() => page.value < totalPages.value);
const pageDescription = computed(() => {
  if (!totalItems.value) return "Nenhuma oferta encontrada";
  return `${totalItems.value} oferta${totalItems.value === 1 ? "" : "s"} · página ${page.value} de ${totalPages.value}`;
});

function queryString(name: string): string {
  const value = route.query[name];
  return typeof value === "string" ? value : "";
}

function normalizePage(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function escapeFilter(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function buildFilter(): string {
  const filters: string[] = [];
  const term = search.value.trim();

  if (term) {
    const escaped = escapeFilter(term);
    filters.push(
      `(provider_nome ~ "${escaped}" || titulo.titulo ~ "${escaped}" || titulo.titulo_original ~ "${escaped}")`,
    );
  }

  if (country.value) filters.push(`pais = "${escapeFilter(country.value)}"`);
  if (type.value) filters.push(`tipo = "${escapeFilter(type.value)}"`);
  if (quality.value) filters.push(`qualidade = "${escapeFilter(quality.value)}"`);

  if (status.value === "active") filters.push("ativo = true");
  if (status.value === "inactive") filters.push("ativo = false");
  if (status.value === "expired") {
    filters.push('data_fim != ""');
    filters.push("data_fim < @now");
  }

  if (subscription.value === "yes") filters.push("incluido_subscricao = true");
  if (subscription.value === "no") filters.push("incluido_subscricao = false");

  return filters.join(" && ");
}

function title(item: AvailabilityRecord): string {
  return item.expand?.titulo?.titulo || item.titulo;
}

function countryName(item: AvailabilityRecord): string {
  return item.expand?.pais?.nome || item.expand?.pais?.codigo || "Global";
}

async function loadCountries(): Promise<void> {
  if (countries.value.length) return;
  const result = await countryRepository.list({
    page: 1,
    perPage: 500,
    sort: "nome",
    fields: "id,nome,codigo",
  });
  countries.value = result.items;
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";

  try {
    const [result] = await Promise.all([
      availabilityRepository.list({
        page: page.value,
        perPage: PER_PAGE,
        filter: buildFilter(),
        sort: "provider_nome",
        expand: "titulo,pais",
      }),
      loadCountries(),
    ]);

    if (result.totalPages > 0 && page.value > result.totalPages) {
      page.value = result.totalPages;
      await syncRoute();
      return;
    }

    items.value = result.items;
    totalItems.value = result.totalItems;
    totalPages.value = Math.max(result.totalPages, 1);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    items.value = [];
    totalItems.value = 0;
    totalPages.value = 1;
  } finally {
    loading.value = false;
  }
}

async function toggle(item: AvailabilityRecord): Promise<void> {
  actionLoadingId.value = item.id;
  error.value = "";

  try {
    await availabilityRepository.update(item.id, {
      ativo: item.ativo === false,
    });
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    actionLoadingId.value = "";
  }
}

async function remove(): Promise<void> {
  if (!deleteTarget.value) return;

  deleting.value = true;
  error.value = "";

  try {
    await availabilityRepository.delete(deleteTarget.value.id);
    deleteTarget.value = null;
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    deleting.value = false;
  }
}

function clearFilters(): void {
  search.value = "";
  country.value = "";
  type.value = "";
  quality.value = "";
  status.value = "active";
  subscription.value = "";
  page.value = 1;
}

async function changePage(nextPage: number): Promise<void> {
  page.value = Math.min(Math.max(nextPage, 1), totalPages.value);
  await syncRoute();
  await load();
  document.querySelector<HTMLElement>("#main-content")?.focus({
    preventScroll: false,
  });
}

async function syncRoute(): Promise<void> {
  await router.replace({
    name: "vod",
    query: {
      ...(search.value.trim() ? { q: search.value.trim() } : {}),
      ...(country.value ? { pais: country.value } : {}),
      ...(type.value ? { tipo: type.value } : {}),
      ...(quality.value ? { qualidade: quality.value } : {}),
      ...(status.value !== "active" ? { estado: status.value } : {}),
      ...(subscription.value ? { subscricao: subscription.value } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
    },
  });
}

let filterTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  [search, country, type, quality, status, subscription],
  () => {
    page.value = 1;
    if (filterTimer) clearTimeout(filterTimer);
    filterTimer = setTimeout(async () => {
      await syncRoute();
      await load();
    }, 300);
  },
);

onMounted(() => void load());
</script>

<template>
  <div v-if="created" class="form-alert form-alert-success">
    Disponibilidade criada com sucesso.
  </div>

  <BasePageHeader
    eyebrow="Disponibilidade"
    title="VOD"
    :description="pageDescription"
  >
    <template #actions>
      <RouterLink class="button button-primary" to="/vod/novo">
        + Adicionar disponibilidade
      </RouterLink>
    </template>
  </BasePageHeader>

  <VodFilters
    v-model:search="search"
    v-model:country="country"
    v-model:type="type"
    v-model:quality="quality"
    v-model:status="status"
    v-model:subscription="subscription"
    :countries="countries"
    @clear="clearFilters"
  />

  <div v-if="error && items.length" class="form-alert form-alert-error" role="alert">
    {{ error }}
  </div>

  <section v-if="loading" class="page-loading" aria-live="polite">
    <span class="loader" />
    <p>A carregar ofertas…</p>
  </section>

  <BaseEmptyState
    v-else-if="error && !items.length"
    icon="!"
    title="Não foi possível carregar o VOD"
    :description="error"
  >
    <button class="button button-secondary" type="button" @click="load">
      Voltar a tentar
    </button>
  </BaseEmptyState>

  <template v-else-if="items.length">
    <div class="vod-grid">
      <article
        v-for="item in items"
        :key="item.id"
        class="panel vod-card"
        :class="{
          'is-inactive': item.ativo === false,
          'is-expired': isExpired(item.data_fim),
        }"
      >
        <div class="vod-card-head">
          <div>
            <div class="title-badges">
              <span class="detail-badge detail-badge-primary">
                {{ typeLabel(item.tipo) }}
              </span>
              <span
                v-if="item.ativo === false"
                class="detail-badge detail-badge-danger"
              >
                Inativa
              </span>
              <span
                v-if="isExpired(item.data_fim)"
                class="detail-badge detail-badge-danger"
              >
                Expirada
              </span>
            </div>
            <h2>{{ title(item) }}</h2>
          </div>
        </div>

        <dl class="vod-facts">
          <div><dt>Provider</dt><dd>{{ item.provider_nome }}</dd></div>
          <div><dt>País</dt><dd>{{ countryName(item) }}</dd></div>
          <div><dt>Qualidade</dt><dd>{{ qualityLabel(item.qualidade) }}</dd></div>
          <div>
            <dt>Preço</dt>
            <dd>
              {{ money(item.preco, item.moeda) || (item.incluido_subscricao ? "Incluído" : "—") }}
            </dd>
          </div>
        </dl>

        <div class="vod-actions">
          <RouterLink
            class="button button-secondary"
            :to="`/catalogo/${item.titulo}`"
          >
            Título
          </RouterLink>
          <a
            v-if="item.url"
            class="button button-primary"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            Provider
          </a>
          <RouterLink
            class="button button-secondary"
            :to="`/vod/${item.id}/editar`"
          >
            Editar
          </RouterLink>
          <button
            class="button button-secondary"
            type="button"
            :disabled="actionLoadingId === item.id"
            @click="toggle(item)"
          >
            {{ actionLoadingId === item.id
              ? "A guardar…"
              : item.ativo === false
                ? "Ativar"
                : "Desativar" }}
          </button>
          <button
            class="button button-danger"
            type="button"
            :disabled="actionLoadingId === item.id"
            @click="deleteTarget = item"
          >
            Eliminar
          </button>
        </div>
      </article>
    </div>

    <nav
      v-if="totalPages > 1"
      class="pagination"
      aria-label="Paginação das disponibilidades VOD"
    >
      <button
        class="button button-secondary"
        type="button"
        :disabled="!hasPreviousPage"
        @click="changePage(page - 1)"
      >
        Anterior
      </button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button
        class="button button-secondary"
        type="button"
        :disabled="!hasNextPage"
        @click="changePage(page + 1)"
      >
        Seguinte
      </button>
    </nav>
  </template>

  <BaseEmptyState
    v-else
    icon="▶"
    title="Nenhuma disponibilidade encontrada"
    description="Altera os filtros ou adiciona uma nova oferta."
  />

  <VodDeleteDialog
    :open="Boolean(deleteTarget)"
    :provider="deleteTarget?.provider_nome || ''"
    :title="deleteTarget ? title(deleteTarget) : ''"
    :deleting="deleting"
    @close="deleteTarget = null"
    @confirm="remove"
  />
</template>
