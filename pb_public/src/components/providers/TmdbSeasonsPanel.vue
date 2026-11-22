<!-- Mediário | Fase 6C: importação controlada de temporadas e episódios TMDB. -->
<script setup lang="ts">
import { ref } from "vue";
import { importTmdbSeason, loadTmdbSeason, type TmdbSeason } from "@/domain/providers/tmdbSeasons";
import type { TitleRecord } from "@/types/records";
const props = defineProps<{ title: TitleRecord; tmdbId: number; totalSeasons: number; disabled?: boolean }>();
const emit = defineEmits<{ imported: [{ seasonCreated: boolean; episodesCreated: number; episodesUpdated: number }] }>();
const seasonNumber = ref(props.totalSeasons > 0 ? 1 : 0);
const preview = ref<TmdbSeason | null>(null);
const loading = ref(false);
const error = ref("");
async function prepare(): Promise<void> { loading.value = true; error.value = ""; try { preview.value = await loadTmdbSeason(props.tmdbId, seasonNumber.value); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
async function apply(): Promise<void> { if (!preview.value) return; loading.value = true; error.value = ""; try { emit("imported", await importTmdbSeason(props.title, preview.value)); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
</script>
<template>
  <section class="tmdb-seasons" aria-labelledby="tmdb-seasons-title">
    <div><p class="eyebrow">Estrutura da série</p><h3 id="tmdb-seasons-title">Temporadas e episódios</h3></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div class="tmdb-season-controls"><label class="form-field"><span>Temporada</span><input v-model.number="seasonNumber" type="number" min="0" :max="totalSeasons" /></label><button class="button button-secondary" type="button" :disabled="disabled || loading" @click="prepare">{{ loading ? "A carregar…" : "Pré-visualizar" }}</button></div>
    <article v-if="preview" class="tmdb-season-preview"><h4>{{ preview.name || `Temporada ${preview.season_number}` }}</h4><p>{{ preview.episodes.length }} episódios · {{ preview.air_date || "Sem data" }}</p><ul><li v-for="episode in preview.episodes" :key="episode.id"><strong>{{ episode.episode_number }}. {{ episode.name }}</strong><span>{{ episode.runtime ? `${episode.runtime} min` : "Duração desconhecida" }}</span></li></ul><button class="button button-primary" type="button" :disabled="disabled || loading" @click="apply">Importar temporada</button></article>
  </section>
</template>
