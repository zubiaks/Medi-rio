<!--
  Projeto: Mediário
  Versão do projeto: 0.3.0-alpha.1

  Ficheiro: src/views/IptvView.vue
  Versão do ficheiro: 1.0.0
  Tipo: Página Vue 3 com TypeScript
  Domínio: IPTV
  Estado: Em migração de Live para IPTV
  Última revisão: 2026-11-21

  Compatibilidade:
  - Vue 3
  - TypeScript 5.9.2 em modo strict
  - Vite 8
  - Vue Router
  - PocketBase JavaScript SDK
  - Coleções PocketBase existentes, sem alteração de esquema

  Finalidade:
  Apresenta e gere a biblioteca de canais IPTV.

  Responsabilidades:
  - Carregar, pesquisar, filtrar e paginar canais IPTV.
  - Alternar entre grelha, logótipos, lista e vista compacta.
  - Abrir detalhes e edição de canais.
  - Carregar a fonte principal e as fontes alternativas.
  - Atualizar o estado local depois de editar ou arquivar um canal.

  Relações e dependências:
  - Rota:
    src/router/index.ts
    URL principal: /iptv
    Nome da rota: iptv
    Compatibilidade: /tv redireciona para /iptv

  - Navegação:
    src/components/layout/AppSidebar.vue
    src/App.vue

  - Componentes utilizados:
    src/components/iptv/ChannelCard.vue
    src/components/iptv/ChannelFilters.vue
    src/components/iptv/GridSizeSlider.vue
    src/components/iptv/ChannelDetailDialog.vue
    src/components/iptv/ChannelEditDialog.vue
    src/components/base/BasePageHeader.vue
    src/components/base/BaseEmptyState.vue
    src/components/base/BasePagination.vue

  - Repositórios utilizados:
    src/domain/repositories.ts
    iptvChannelRepository
    iptvSourceRepository
    countryRepository
    languageRepository
    tagRepository
    iptvCategoryRepository

  - Domínio utilizado:
    src/domain/iptv/filterOptions.ts

  - Tipos utilizados:
    src/types/records.ts
    IptvChannelRecord
    IptvSourceRecord
    IptvCategoryRecord
    NamedRecord

  - Coleções PocketBase:
    canais_tv
    stream_links
    categorias_tv
    paises
    idiomas
    tags

  - Preferências locais:
    Chave: mediario-iptv-grid-width
    Finalidade: guardar a largura escolhida para os cartões IPTV.

  - Estilos relacionados:
    src/styles/iptv.css
    src/styles/iptv-all.css
    src/styles/iptv-grid-control.css
    src/styles/iptv-links-player.css
    src/styles/iptv-ux-fixes.css

  - Testes relacionados:
    src/components/iptv/ChannelCard.a11y.spec.ts
    src/components/iptv/ChannelEditDialog.a11y.spec.ts
    src/components/iptv/GridSizeSlider.a11y.spec.ts
    src/domain/iptv/validation.spec.ts
    src/domain/iptv/linkValidation.spec.ts
    src/domain/iptv/m3u.spec.ts

  Fluxo de dados:
  1. A rota carrega LiveView.
  2. LiveView solicita records aos repositórios.
  3. Os repositórios comunicam com PocketBase.
  4. LiveView passa records tipados aos componentes.
  5. Os componentes emitem eventos de abertura, edição ou alteração.
  6. LiveView atualiza os canais, o canal selecionado e as fontes.

  Usado por:
  - src/router/index.ts
  - Rota /iptv
  - Navegação de src/components/layout/AppSidebar.vue
  - Ação rápida de src/App.vue

  Impacto de alterações:
  - Alterar props ou eventos afeta os componentes relacionados.
  - Alterar IptvChannelRecord afeta cartões, filtros e diálogos.
  - Alterar IptvSourceRecord afeta detalhes, player e gestão de fontes.
  - Alterar nomes de campos exige migração PocketBase.
  - A rota antiga /tv deve continuar a redirecionar para /iptv.
  - Alterar a chave localStorage pode perder preferências existentes.
  - Renomear components/live ou domain/live exige atualizar todos os imports.
  - Alterações de compatibilidade exigem atualizar este cabeçalho.

  Regras:
  - Não consultar PocketBase diretamente nesta página.
  - Usar repositórios de src/domain/repositories.ts.
  - Manter validações e transformações na camada de domínio.
  - Usar aliases Iptv* nesta área.
  - Tratar fontes como detalhes técnicos dos canais.
  - Não alterar coleções ou campos sem migração documentada.
  - Preservar acessibilidade, TypeScript strict e vue-tsc.
  - Guardar o ficheiro como UTF-8 sem BOM.
  - Atualizar a versão do ficheiro em mudanças relevantes.
  - Validar com type-check, testes, build e git diff --check.

  Política de versão do ficheiro:
  - PATCH: correções internas, texto, acessibilidade ou documentação.
  - MINOR: novas funcionalidades compatíveis ou novas relações.
  - MAJOR: alteração incompatível de props, eventos, rota ou fluxo de dados.

  Autor:
  Zubiaks

  Copyright:
  Copyright (c) 2026 Zubiaks.

  Licença:
  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<!--
  Ficheiro: src/views/IptvView.vue
  Tipo: Página Vue.
  Função: Gere a biblioteca IPTV, os canais configurados e as respetivas fontes.

  Mediario
  Copyright (c) 2026 Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import BasePagination from "@/components/base/BasePagination.vue";

import ChannelCard from "@/components/iptv/ChannelCard.vue";
import ChannelDetailDialog from "@/components/iptv/ChannelDetailDialog.vue";
import ChannelEditDialog from "@/components/iptv/ChannelEditDialog.vue";
import ChannelFilters from "@/components/iptv/ChannelFilters.vue";
import GridSizeSlider from "@/components/iptv/GridSizeSlider.vue";

import {
  iptvChannelRepository,
  countryRepository,
  languageRepository,
  iptvSourceRepository,
  tagRepository,
  iptvCategoryRepository,
} from "@/domain/repositories";

import {
  usedCategories,
  usedCountries,
  usedQualities,
} from "@/domain/iptv/filterOptions";

import type {
  IptvCategoryRecord,
  IptvChannelRecord,
  IptvSourceRecord,
  NamedRecord,
} from "@/types/records";

type IptvViewMode = "grid" | "logos" | "list" | "compact";

const IPTV_GRID_WIDTH_STORAGE_KEY = "mediario-iptv-grid-width";
const MIN_GRID_CARD_WIDTH = 170;
const MAX_GRID_CARD_WIDTH = 420;
const DEFAULT_GRID_CARD_WIDTH = 250;
const CHANNELS_PER_PAGE = 18;

const channels = ref<IptvChannelRecord[]>([]);
const allChannels = ref<IptvChannelRecord[]>([]);

const page = ref(1);
const pages = ref(1);
const total = ref(0);

const loading = ref(true);
const error = ref("");

const search = ref("");
const country = ref("");
const category = ref("");
const quality = ref("");
const status = ref("");
const favorite = ref("");

const view = ref<IptvViewMode>("grid");

const storedGridCardWidth = Number(
  localStorage.getItem(IPTV_GRID_WIDTH_STORAGE_KEY),
);

const gridCardWidth = ref<number>(
  Math.min(
    MAX_GRID_CARD_WIDTH,
    Math.max(
      MIN_GRID_CARD_WIDTH,
      storedGridCardWidth || DEFAULT_GRID_CARD_WIDTH,
    ),
  ),
);

const countries = ref<NamedRecord[]>([]);
const languages = ref<NamedRecord[]>([]);
const tags = ref<NamedRecord[]>([]);
const categories = ref<IptvCategoryRecord[]>([]);

const selectedChannel = ref<IptvChannelRecord | null>(null);
const editingChannel = ref<IptvChannelRecord | null>(null);

const channelSources = ref<IptvSourceRecord[]>([]);
const sourcesLoading = ref(false);

let filterTimer: ReturnType<typeof setTimeout> | undefined;

const countryOptions = computed(() =>
  usedCountries(allChannels.value, countries.value),
);

const categoryOptions = computed(() =>
  usedCategories(allChannels.value, categories.value),
);

const qualityOptions = computed(() =>
  usedQualities(allChannels.value),
);

const filterCount = computed(() =>
  [
    search.value,
    country.value,
    category.value,
    quality.value,
    status.value,
    favorite.value,
  ].filter(Boolean).length,
);

const channelCountDescription = computed(() =>
  total.value === 1
    ? "1 canal configurado"
    : `${total.value} canais configurados`,
);

function escapeFilter(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"');
}

function buildChannelFilter(): string {
  const terms = ["cemiterio = false"];
  const searchTerm = search.value.trim();

  if (searchTerm) {
    const escapedSearch = escapeFilter(searchTerm);

    terms.push(
      `(nome ~ "${escapedSearch}" || tvg_name ~ "${escapedSearch}" || tvg_id ~ "${escapedSearch}" || epg_id ~ "${escapedSearch}" || playlist_origem ~ "${escapedSearch}")`,
    );
  }

  if (country.value) {
    terms.push(`pais = "${escapeFilter(country.value)}"`);
  }

  if (category.value) {
    terms.push(`categoria = "${escapeFilter(category.value)}"`);
  }

  if (quality.value) {
    terms.push(`qualidade = "${escapeFilter(quality.value)}"`);
  }

  if (status.value) {
    terms.push(`ativo = ${status.value === "active"}`);
  }

  if (favorite.value) {
    terms.push(`favorito = ${favorite.value === "yes"}`);
  }

  return terms.join(" && ");
}

async function loadLibrary(): Promise<void> {
  loading.value = true;
  error.value = "";

  try {
    const result = await iptvChannelRepository.list({
      page: page.value,
      perPage: CHANNELS_PER_PAGE,
      filter: buildChannelFilter(),
      sort: "ordem,nome",
      expand: "pais,categoria,idiomas,tags",
    });

    channels.value = result.items;
    pages.value = result.totalPages || 1;
    total.value = result.totalItems;
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : String(cause);

    channels.value = [];
    pages.value = 1;
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

async function loadAllChannels(): Promise<void> {
  const result: IptvChannelRecord[] = [];

  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await iptvChannelRepository.list({
      page: currentPage,
      perPage: 500,
      filter: "cemiterio = false",
      sort: "nome",
    });

    result.push(...response.items);

    totalPages = response.totalPages || 1;
    currentPage += 1;
  } while (currentPage <= totalPages);

  allChannels.value = result;
}

async function loadLookups(): Promise<void> {
  const [
    countryResult,
    categoryResult,
    languageResult,
    tagResult,
  ] = await Promise.all([
    countryRepository.list({
      page: 1,
      perPage: 250,
      filter: "ativo = true",
      sort: "ordem,nome",
    }),
    iptvCategoryRepository.list({
      page: 1,
      perPage: 100,
      filter: "ativo = true",
      sort: "ordem,nome",
    }),
    languageRepository.list({
      page: 1,
      perPage: 100,
      filter: "ativo = true",
      sort: "ordem,nome",
    }),
    tagRepository.list({
      page: 1,
      perPage: 200,
      filter: "ativo = true",
      sort: "ordem,nome",
    }),
  ]);

  countries.value = countryResult.items;
  categories.value = categoryResult.items;
  languages.value = languageResult.items;
  tags.value = tagResult.items;
}

async function openChannel(
  channel: IptvChannelRecord,
): Promise<void> {
  selectedChannel.value = channel;
  channelSources.value = [];
  sourcesLoading.value = true;

  try {
    const result = await iptvSourceRepository.list({
      page: 1,
      perPage: 100,
      filter: `canal_tv = "${channel.id}"`,
      sort: "prioridade",
    });

    channelSources.value = result.items;
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : String(cause);

    channelSources.value = [];
  } finally {
    sourcesLoading.value = false;
  }
}

function updateChannel(
  channel: IptvChannelRecord,
): void {
  channels.value = channels.value.map((currentChannel) =>
    currentChannel.id === channel.id
      ? channel
      : currentChannel,
  );

  allChannels.value = allChannels.value.map((currentChannel) =>
    currentChannel.id === channel.id
      ? channel
      : currentChannel,
  );

  if (selectedChannel.value?.id === channel.id) {
    selectedChannel.value = channel;
  }
}

function handleChannelSaved(
  channel: IptvChannelRecord,
): void {
  updateChannel(channel);
  editingChannel.value = null;
}

function handleChannelArchived(id: string): void {
  channels.value = channels.value.filter(
    (channel) => channel.id !== id,
  );

  allChannels.value = allChannels.value.filter(
    (channel) => channel.id !== id,
  );

  if (selectedChannel.value?.id === id) {
    selectedChannel.value = null;
    channelSources.value = [];
  }

  editingChannel.value = null;
  total.value = Math.max(0, total.value - 1);
}

function clearFilters(): void {
  search.value = "";
  country.value = "";
  category.value = "";
  quality.value = "";
  status.value = "";
  favorite.value = "";

  page.value = 1;

  void loadLibrary();
}

function changePage(nextPage: number): void {
  page.value = nextPage;
  void loadLibrary();
}

watch(gridCardWidth, (value) => {
  localStorage.setItem(
    IPTV_GRID_WIDTH_STORAGE_KEY,
    String(value),
  );
});

watch(
  [
    search,
    country,
    category,
    quality,
    status,
    favorite,
  ],
  () => {
    if (filterTimer) {
      clearTimeout(filterTimer);
    }

    filterTimer = setTimeout(() => {
      page.value = 1;
      void loadLibrary();
    }, 250);
  },
);

watch(countryOptions, (options) => {
  if (
    country.value &&
    !options.some((option) => option.value === country.value)
  ) {
    country.value = "";
  }
});

watch(categoryOptions, (options) => {
  if (
    category.value &&
    !options.some((option) => option.value === category.value)
  ) {
    category.value = "";
  }
});

watch(qualityOptions, (options) => {
  if (
    quality.value &&
    !options.some((option) => option.value === quality.value)
  ) {
    quality.value = "";
  }
});

onMounted(async () => {
  try {
    await Promise.all([
      loadLookups(),
      loadAllChannels(),
    ]);

    await loadLibrary();
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : String(cause);

    loading.value = false;
  }
});
</script>

<template>
  <BasePageHeader
    eyebrow="Televisão IP"
    title="IPTV"
    :description="channelCountDescription"
  >
    <template #actions>
      <button
        class="button button-primary"
        type="button"
        disabled
      >
        ⇩ Importar M3U, em breve
      </button>
    </template>
  </BasePageHeader>

  <div
    v-if="error"
    class="form-alert form-alert-error"
    role="alert"
  >
    {{ error }}
  </div>

  <ChannelFilters
    v-model:search="search"
    v-model:country="country"
    v-model:category="category"
    v-model:quality="quality"
    v-model:status="status"
    v-model:favorite="favorite"
    :countries="countryOptions"
    :categories="categoryOptions"
    :qualities="qualityOptions"
    :count="filterCount"
    @clear="clearFilters"
  />

  <div class="section-heading">
    <div>
      <p class="eyebrow">Biblioteca</p>
      <h2>Canais IPTV</h2>
    </div>

    <div class="live-view-tools">
      <GridSizeSlider
        v-if="view === 'grid' || view === 'logos'"
        v-model="gridCardWidth"
      />

      <div
        class="view-switch"
        role="group"
        aria-label="Vista dos canais IPTV"
      >
        <button
          type="button"
          :class="{ 'is-active': view === 'grid' }"
          :aria-pressed="view === 'grid'"
          @click="view = 'grid'"
        >
          ▦ Grelha
        </button>

        <button
          type="button"
          :class="{ 'is-active': view === 'logos' }"
          :aria-pressed="view === 'logos'"
          @click="view = 'logos'"
        >
          ▦ Logos
        </button>

        <button
          type="button"
          :class="{ 'is-active': view === 'list' }"
          :aria-pressed="view === 'list'"
          @click="view = 'list'"
        >
          ☰ Lista
        </button>

        <button
          type="button"
          :class="{ 'is-active': view === 'compact' }"
          :aria-pressed="view === 'compact'"
          @click="view = 'compact'"
        >
          ≡ Compacta
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="loading"
    class="page-loading"
    aria-live="polite"
  >
    <span
      class="loader"
      aria-hidden="true"
    />

    <span class="sr-only">
      A carregar canais IPTV.
    </span>
  </div>

  <div
    v-else-if="channels.length"
    class="live-collection"
    :class="`is-${view}`"
    :style="
      view === 'grid' || view === 'logos'
        ? {
            gridTemplateColumns:
              `repeat(auto-fill, minmax(min(${gridCardWidth}px, 100%), 1fr))`,
          }
        : undefined
    "
  >
    <ChannelCard
      v-for="channel in channels"
      :key="channel.id"
      :channel="channel"
      :view="view"
      @open="openChannel"
      @edit="editingChannel = $event"
    />
  </div>

  <BaseEmptyState
    v-else
    icon="▣"
    title="Sem canais IPTV"
    description="Não existem canais IPTV para os filtros selecionados."
  />

  <BasePagination
    :page="page"
    :pages="pages"
    label="Paginação dos canais IPTV"
    @change="changePage"
  />

  <ChannelDetailDialog
    :channel="selectedChannel"
    :links="channelSources"
    :loading="sourcesLoading"
    @close="selectedChannel = null"
    @edit="editingChannel = $event"
    @links-changed="channelSources = $event"
    @channel-changed="updateChannel"
  />

  <ChannelEditDialog
    :channel="editingChannel"
    :countries="countries"
    :languages="languages"
    :tags="tags"
    :categories="categories"
    @close="editingChannel = null"
    @saved="handleChannelSaved"
    @archived="handleChannelArchived"
  />
</template>

<style scoped>
.live-view-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 700px) {
  .live-view-tools {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }
}
</style>