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
import { ref, watch } from "vue";
import TmdbEnrichmentPreview from "./TmdbEnrichmentPreview.vue";
import TmdbRelationsPreview from "./TmdbRelationsPreview.vue";
import TmdbCreditsPreview from "./TmdbCreditsPreview.vue";
import TmdbSeasonsPanel from "./TmdbSeasonsPanel.vue";
import TmdbAlternativeTitlesPanel from "./TmdbAlternativeTitlesPanel.vue";
import TmdbImagesPanel from "./TmdbImagesPanel.vue";
import TitleVersionPanel from "./TitleVersionPanel.vue";
import TmdbProtectionNotice from "./TmdbProtectionNotice.vue";
import TmdbSyncHealthPanel from "./TmdbSyncHealthPanel.vue";
import TmdbSyncSchedulerPanel from "./TmdbSyncSchedulerPanel.vue";
import TmdbJobExecutorPanel from "./TmdbJobExecutorPanel.vue";
import TmdbBatchExecutorPanel from "./TmdbBatchExecutorPanel.vue";
import TmdbJobRecoveryPanel from "./TmdbJobRecoveryPanel.vue";
import TmdbOperationsPanel from "./TmdbOperationsPanel.vue";
import TmdbOperationsReportPanel from "./TmdbOperationsReportPanel.vue";
import TmdbOperationalSettingsPanel from "@/components/maintenance/TmdbOperationalSettingsPanel.vue";
import TmdbAdvancedAutomationPanel from "./TmdbAdvancedAutomationPanel.vue";
import { titleRepository } from "@/domain/repositories";
import { externalSourceRepository } from "@/domain/providers/repository";
import { writeAuditLog } from "@/domain/providers/audit";
import { loadTmdbDetails, searchTmdb, type TmdbDetails, type TmdbDetailType, type TmdbMediaType, type TmdbSearchResult } from "@/domain/providers/tmdbClient";
import { buildSelectedTmdbPayload, type TmdbEnrichmentField } from "@/domain/providers/tmdbEnrichment";
import { applyTmdbRelations, type RelationMode, type TmdbRelationField } from "@/domain/providers/tmdbRelations";
import { tmdbSourcePayload } from "@/domain/providers/tmdbMapping";
import { prepareProtectedSync } from "@/domain/providers/protectedSync";
import type { TmdbJobExecutionResult } from "@/domain/providers/tmdbJobExecutor";
import type { TmdbBatchResult } from "@/domain/providers/tmdbBatchExecutor";
import { importTmdbCredits, type CreditGroup } from "@/domain/providers/tmdbCredits";
import type { ExternalSourceRecord } from "@/domain/providers/records";
import type { TitleRecord } from "@/types/records";

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

async function stuckJobResolved(result: { id: string; ageMinutes: number }): Promise<void> {
  await writeAuditLog({ entidade: "sync_jobs", entidade_id: result.id, entidade_nome: "Tarefa TMDB bloqueada", acao: "erro", origem: "manutencao", sucesso: true, detalhes: { provider: "tmdb", operacao: "encerrar_tarefa_bloqueada", minutos_em_execucao: result.ageMinutes } });
}

async function recoveryRetried(result: { created: number; failed: number }): Promise<void> {
  await writeAuditLog({ entidade: "sync_jobs", entidade_nome: "Recuperação TMDB", acao: "sincronizar", origem: "interface", sucesso: result.failed === 0, detalhes: { provider: "tmdb", operacao: "repeticao_falhas", tarefas_criadas: result.created, falhas: result.failed } });
}

async function batchCompleted(result: TmdbBatchResult): Promise<void> {
  await writeAuditLog({ entidade: "sync_jobs", entidade_nome: "Lote TMDB", acao: "sincronizar", origem: "interface", sucesso: result.failed === 0, erro: result.errors.map((item) => item.message).join(" | ").slice(0, 2000), detalhes: { provider: "tmdb", operacao: "execucao_lote", total: result.total, processados: result.processed, sucessos: result.succeeded, falhas: result.failed, cancelado: result.cancelled, tarefas: result.prepared.map((item) => item.job.id) } });
}

async function jobPrepared(result: TmdbJobExecutionResult): Promise<void> {
  if (!selectedTitle.value || selectedTitle.value.id !== result.titleId) {
    error.value = `A tarefa de ${result.titleName} foi executada. Abre esse título para rever os metadados carregados.`;
    return;
  }
  details.value = result.details;
  await writeAuditLog({ entidade: "titulos", entidade_id: result.titleId, entidade_nome: result.titleName, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "execucao_tarefa", sync_job_id: result.job.id, modo: "revisao_manual" } });
}

async function syncScheduled(job: { id: string }): Promise<void> {
  if (!selectedTitle.value) return;
  await writeAuditLog({ entidade: "titulos", entidade_id: selectedTitle.value.id, entidade_nome: selectedTitle.value.titulo, acao: "sincronizar", origem: "interface", sucesso: true, detalhes: { provider: "tmdb", operacao: "agendamento", sync_job_id: job.id } });
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
    <TmdbProtectionNotice v-if="selectedTitle && details" />
    <TmdbEnrichmentPreview v-if="selectedTitle && details" :title="selectedTitle" :details="details" :disabled="saving" @apply="applyFields" />
    <TmdbRelationsPreview v-if="selectedTitle && details" :details="details" :disabled="saving" @apply="applyRelations" />
    <TmdbCreditsPreview v-if="selectedTitle && details" :details="details" :disabled="saving" @apply="applyCredits" />
    <TmdbSeasonsPanel v-if="selectedTitle && details && selectedResult?.media_type === 'tv'" :title="selectedTitle" :tmdb-id="selectedResult.id" :total-seasons="details.number_of_seasons" :disabled="saving" @imported="seasonImported" />
    <TmdbAlternativeTitlesPanel v-if="selectedTitle && details" :title="selectedTitle" :details="details" :disabled="saving" @imported="alternativeTitlesImported" />
    <TmdbImagesPanel v-if="selectedTitle && selectedResult" :title="selectedTitle" :tmdb-id="selectedResult.id" :media-type="selectedResult.media_type === 'tv' ? 'tv' : 'movie'" :disabled="saving" @applied="imagesApplied" />
    <TitleVersionPanel v-if="selectedTitle" :title="selectedTitle" :disabled="saving" @restored="versionRestored" @snapshot="snapshotCreated" />
    <TmdbSyncHealthPanel v-if="selectedTitle" :title="selectedTitle" :details="details" :loading="saving" @refresh="refreshTitle" />
    <TmdbSyncSchedulerPanel v-if="selectedTitle" :title="selectedTitle" :disabled="saving" @scheduled="syncScheduled" />
    <TmdbJobExecutorPanel @prepared="jobPrepared" />
    <TmdbBatchExecutorPanel @completed="batchCompleted" />
    <TmdbJobRecoveryPanel @retried="recoveryRetried" />
    <TmdbOperationsPanel @resolved="stuckJobResolved" />
    <TmdbOperationsReportPanel />
    <TmdbOperationalSettingsPanel />
    <TmdbAdvancedAutomationPanel v-if="selectedTitle && selectedResult" :title="selectedTitle" :tmdb-id="selectedResult.id" :media-type="selectedResult.media_type === 'tv' ? 'tv' : 'movie'" />
    <div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button></div>
  </section></div></Teleport>
</template>
