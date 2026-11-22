<!-- Mediário | Fase 6E: seleção controlada de imagens TMDB. -->
<script setup lang="ts">
import { computed, ref } from "vue";
import type { TitleRecord } from "@/types/records";
import type { TmdbDetailType } from "@/domain/providers/tmdbClient";
import { applyTmdbImages, loadTmdbImages, type TmdbImage, type TmdbImageKind, type TmdbImagesResponse } from "@/domain/providers/tmdbImages";
const props = defineProps<{ title: TitleRecord; tmdbId: number; mediaType: TmdbDetailType; disabled?: boolean }>();
const emit = defineEmits<{ applied: [Record<string, string>] }>();
const images = ref<TmdbImagesResponse | null>(null);
const kind = ref<TmdbImageKind>("poster");
const selected = ref<Partial<Record<TmdbImageKind, TmdbImage>>>({});
const loading = ref(false);
const error = ref("");
const current = computed(() => kind.value === "poster" ? images.value?.posters || [] : kind.value === "backdrop" ? images.value?.backdrops || [] : images.value?.logos || []);
async function load(): Promise<void> { loading.value = true; error.value = ""; try { images.value = await loadTmdbImages(props.mediaType, props.tmdbId); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
function choose(image: TmdbImage): void { selected.value = { ...selected.value, [kind.value]: image }; }
async function apply(): Promise<void> { loading.value = true; error.value = ""; try { emit("applied", await applyTmdbImages(props.title, selected.value)); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
</script>
<template>
  <section class="tmdb-images" aria-labelledby="tmdb-images-title">
    <div class="tmdb-enrichment-header"><div><p class="eyebrow">Imagens externas</p><h3 id="tmdb-images-title">Galeria TMDB</h3></div><button v-if="!images" class="button button-secondary" type="button" :disabled="disabled || loading" @click="load">{{ loading ? "A carregar…" : "Carregar galeria" }}</button></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <template v-if="images">
      <div class="tmdb-image-tabs" role="tablist" aria-label="Tipos de imagem"><button v-for="item in ([['poster','Posters'],['backdrop','Backdrops'],['logo','Logótipos']] as const)" :key="item[0]" type="button" class="button button-secondary" :class="{ 'is-active': kind === item[0] }" @click="kind = item[0]">{{ item[1] }}</button></div>
      <div class="tmdb-image-grid"><button v-for="image in current" :key="image.file_path" type="button" class="tmdb-image-card" :class="{ 'is-selected': selected[kind]?.file_path === image.file_path }" @click="choose(image)"><img :src="image.preview_url" :alt="`${kind} TMDB`" loading="lazy" /><small>{{ image.language || "sem idioma" }} · {{ image.width }}×{{ image.height }}</small></button></div>
      <div class="form-actions"><button class="button button-primary" type="button" :disabled="disabled || loading || !Object.keys(selected).length" @click="apply">Aplicar imagens selecionadas</button></div>
    </template>
  </section>
</template>
