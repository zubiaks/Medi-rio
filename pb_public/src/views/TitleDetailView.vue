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
import TitleArchiveDialog from "@/components/catalog/TitleArchiveDialog.vue";
import TitleAvailabilityList from "@/components/vod/TitleAvailabilityList.vue";
import { archiveTitle } from "@/domain/catalog/trash";
import { titleRepository } from "@/domain/repositories";
import { pb } from "@/infrastructure/pocketbase/client";
import type { TitleRecord } from "@/types/records";

type NamedRecord = {
  id: string;
  nome?: string;
  nome_singular?: string;
};

type TitleDetailRecord = TitleRecord & {
  data_lancamento?: string;
  classificacao_etaria?: string;
  notas_pessoais?: string;
  duracao_min?: number;
  paginas?: number;
  horas_jogadas?: number;
  tmdb_id?: number;
  tipo_tmdb?: string;
  imdb_id?: string;
  canonico?: boolean;
  adulto?: boolean;
  expand?: Record<string, NamedRecord | NamedRecord[]>;
};

const route = useRoute();
const router = useRouter();
const record = ref<TitleDetailRecord | null>(null);
const loading = ref(true);
const error = ref("");
const archiveOpen = ref(false);
const archiving = ref(false);
const failedImages = ref(new Set<string>());

const created = computed(() => route.query.created === "1");
const updated = computed(() => route.query.updated === "1");
const expand =
  "midia,tipo,estado,generos,tags,idiomas,pais_origem,plataformas,companhias";

const posterUrl = computed(() => imageUrl("poster", "poster_url"));
const backdropUrl = computed(() => imageUrl("backdrop", "backdrop_url"));
const logoUrl = computed(() => imageUrl("logo", "logo_url"));

function relationNames(value: NamedRecord | NamedRecord[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(
    (item) => item.nome || item.nome_singular || item.id,
  );
}

function imageUrl(
  fileField: "poster" | "backdrop" | "logo",
  urlField: "poster_url" | "backdrop_url" | "logo_url",
): string {
  if (!record.value) return "";

  const fileName = record.value[fileField];
  const localUrl = fileName ? pb.files.getURL(record.value, fileName) : "";
  const externalUrl = record.value[urlField]?.trim() || "";
  const selected = localUrl || externalUrl;

  return selected && !failedImages.value.has(selected) ? selected : "";
}

function markImageFailed(url: string): void {
  if (!url) return;
  failedImages.value = new Set([...failedImages.value, url]);
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(date);
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  failedImages.value = new Set();

  try {
    record.value = (await titleRepository.get(String(route.params.id), {
      expand,
    })) as TitleDetailRecord;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function archive(reason: string): Promise<void> {
  if (!record.value) return;
  archiving.value = true;
  error.value = "";

  try {
    await archiveTitle(record.value.id, reason);
    archiveOpen.value = false;
    await router.push({ name: "trash", query: { archived: "1" } });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    archiving.value = false;
  }
}

watch(() => route.params.id, () => void load());
onMounted(() => void load());
</script>

<template>
  <section v-if="loading" class="page-loading">
    <span class="loader" />
    <p>A carregar título…</p>
  </section>

  <BaseEmptyState
    v-else-if="error && !record"
    icon="!"
    title="Não foi possível abrir o título"
    :description="error"
  >
    <button class="button button-secondary" type="button" @click="load">
      Voltar a tentar
    </button>
  </BaseEmptyState>

  <template v-else-if="record">
    <div v-if="created" class="form-alert form-alert-success">
      Título criado com sucesso.
    </div>
    <div v-if="updated" class="form-alert form-alert-success">
      Título atualizado com sucesso.
    </div>
    <div v-if="error" class="form-alert form-alert-error">
      {{ error }}
    </div>

    <section
      v-if="backdropUrl"
      class="title-backdrop"
      :style="{ backgroundImage: `url(${backdropUrl})` }"
      aria-label="Imagem de fundo do título"
    >
      <img :src="backdropUrl" alt="" class="sr-only" @error="markImageFailed(backdropUrl)" />
      <div class="title-backdrop-overlay" />
    </section>

    <BasePageHeader
      eyebrow="Catálogo"
      :title="record.titulo"
      :description="record.tagline || record.titulo_original || 'Detalhe do título'"
    >
      <template #actions>
        <RouterLink class="button button-secondary" to="/catalogo">← Catálogo</RouterLink>
        <RouterLink class="button button-primary" :to="`/catalogo/${record.id}/editar`">Editar</RouterLink>
        <button class="button button-danger" type="button" @click="archiveOpen = true">Lixeira</button>
      </template>
    </BasePageHeader>

    <section class="title-detail">
      <aside class="title-poster">
        <img v-if="posterUrl" :src="posterUrl" :alt="`Poster de ${record.titulo}`" @error="markImageFailed(posterUrl)" />
        <div v-else class="poster-placeholder"><span>▶</span><small>Sem poster</small></div>
      </aside>

      <div class="title-main">
        <img v-if="logoUrl" class="title-logo" :src="logoUrl" :alt="`Logo de ${record.titulo}`" @error="markImageFailed(logoUrl)" />

        <div class="title-badges">
          <span v-if="record.expand?.midia" class="detail-badge detail-badge-primary">{{ relationNames(record.expand.midia)[0] }}</span>
          <span v-if="record.expand?.tipo" class="detail-badge">{{ relationNames(record.expand.tipo)[0] }}</span>
          <span v-if="record.expand?.estado" class="detail-badge detail-badge-success">{{ relationNames(record.expand.estado)[0] }}</span>
          <span v-if="record.adulto" class="detail-badge detail-badge-danger">Adulto</span>
        </div>

        <dl class="title-facts">
          <div><dt>Ano</dt><dd>{{ record.ano || "—" }}</dd></div>
          <div><dt>Lançamento</dt><dd>{{ formatDate(record.data_lancamento) }}</dd></div>
          <div><dt>Classificação</dt><dd>{{ record.classificacao_etaria || "—" }}</dd></div>
          <div><dt>Avaliação</dt><dd>{{ record.rating ?? "—" }}</dd></div>
          <div><dt>Duração</dt><dd>{{ record.duracao_min ? `${record.duracao_min} min` : "—" }}</dd></div>
          <div><dt>Páginas</dt><dd>{{ record.paginas || "—" }}</dd></div>
          <div><dt>Horas jogadas</dt><dd>{{ record.horas_jogadas ?? "—" }}</dd></div>
          <div><dt>Canónico</dt><dd>{{ record.canonico ? "Sim" : "Não" }}</dd></div>
        </dl>

        <article v-if="record.sinopse" class="detail-section"><h2>Sinopse</h2><p class="detail-copy">{{ record.sinopse }}</p></article>
        <article v-if="record.notas_pessoais" class="detail-section"><h2>Notas pessoais</h2><p class="detail-copy">{{ record.notas_pessoais }}</p></article>
      </div>
    </section>

    <TitleAvailabilityList :title-id="record.id" />

    <section class="detail-grid">
      <article class="panel">
        <h2>Classificação e relações</h2>
        <div class="relation-groups">
          <template v-for="key in ['generos', 'tags', 'idiomas', 'pais_origem', 'plataformas', 'companhias']" :key="key">
            <div v-if="relationNames(record.expand?.[key]).length">
              <h3>{{ key.replace("_", " ") }}</h3>
              <div class="chip-list"><span v-for="item in relationNames(record.expand?.[key])" :key="item" class="chip">{{ item }}</span></div>
            </div>
          </template>
        </div>
      </article>

      <article class="panel">
        <h2>Identificadores externos</h2>
        <dl class="external-ids">
          <div><dt>TMDB</dt><dd>{{ record.tmdb_id || "—" }}</dd></div>
          <div><dt>Tipo TMDB</dt><dd>{{ record.tipo_tmdb || "—" }}</dd></div>
          <div><dt>IMDb</dt><dd>{{ record.imdb_id || "—" }}</dd></div>
          <div><dt>Record</dt><dd><code>{{ record.id }}</code></dd></div>
        </dl>
      </article>
    </section>

    <TitleArchiveDialog :open="archiveOpen" :title="record.titulo" :saving="archiving" @close="archiveOpen = false" @confirm="archive" />
  </template>
</template>
