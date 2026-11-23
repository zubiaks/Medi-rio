<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbSearchDialog.vue
  Versão do ficheiro: 2.1.0
  Tipo: Diálogo Vue 3 com TypeScript
  Domínio: Providers / TMDB
  Finalidade: Pesquisar, associar e aplicar metadados e relações TMDB.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import TmdbEnrichmentPreview from "./TmdbEnrichmentPreview.vue";
import TmdbRelationsPreview from "./TmdbRelationsPreview.vue";
import TmdbCreditsPreview from "./TmdbCreditsPreview.vue";
import TmdbSeasonsPanel from "./TmdbSeasonsPanel.vue";
import TmdbAlternativeTitlesPanel from "./TmdbAlternativeTitlesPanel.vue";
import TmdbImagesPanel from "./TmdbImagesPanel.vue";
import TitleVersionPanel from "./TitleVersionPanel.vue";
import TmdbProtectionNotice from "./TmdbProtectionNotice.vue";
import TmdbSyncHealthPanel from "./TmdbSyncHealthPanel.vue";
import { titleRepository } from "@/domain/repositories";
import { externalSourceRepository } from "@/domain/providers/repository";
import { writeAuditLog } from "@/domain/providers/audit";
import { loadTmdbDetails, searchTmdb, type TmdbDetails, type TmdbDetailType, type TmdbMediaType, type TmdbSearchResult } from "@/domain/providers/tmdbClient";
import { buildSelectedTmdbPayload, type TmdbEnrichmentField } from "@/domain/providers/tmdbEnrichment";
import { applyTmdbRelations, type RelationMode, type TmdbRelationField } from "@/domain/providers/tmdbRelations";
import { tmdbSourcePayload } from "@/domain/providers/tmdbMapping";
import { prepareProtectedSync } from "@/domain/providers/protectedSync";
import { importTmdbCredits, type CreditGroup } from "@/domain/providers/tmdbCredits";
import type { ExternalSourceRecord } from "@/domain/providers/records";
import type { TitleRecord } from "@/types/records";
import {
  availableTmdbWorkspaceTabs,
  nextTmdbWorkspaceTab,
  type TmdbWorkspaceTab,
} from "@/domain/providers/tmdbWorkspace";

const props = defineProps<{ open: boolean; existing: ExternalSourceRecord[] }>();
const emit = defineEmits<{ close: []; saved: [ExternalSourceRecord] }>();
const query = ref("");
const mediaType = ref<TmdbMediaType>("multi");
const results = ref<TmdbSearchResult[]>([]);
const selectedResult = ref<TmdbSearchResult | null>(null);
const titleQuery = ref("");
const titleResults = ref<TitleRecord[]>([]);
const selectedTitle = ref<TitleRecord | null>(null);
const details = ref<TmdbDetails | null>(null);
const source = ref<ExternalSourceRecord | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const detailTab = ref<TmdbWorkspaceTab>("metadata");
const tabButtons = ref<HTMLButtonElement[]>([]);
const workspaceTabs = computed(() =>
  availableTmdbWorkspaceTabs(selectedResult.value?.media_type || "movie"),
);
let titleTimer: ReturnType<typeof setTimeout> | undefined;

watch(() => props.open, (open) => {
  if (!open) return;
  query.value = ""; mediaType.value = "multi"; results.value = [];
  selectedResult.value = null; titleQuery.value = ""; titleResults.value = [];
  selectedTitle.value = null; details.value = null; source.value = null; error.value = "";
});

watch(titleQuery, (value) => {
  if (titleTimer) clearTimeout(titleTimer);
  if (value.trim().length < 2) { titleResults.value = []; return; }
  titleTimer = setTimeout(async () => {
    const slash = String.fromCharCode(92);
    const escaped = value.trim().split(slash).join(slash + slash).split('"').join(slash + '"');
    titleResults.value = (await titleRepository.list({ page: 1, perPage: 20, filter: `apagado = false && (titulo ~ "${escaped}" || titulo_original ~ "${escaped}")`, sort: "titulo" })).items;
  }, 300);
});

async function focusActiveTab(): Promise<void> {
  await nextTick();
  const index = workspaceTabs.value.findIndex((item) => item.id === detailTab.value);
  tabButtons.value[index]?.focus();
}

function moveTab(direction: 1 | -1): void {
  detailTab.value = nextTmdbWorkspaceTab(
    detailTab.value,
    selectedResult.value?.media_type || "movie",
    direction,
  );
  void focusActiveTab();
}

function handleTabKey(event: KeyboardEvent): void {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveTab(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveTab(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    detailTab.value = workspaceTabs.value[0]?.id || "metadata";
    void focusActiveTab();
  } else if (event.key === "End") {
    event.preventDefault();
    detailTab.value = workspaceTabs.value.at(-1)?.id || "health";
    void focusActiveTab();
  }
}

async function runSearch(): Promise<void> {
  if (query.value.trim().length < 2) { error.value = "Escreve pelo menos dois caracteres."; return; }
  loading.value = true; error.value = ""; selectedResult.value = null; details.value = null;
  try { results.value = (await searchTmdb(query.value.trim(), mediaType.value)).results.filter((item) => ["movie", "tv"].includes(item.media_type)); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); results.value = []; }
  finally { loading.value = false; }
}

function selectResult(result: TmdbSearchResult): void { selectedResult.value = result; selectedTitle.value = null; details.value = null; source.value = null; titleQuery.value = result.title; }
function selectTitle(title: TitleRecord): void { selectedTitle.value = title; details.value = null; source.value = null; titleQuery.value = `${title.titulo}${title.ano ? ` (${title.ano})` : ""}`; titleResults.value = []; }

async function prepare(): Promise<void> {
  if (!selectedResult.value || !selectedTitle.value) { error.value = "Seleciona um resultado TMDB e um título do catálogo."; return; }
  const duplicate = props.existing.find((item) => item.provider === "tmdb" && item.external_id === String(selectedResult.value?.id) && item.tipo_externo === (selectedResult.value?.media_type === "tv" ? "tv" : "movie") && item.titulo !== selectedTitle.value?.id);
  if (duplicate) { error.value = "Este resultado TMDB já está associado a outro título."; return; }
  saving.value = true; error.value = "";
  try {
    details.value = await loadTmdbDetails(selectedResult.value.media_type as TmdbDetailType, selectedResult.value.id);
    source.value = props.existing.find((item) => item.provider === "tmdb" && item.titulo === selectedTitle.value?.id) || null;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { saving.value = false; }
}

async function saveSource(): Promise<ExternalSourceRecord> {
  const payload = tmdbSourcePayload(selectedTitle.value!.id, selectedResult.value!, details.value!);
  return source.value ? externalSourceRepository.update(source.value.id, payload) : externalSourceRepository.create(payload);
}

async function applyFields(fields: TmdbEnrichmentField[]): Promise<void> {
  if (!selectedTitle.value || !selectedResult.value || !details.value) return;
  saving.value = true; error.value = "";
  try {
    const protection = await prepareProtectedSync(
      selectedTitle.value,
      "aplicar metadados TMDB",
      fields,
    );
    selectedTitle.value = protection.current;
    const values = buildSelectedTmdbPayload(details.value, fields);
    await titleRepository.update(selectedTitle.value.id, { ...values, tmdb_id: selectedResult.value.id, tipo_tmdb: selectedResult.value.media_type === "tv" ? "tv" : "movie", fonte_principal: "tmdb", sync_estado: "atualizado", ultima_sincronizacao: new Date().toISOString() });
    const saved = await saveSource();
    await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "metadados", campos_aplicados: fields, valores_novos: values } });
    emit("saved", saved);
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { saving.value = false; }
}

async function refreshTitle(): Promise<void> {
  if (!selectedTitle.value) return;
  saving.value = true;
  error.value = "";
  try {
    selectedTitle.value = await titleRepository.get(selectedTitle.value.id);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}

async function versionRestored(values: Record<string, unknown>): Promise<void> {
  if (!selectedTitle.value) return;
  await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "restaurar", origem: "interface", sucesso: true, detalhes: { operacao: "restauro_versao", campos_restaurados: Object.keys(values) } });
}

async function snapshotCreated(): Promise<void> {
  if (!selectedTitle.value) return;
  await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "arquivar", origem: "interface", sucesso: true, detalhes: { operacao: "snapshot_manual" } });
}

async function imagesApplied(values: Record<string, string>): Promise<void> {
  if (!selectedTitle.value) return;
  await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "imagens", campos_aplicados: Object.keys(values), valores_novos: values } });
}

async function alternativeTitlesImported(result: { created: number; skipped: number }): Promise<void> {
  if (!selectedTitle.value) return;
  await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "titulos_alternativos", criados: result.created, ignorados: result.skipped } });
}

async function seasonImported(result: { seasonCreated: boolean; episodesCreated: number; episodesUpdated: number }): Promise<void> {
  if (!selectedTitle.value) return;
  await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "temporada", temporada_criada: result.seasonCreated, episodios_criados: result.episodesCreated, episodios_atualizados: result.episodesUpdated } });
}

async function applyCredits(groups: CreditGroup[]): Promise<void> {
  if (!selectedTitle.value || !details.value) return;
  saving.value = true;
  error.value = "";
  try {
    const result = await importTmdbCredits(selectedTitle.value, details.value, groups);
    await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "creditos", grupos: groups, criados: result.created, ignorados: result.skipped } });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}

async function applyRelations(fields: TmdbRelationField[], mode: RelationMode): Promise<void> {
  if (!selectedTitle.value || !details.value) return;
  saving.value = true; error.value = "";
  try {
    const protection = await prepareProtectedSync(
      selectedTitle.value,
      "aplicar relações TMDB",
      fields,
    );
    selectedTitle.value = protection.current;
    const values = await applyTmdbRelations(selectedTitle.value, details.value, fields, mode);
    const saved = await saveSource();
    await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "relacoes_estruturais", modo: mode, relacoes_aplicadas: fields, valores_novos: values } });
    emit("saved", saved);
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { saving.value = false; }
}
</script>

<template>
  <Teleport to="body"><div v-if="open" class="dialog-backdrop" @click.self="!saving && emit('close')"><section class="dialog-panel tmdb-search-dialog" role="dialog" aria-modal="true" aria-labelledby="tmdb-search-title">
    <div class="dialog-header"><div><p class="eyebrow">Provider TMDB</p><h2 id="tmdb-search-title">Pesquisar, associar e enriquecer</h2></div><button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="emit('close')">×</button></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <form class="tmdb-search-form" @submit.prevent="runSearch"><label class="form-field"><span>Pesquisa TMDB</span><input v-model.trim="query" type="search" required /></label><label class="form-field"><span>Tipo</span><select v-model="mediaType"><option value="multi">Filmes e séries</option><option value="movie">Filmes</option><option value="tv">Séries</option></select></label><button class="button button-secondary" type="submit" :disabled="loading">{{ loading ? "A pesquisar…" : "Pesquisar" }}</button></form>
    <div v-if="results.length" class="tmdb-result-grid"><button v-for="result in results" :key="`${result.media_type}-${result.id}`" type="button" class="tmdb-result-card" :class="{ 'is-selected': selectedResult?.id === result.id }" @click="selectResult(result)"><img v-if="result.poster_url" :src="result.poster_url" :alt="`Capa de ${result.title}`" /><span v-else class="tmdb-poster-fallback" aria-hidden="true">◇</span><strong>{{ result.title }}</strong><small>{{ result.media_type === "tv" ? "Série" : "Filme" }} · {{ result.date?.slice(0, 4) || "—" }}</small></button></div>
    <section v-if="selectedResult" class="tmdb-association"><h3>Selecionar título do catálogo</h3><label class="form-field"><span>Título existente *</span><input v-model.trim="titleQuery" type="search" /></label><ul v-if="titleResults.length" class="provider-title-results"><li v-for="title in titleResults" :key="title.id"><button type="button" @click="selectTitle(title)">{{ title.titulo }}<span>{{ title.ano || "—" }}</span></button></li></ul><p v-if="selectedTitle">Selecionado: <strong>{{ selectedTitle.titulo }}</strong></p><button v-if="selectedTitle && !details" class="button button-primary" type="button" :disabled="saving" @click="prepare">{{ saving ? "A preparar…" : "Comparar metadados" }}</button></section>
    <template v-if="selectedTitle && details">
      <TmdbProtectionNotice />
      <div class="tmdb-detail-tabs" role="tablist" aria-label="Áreas do enriquecimento TMDB">
        <button
          v-for="(item, index) in workspaceTabs"
          :key="item.id"
          :ref="(element) => { if (element) tabButtons[index] = element as HTMLButtonElement; }"
          class="button button-secondary"
          :class="{ 'is-active': detailTab === item.id }"
          type="button"
          role="tab"
          :id="`tmdb-tab-${item.id}`"
          :aria-controls="`tmdb-panel-${item.id}`"
          :aria-selected="detailTab === item.id"
          :tabindex="detailTab === item.id ? 0 : -1"
          @keydown="handleTabKey"
          @click="detailTab = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <div v-if="detailTab === 'metadata'" :id="'tmdb-panel-metadata'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-metadata'">
        <TmdbEnrichmentPreview
          :title="selectedTitle"
          :details="details"
          :disabled="saving"
          @apply="applyFields"
        />
      </div>
      <div v-if="detailTab === 'relations'" :id="'tmdb-panel-relations'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-relations'">
        <TmdbRelationsPreview
          :details="details"
          :disabled="saving"
          @apply="applyRelations"
        />
      </div>
      <div v-if="detailTab === 'credits'" :id="'tmdb-panel-credits'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-credits'">
        <TmdbCreditsPreview
          :details="details"
          :disabled="saving"
          @apply="applyCredits"
        />
      </div>
      <div v-if="detailTab === 'seasons'" :id="'tmdb-panel-seasons'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-seasons'">
        <TmdbSeasonsPanel
          v-if="selectedResult?.media_type === 'tv'"
          :title="selectedTitle"
          :tmdb-id="selectedResult.id"
          :total-seasons="details.number_of_seasons"
          :disabled="saving"
          @imported="seasonImported"
        />
        <p v-else class="form-alert">As temporadas e episódios aplicam-se apenas a séries.</p>
      </div>
      <div v-if="detailTab === 'aliases'" :id="'tmdb-panel-aliases'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-aliases'">
        <TmdbAlternativeTitlesPanel
          :title="selectedTitle"
          :details="details"
          :disabled="saving"
          @imported="alternativeTitlesImported"
        />
      </div>
      <div v-if="detailTab === 'images'" :id="'tmdb-panel-images'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-images'">
        <TmdbImagesPanel
          v-if="selectedResult"
          :title="selectedTitle"
          :tmdb-id="selectedResult.id"
          :media-type="selectedResult.media_type === 'tv' ? 'tv' : 'movie'"
          :disabled="saving"
          @applied="imagesApplied"
        />
      </div>
      <div v-if="detailTab === 'history'" :id="'tmdb-panel-history'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-history'">
        <TitleVersionPanel
          :title="selectedTitle"
          :disabled="saving"
          @restored="versionRestored"
          @snapshot="snapshotCreated"
        />
      </div>
      <div v-if="detailTab === 'health'" :id="'tmdb-panel-health'" class="tmdb-detail-panel" role="tabpanel" :aria-labelledby="'tmdb-tab-health'">
        <TmdbSyncHealthPanel
          :title="selectedTitle"
          :details="details"
          :loading="saving"
          @refresh="refreshTitle"
        />
      </div>
    </template>
    <div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button></div>
  </section></div></Teleport>
</template>
