<!--
  Projeto: Mediário
  Ficheiro: src/components/providers/TmdbSearchDialog.vue
  Versão do ficheiro: 1.0.0
  Tipo: Diálogo Vue 3 com TypeScript
  Domínio: Providers — TMDB

  Finalidade:
  Pesquisa o TMDB através do backend local e associa o resultado escolhido a
  um título existente através de `fontes_externas`.
-->
<script setup lang="ts">
import { ref, watch } from "vue";
import { titleRepository } from "@/domain/repositories";
import { externalSourceRepository } from "@/domain/providers/repository";
import {
  loadTmdbDetails,
  searchTmdb,
  type TmdbDetailType,
  type TmdbMediaType,
  type TmdbSearchResult,
} from "@/domain/providers/tmdbClient";
import { tmdbSourcePayload } from "@/domain/providers/tmdbMapping";
import type { ExternalSourceRecord } from "@/domain/providers/records";
import type { TitleRecord } from "@/types/records";

const props = defineProps<{
  open: boolean;
  existing: ExternalSourceRecord[];
}>();
const emit = defineEmits<{
  close: [];
  saved: [ExternalSourceRecord];
}>();

const query = ref("");
const mediaType = ref<TmdbMediaType>("multi");
const results = ref<TmdbSearchResult[]>([]);
const selectedResult = ref<TmdbSearchResult | null>(null);
const titleQuery = ref("");
const titleResults = ref<TitleRecord[]>([]);
const selectedTitle = ref<TitleRecord | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
let titleTimer: ReturnType<typeof setTimeout> | undefined;

watch(() => props.open, (open) => {
  if (!open) return;
  query.value = "";
  mediaType.value = "multi";
  results.value = [];
  selectedResult.value = null;
  titleQuery.value = "";
  titleResults.value = [];
  selectedTitle.value = null;
  error.value = "";
});

watch(titleQuery, (value) => {
  if (titleTimer) clearTimeout(titleTimer);
  if (value.trim().length < 2) {
    titleResults.value = [];
    return;
  }

  titleTimer = setTimeout(async () => {
    const slash = String.fromCharCode(92);
    const escaped = value
      .trim()
      .split(slash)
      .join(slash + slash)
      .split('"')
      .join(slash + '"');

    titleResults.value = (
      await titleRepository.list({
        page: 1,
        perPage: 20,
        filter:
          `apagado = false && (titulo ~ "${escaped}" || ` +
          `titulo_original ~ "${escaped}")`,
        sort: "titulo",
      })
    ).items;
  }, 300);
});

async function runSearch(): Promise<void> {
  if (query.value.trim().length < 2) {
    error.value = "Escreve pelo menos dois caracteres.";
    return;
  }

  loading.value = true;
  error.value = "";
  selectedResult.value = null;

  try {
    const response = await searchTmdb(query.value.trim(), mediaType.value);
    results.value = response.results.filter((result) =>
      ["movie", "tv"].includes(result.media_type),
    );
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    results.value = [];
  } finally {
    loading.value = false;
  }
}

function selectResult(result: TmdbSearchResult): void {
  selectedResult.value = result;
  titleQuery.value = result.title;
}

function selectTitle(title: TitleRecord): void {
  selectedTitle.value = title;
  titleQuery.value = `${title.titulo}${title.ano ? ` (${title.ano})` : ""}`;
  titleResults.value = [];
}

async function save(): Promise<void> {
  if (!selectedResult.value || !selectedTitle.value) {
    error.value = "Selecciona um resultado TMDB e um título do catálogo.";
    return;
  }

  const duplicate = props.existing.find(
    (source) =>
      source.provider === "tmdb" &&
      source.external_id === String(selectedResult.value?.id) &&
      source.tipo_externo ===
        (selectedResult.value?.media_type === "tv" ? "tv" : "movie"),
  );

  if (duplicate) {
    error.value = "Este resultado TMDB já está associado no Mediário.";
    return;
  }

  saving.value = true;
  error.value = "";

  try {
    const detailType = selectedResult.value.media_type as TmdbDetailType;
    const details = await loadTmdbDetails(detailType, selectedResult.value.id);
    const saved = await externalSourceRepository.create(
      tmdbSourcePayload(selectedTitle.value.id, selectedResult.value, details),
    );
    emit("saved", saved);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="dialog-backdrop"
      @click.self="!saving && emit('close')"
    >
      <section
        class="dialog-panel tmdb-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tmdb-search-title"
      >
        <div class="dialog-header">
          <div>
            <p class="eyebrow">Provider TMDB</p>
            <h2 id="tmdb-search-title">Pesquisar e associar</h2>
          </div>
          <button
            class="icon-button"
            type="button"
            aria-label="Fechar"
            :disabled="saving"
            @click="emit('close')"
          >×</button>
        </div>

        <div v-if="error" class="form-alert form-alert-error" role="alert">
          {{ error }}
        </div>

        <form class="tmdb-search-form" @submit.prevent="runSearch">
          <label class="form-field">
            <span>Pesquisa TMDB</span>
            <input
              v-model.trim="query"
              type="search"
              placeholder="Título do filme ou série"
              required
            />
          </label>
          <label class="form-field">
            <span>Tipo</span>
            <select v-model="mediaType">
              <option value="multi">Filmes e séries</option>
              <option value="movie">Filmes</option>
              <option value="tv">Séries</option>
            </select>
          </label>
          <button class="button button-secondary" type="submit" :disabled="loading">
            {{ loading ? "A pesquisar…" : "Pesquisar" }}
          </button>
        </form>

        <div v-if="results.length" class="tmdb-result-grid">
          <button
            v-for="result in results"
            :key="`${result.media_type}-${result.id}`"
            type="button"
            class="tmdb-result-card"
            :class="{ 'is-selected': selectedResult?.id === result.id }"
            @click="selectResult(result)"
          >
            <img
              v-if="result.poster_url"
              :src="result.poster_url"
              :alt="`Capa de ${result.title}`"
            />
            <span v-else class="tmdb-poster-fallback" aria-hidden="true">◇</span>
            <strong>{{ result.title }}</strong>
            <small>
              {{ result.media_type === "tv" ? "Série" : "Filme" }} ·
              {{ result.date?.slice(0, 4) || "—" }}
            </small>
            <span>{{ result.vote_average.toFixed(1) }} / 10</span>
          </button>
        </div>

        <section v-if="selectedResult" class="tmdb-association">
          <h3>Associar ao catálogo</h3>
          <label class="form-field">
            <span>Título existente *</span>
            <input
              v-model.trim="titleQuery"
              type="search"
              placeholder="Pesquisar no catálogo Mediário"
            />
          </label>
          <ul v-if="titleResults.length" class="provider-title-results">
            <li v-for="title in titleResults" :key="title.id">
              <button type="button" @click="selectTitle(title)">
                {{ title.titulo }}
                <span>{{ title.ano || "—" }}</span>
              </button>
            </li>
          </ul>
          <p v-if="selectedTitle">
            Seleccionado: <strong>{{ selectedTitle.titulo }}</strong>
          </p>
        </section>

        <div class="form-actions">
          <button
            class="button button-secondary"
            type="button"
            :disabled="saving"
            @click="emit('close')"
          >Cancelar</button>
          <button
            class="button button-primary"
            type="button"
            :disabled="saving || !selectedResult || !selectedTitle"
            @click="save"
          >{{ saving ? "A associar…" : "Associar resultado" }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
