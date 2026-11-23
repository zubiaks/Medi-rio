<!--
  Mediário
  Caminho: src/components/search/GlobalSearchDialog.vue
  Versão: 1.0.0
  Domínio: Pesquisa e descoberta
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { parseSearchUrl, replaceSearchUrl } from "@/domain/search/searchUrlState";
import GlobalSearchDetailDialog from "./GlobalSearchDetailDialog.vue";
import SearchDiscoveryPanel from "./SearchDiscoveryPanel.vue";
import SearchComparisonPanel from "./SearchComparisonPanel.vue";
import {
  deleteSavedSearch,
  loadSavedSearches,
  saveSearchPreset,
  type SavedSearch,
} from "@/domain/search/savedSearches";
import {
  globalSearch,
  type GlobalSearchItem,
  type GlobalSearchResult,
  type SearchEntity,
} from "@/domain/search/globalSearch";
import {
  addSearchHistory,
  clearSearchHistory,
  loadSearchHistory,
  type SearchHistoryItem,
} from "@/domain/search/searchHistory";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; select: [GlobalSearchItem] }>();
const query = ref("");
const entities = ref<SearchEntity[]>([
  "titles", "people", "collections", "episodes", "streams", "aliases", "sources",
]);
const provider = ref("");
const yearFrom = ref<number | null>(null);
const yearTo = ref<number | null>(null);
const includeDeleted = ref(false);
const result = ref<GlobalSearchResult | null>(null);
const history = ref<SearchHistoryItem[]>([]);
const loading = ref(false);
const error = ref("");
const view = ref<"grid" | "list">("grid");
const selectedItem = ref<GlobalSearchItem | null>(null);
const comparison = ref<GlobalSearchItem[]>([]);
const savedSearches = ref<SavedSearch[]>([]);
const presetName = ref("");
const mode = ref<"search" | "discover">("search");
const entityLabels: Record<SearchEntity, string> = {
  titles: "Títulos",
  people: "Pessoas",
  collections: "Coleções",
  episodes: "Episódios",
  streams: "Streams",
  aliases: "Aliases",
  sources: "Fontes",
};

const groups = computed(() => {
  const value = result.value?.items || [];
  return entities.value
    .map((entity) => ({
      entity,
      label: entityLabels[entity],
      items: value.filter((item) => item.entity === entity),
      total: result.value?.counts[entity] || 0,
    }))
    .filter((group) => group.items.length);
});

watch(() => props.open, (open) => {
  if (!open) return;
  history.value = loadSearchHistory();
  savedSearches.value = loadSavedSearches();
  error.value = "";
  const state = parseSearchUrl(window.location.search);
  query.value = state.query || query.value;
  mode.value = state.mode || mode.value;
  view.value = state.view || view.value;
  if (state.filters) {
    entities.value = [...state.filters.entities];
    provider.value = state.filters.provider || "";
    yearFrom.value = state.filters.yearFrom || null;
    yearTo.value = state.filters.yearTo || null;
    includeDeleted.value = Boolean(state.filters.includeDeleted);
  }
  if (query.value.length >= 2 && mode.value === "search") void search();
});

function setMode(value: "search" | "discover"): void {
  mode.value = value;
  replaceSearchUrl({
    query: query.value,
    mode: value,
    view: view.value,
    filters: currentFilters(),
  });
}

function setView(value: "grid" | "list"): void {
  view.value = value;
  replaceSearchUrl({
    query: query.value,
    mode: mode.value,
    view: value,
    filters: currentFilters(),
  });
}

function currentFilters() {
  return {
    entities: entities.value,
    provider: provider.value,
    yearFrom: yearFrom.value,
    yearTo: yearTo.value,
    includeDeleted: includeDeleted.value,
  };
}

function savePreset(): void {
  try {
    savedSearches.value = saveSearchPreset(
      presetName.value,
      query.value,
      currentFilters(),
    );
    presetName.value = "";
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

function applyPreset(preset: SavedSearch): void {
  query.value = preset.query;
  entities.value = [...preset.filters.entities];
  provider.value = preset.filters.provider || "";
  yearFrom.value = preset.filters.yearFrom || null;
  yearTo.value = preset.filters.yearTo || null;
  includeDeleted.value = Boolean(preset.filters.includeDeleted);
  mode.value = "search";
  void search();
}

function removePreset(id: string): void {
  savedSearches.value = deleteSavedSearch(id);
}

function addComparison(item: GlobalSearchItem): void {
  if (item.entity !== "titles") return;
  if (comparison.value.some((value) => value.id === item.id)) return;
  comparison.value = [...comparison.value, item].slice(-4);
}

function removeComparison(id: string): void {
  comparison.value = comparison.value.filter((item) => item.id !== id);
}

async function search(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    result.value = await globalSearch(query.value, {
      entities: entities.value,
      provider: provider.value,
      yearFrom: yearFrom.value,
      yearTo: yearTo.value,
      includeDeleted: includeDeleted.value,
    });
    history.value = addSearchHistory(query.value);
    replaceSearchUrl({
      query: query.value,
      mode: mode.value,
      view: view.value,
      filters: currentFilters(),
    });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    result.value = null;
  } finally {
    loading.value = false;
  }
}

function useHistory(value: string): void {
  query.value = value;
  void search();
}

function clearHistory(): void {
  clearSearchHistory();
  history.value = [];
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="!loading && emit('close')">
      <section class="dialog-panel global-search-dialog" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
        <div class="dialog-header">
          <div><p class="eyebrow">Fase 9.0</p><h2 id="global-search-title">Pesquisa e descoberta</h2></div>
          <button class="icon-button" type="button" aria-label="Fechar" :disabled="loading" @click="emit('close')">×</button>
        </div>

        <div class="global-search-mode-tabs" role="tablist" aria-label="Modo da pesquisa">
          <button class="button button-secondary" :class="{ 'is-active': mode === 'search' }" type="button" role="tab" :aria-selected="mode === 'search'" @click="setMode('search')">Pesquisar</button>
          <button class="button button-secondary" :class="{ 'is-active': mode === 'discover' }" type="button" role="tab" :aria-selected="mode === 'discover'" @click="setMode('discover')">Descobrir</button>
        </div>

        <SearchDiscoveryPanel v-if="mode === 'discover'" @select="selectedItem = $event" />

        <template v-if="mode === 'search'">
        <form class="global-search-form" @submit.prevent="search">
          <label class="form-field field-wide"><span>Pesquisar em todo o Mediário</span><input v-model.trim="query" type="search" placeholder="Título, pessoa, episódio, coleção, alias ou identificador" autofocus required /></label>
          <button class="button button-primary" type="submit" :disabled="loading">{{ loading ? "A pesquisar…" : "Pesquisar" }}</button>
        </form>

        <details class="global-search-filters">
          <summary>Filtros avançados</summary>
          <fieldset><legend>Entidades</legend><label v-for="(label, key) in entityLabels" :key="key" class="check-field"><input v-model="entities" type="checkbox" :value="key" /> {{ label }}</label></fieldset>
          <div class="global-search-filter-grid">
            <label class="form-field"><span>Provider</span><select v-model="provider"><option value="">Todos</option><option value="tmdb">TMDB</option><option value="omdb">OMDb</option></select></label>
            <label class="form-field"><span>Ano mínimo</span><input v-model.number="yearFrom" type="number" min="1800" max="2200" /></label>
            <label class="form-field"><span>Ano máximo</span><input v-model.number="yearTo" type="number" min="1800" max="2200" /></label>
            <label class="check-field"><input v-model="includeDeleted" type="checkbox" /> Incluir títulos apagados</label>
          </div>
        </details>

        <section class="saved-searches">
          <div class="saved-search-create"><label class="form-field"><span>Nome da pesquisa guardada</span><input v-model.trim="presetName" placeholder="Ex.: Ficção científica dos anos 80" /></label><button class="button button-secondary" type="button" :disabled="!presetName || query.length < 2" @click="savePreset">Guardar pesquisa</button></div>
          <ul v-if="savedSearches.length"><li v-for="preset in savedSearches" :key="preset.id"><button type="button" @click="applyPreset(preset)"><strong>{{ preset.name }}</strong><small>{{ preset.query }}</small></button><button class="icon-button" type="button" :aria-label="`Eliminar ${preset.name}`" @click="removePreset(preset.id)">×</button></li></ul>
        </section>

        <div v-if="history.length && !result" class="search-history">
          <div><h3>Pesquisas recentes</h3><button class="button button-secondary" type="button" @click="clearHistory">Limpar</button></div>
          <button v-for="item in history" :key="item.query" type="button" @click="useHistory(item.query)">{{ item.query }}</button>
        </div>

        <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>

        <template v-if="result">
          <div class="global-search-summary">
            <p><strong>{{ result.total }}</strong> resultado{{ result.total === 1 ? "" : "s" }} para “{{ result.query }}”</p>
            <div><button class="button button-secondary" :class="{ 'is-active': view === 'grid' }" type="button" @click="setView('grid')">Grelha</button><button class="button button-secondary" :class="{ 'is-active': view === 'list' }" type="button" @click="setView('list')">Lista</button></div>
          </div>

          <p v-if="!groups.length" class="form-alert">Não foram encontrados resultados com estes filtros.</p>
          <section v-for="group in groups" :key="group.entity" class="global-search-group">
            <header><h3>{{ group.label }}</h3><span>{{ group.total }}</span></header>
            <div :class="view === 'grid' ? 'global-search-grid' : 'global-search-list'">
              <button v-for="item in group.items" :key="`${item.entity}-${item.id}`" type="button" class="global-search-card" @click="selectedItem = item">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="" loading="lazy" />
                <span v-else class="global-search-fallback" aria-hidden="true">◇</span>
                <span class="global-search-card-body"><strong>{{ item.title }}</strong><small>{{ item.subtitle || entityLabels[item.entity] }}</small><span v-if="item.description">{{ item.description }}</span><code>{{ item.id }}</code><span v-if="item.entity === 'titles'" class="comparison-action" role="button" tabindex="0" @click.stop="addComparison(item)" @keydown.enter.stop="addComparison(item)">Comparar</span></span>
              </button>
            </div>
          </section>
        </template>

        <SearchComparisonPanel :items="comparison" @remove="removeComparison" @clear="comparison = []" />
        </template>
        <div class="form-actions"><button class="button button-secondary" type="button" :disabled="loading" @click="emit('close')">Fechar</button></div>
        <GlobalSearchDetailDialog
          :item="selectedItem"
          @close="selectedItem = null"
          @use="emit('select', $event)"
        />
      </section>
    </div>
  </Teleport>
</template>
