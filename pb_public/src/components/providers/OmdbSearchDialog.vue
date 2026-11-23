<!-- Mediário | Marco OMDb 0.8.0, Fase 8A: pesquisa e detalhe de leitura. -->
<script setup lang="ts">
import { ref, watch } from "vue";
import {
  loadOmdbDetails,
  searchOmdb,
  type OmdbDetails,
  type OmdbSearchResult,
  type OmdbType,
} from "@/domain/providers/omdbClient";
import { omdbTitlePayload } from "@/domain/providers/omdbMapping";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const query = ref("");
const type = ref<OmdbType>("");
const year = ref("");
const results = ref<OmdbSearchResult[]>([]);
const selected = ref<OmdbSearchResult | null>(null);
const details = ref<OmdbDetails | null>(null);
const loading = ref(false);
const error = ref("");

watch(() => props.open, (open) => {
  if (!open) return;
  query.value = ""; type.value = ""; year.value = ""; results.value = [];
  selected.value = null; details.value = null; error.value = "";
});

async function runSearch(): Promise<void> {
  if (query.value.trim().length < 2) {
    error.value = "Escreve pelo menos dois caracteres.";
    return;
  }
  loading.value = true; error.value = ""; selected.value = null; details.value = null;
  try {
    const response = await searchOmdb(query.value.trim(), type.value, year.value);
    results.value = response.results;
    if (!response.results.length) error.value = response.message || "Nenhum resultado encontrado.";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function choose(item: OmdbSearchResult): Promise<void> {
  selected.value = item; loading.value = true; error.value = "";
  try { details.value = await loadOmdbDetails(item.imdb_id); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}
</script>

<template>
  <Teleport to="body"><div v-if="open" class="dialog-backdrop" @click.self="!loading && emit('close')"><section class="dialog-panel omdb-search-dialog" role="dialog" aria-modal="true" aria-labelledby="omdb-search-title">
    <div class="dialog-header"><div><p class="eyebrow">Provider OMDb</p><h2 id="omdb-search-title">Pesquisar e pré-visualizar</h2></div><button class="icon-button" type="button" aria-label="Fechar" :disabled="loading" @click="emit('close')">×</button></div>
    <p class="form-alert">Fase 8A apenas de leitura. A aplicação controlada dos campos será adicionada no lote seguinte.</p>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <form class="omdb-search-form" @submit.prevent="runSearch"><label class="form-field"><span>Pesquisa OMDb</span><input v-model.trim="query" type="search" required /></label><label class="form-field"><span>Tipo</span><select v-model="type"><option value="">Todos</option><option value="movie">Filme</option><option value="series">Série</option><option value="episode">Episódio</option></select></label><label class="form-field"><span>Ano</span><input v-model.trim="year" inputmode="numeric" pattern="\d{4}" maxlength="4" /></label><button class="button button-primary" type="submit" :disabled="loading">{{ loading ? "A pesquisar…" : "Pesquisar" }}</button></form>
    <div v-if="results.length" class="omdb-result-grid"><button v-for="item in results" :key="item.imdb_id" type="button" class="omdb-result-card" :class="{ 'is-selected': selected?.imdb_id === item.imdb_id }" @click="choose(item)"><img v-if="item.poster_url" :src="item.poster_url" :alt="`Poster de ${item.title}`" loading="lazy" /><span v-else class="tmdb-poster-fallback" aria-hidden="true">◇</span><strong>{{ item.title }}</strong><small>{{ item.year }} · {{ item.type }}</small><code>{{ item.imdb_id }}</code></button></div>
    <article v-if="details" class="omdb-detail"><div><img v-if="details.poster_url" :src="details.poster_url" :alt="`Poster de ${details.title}`" /><div><h3>{{ details.title }}</h3><p>{{ details.year }} · {{ details.runtime || "Duração desconhecida" }} · {{ details.rated || "Sem classificação" }}</p><p>{{ details.plot }}</p></div></div><dl><div><dt>IMDb</dt><dd>{{ details.imdb_rating ?? "—" }} · {{ details.imdb_votes ?? 0 }} votos</dd></div><div><dt>Metascore</dt><dd>{{ details.metascore ?? "—" }}</dd></div><div><dt>Realização</dt><dd>{{ details.director || "—" }}</dd></div><div><dt>Elenco</dt><dd>{{ details.actors || "—" }}</dd></div></dl><details><summary>Pré-visualizar payload Mediário</summary><pre>{{ JSON.stringify(omdbTitlePayload(details), null, 2) }}</pre></details></article>
    <div class="form-actions"><button class="button button-secondary" type="button" :disabled="loading" @click="emit('close')">Fechar</button></div>
  </section></div></Teleport>
</template>
