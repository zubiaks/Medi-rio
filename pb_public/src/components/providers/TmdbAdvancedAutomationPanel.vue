<!-- Mediário | ZIP 2: automação opt-in, imagens locais, catálogo e descoberta TMDB. -->
<script setup lang="ts">
import { ref } from "vue";
import type { TitleRecord } from "@/types/records";
import type { TmdbDetailType, TmdbSearchResult } from "@/domain/providers/tmdbClient";
import { loadTmdbDiscovery, type TmdbDiscoveryMode } from "@/domain/providers/tmdbDiscovery";
import { scheduleTmdbCatalogue, type CatalogueScheduleResult } from "@/domain/providers/tmdbCatalogueSync";
import { saveTmdbImageLocally } from "@/domain/providers/tmdbLocalImages";
import type { TmdbImageKind } from "@/domain/providers/tmdbImages";

const props = defineProps<{
  title: TitleRecord;
  tmdbId: number;
  mediaType: TmdbDetailType;
}>();

const discoveryMode = ref<TmdbDiscoveryMode>("recommendations");
const discovery = ref<TmdbSearchResult[]>([]);
const catalogueLimit = ref(25);
const catalogueResult = ref<CatalogueScheduleResult | null>(null);
const imageKind = ref<TmdbImageKind>("poster");
const imageUrl = ref("");
const loading = ref(false);
const error = ref("");
const message = ref("");

async function loadDiscovery(): Promise<void> {
  loading.value = true; error.value = "";
  try { discovery.value = (await loadTmdbDiscovery(props.mediaType, props.tmdbId, discoveryMode.value)).results; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function scheduleCatalogue(): Promise<void> {
  loading.value = true; error.value = "";
  try { catalogueResult.value = await scheduleTmdbCatalogue(catalogueLimit.value); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function saveImage(): Promise<void> {
  loading.value = true; error.value = ""; message.value = "";
  try {
    await saveTmdbImageLocally(props.title.id, imageKind.value, imageUrl.value);
    message.value = "Imagem guardada localmente no título.";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}
</script>

<template>
  <section class="tmdb-advanced" aria-labelledby="tmdb-advanced-title">
    <div><p class="eyebrow">ZIP 2 · Funcionalidades opt-in</p><h3 id="tmdb-advanced-title">Automação e descoberta avançada</h3></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="message" class="form-alert" role="status">{{ message }}</div>

    <details>
      <summary>Descoberta TMDB</summary>
      <div class="tmdb-advanced-block">
        <label class="form-field"><span>Modo</span><select v-model="discoveryMode"><option value="recommendations">Recomendações</option><option value="similar">Semelhantes</option></select></label>
        <button class="button button-secondary" type="button" :disabled="loading" @click="loadDiscovery">Carregar</button>
        <div class="tmdb-advanced-results"><article v-for="item in discovery" :key="item.id"><img v-if="item.poster_url" :src="item.poster_url" :alt="`Capa de ${item.title}`" loading="lazy" /><strong>{{ item.title }}</strong><small>{{ item.date?.slice(0, 4) || "—" }}</small></article></div>
      </div>
    </details>

    <details>
      <summary>Agendar catálogo desatualizado</summary>
      <div class="tmdb-advanced-block">
        <label class="form-field"><span>Máximo de títulos</span><input v-model.number="catalogueLimit" type="number" min="1" max="100" /></label>
        <button class="button button-secondary" type="button" :disabled="loading" @click="scheduleCatalogue">Criar tarefas</button>
        <p v-if="catalogueResult">{{ catalogueResult.created }} criadas · {{ catalogueResult.skipped }} ignoradas · {{ catalogueResult.errors.length }} erros</p>
      </div>
    </details>

    <details>
      <summary>Guardar imagem local</summary>
      <div class="tmdb-advanced-block">
        <label class="form-field"><span>Campo</span><select v-model="imageKind"><option value="poster">Poster</option><option value="backdrop">Backdrop</option><option value="logo">Logótipo</option></select></label>
        <label class="form-field field-wide"><span>URL TMDB selecionado</span><input v-model.trim="imageUrl" type="url" /></label>
        <button class="button button-secondary" type="button" :disabled="loading || !imageUrl" @click="saveImage">Descarregar e guardar</button>
      </div>
    </details>
  </section>
</template>
