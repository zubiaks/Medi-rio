<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbBatchExecutorPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / execução em lote TMDB
  Finalidade: Executar até 25 tarefas sequencialmente, com progresso e cancelamento.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { listPendingTmdbJobs } from "@/domain/providers/tmdbJobExecutor";
import {
  executeTmdbBatch,
  selectTmdbBatch,
  type TmdbBatchProgress,
  type TmdbBatchResult,
} from "@/domain/providers/tmdbBatchExecutor";
import type { SyncJobRecord } from "@/domain/providers/records";

const emit = defineEmits<{ completed: [TmdbBatchResult] }>();
const jobs = ref<SyncJobRecord[]>([]);
const limit = ref(10);
const stopOnError = ref(false);
const running = ref(false);
const cancelRequested = ref(false);
const error = ref("");
const result = ref<TmdbBatchResult | null>(null);
const progress = ref<TmdbBatchProgress>({
  total: 0,
  processed: 0,
  succeeded: 0,
  failed: 0,
  cancelled: false,
  currentJobId: "",
});

const selectedCount = computed(() => selectTmdbBatch(jobs.value, limit.value).length);
const percentage = computed(() => progress.value.total
  ? Math.round((progress.value.processed / progress.value.total) * 100)
  : 0);

async function load(): Promise<void> {
  error.value = "";
  try { jobs.value = await listPendingTmdbJobs(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
}

async function run(): Promise<void> {
  running.value = true;
  cancelRequested.value = false;
  result.value = null;
  error.value = "";
  try {
    result.value = await executeTmdbBatch(jobs.value, {
      limit: limit.value,
      stopOnError: stopOnError.value,
      isCancelled: () => cancelRequested.value,
      onProgress: (value) => { progress.value = value; },
    });
    emit("completed", result.value);
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally { running.value = false; }
}

onMounted(load);
</script>

<template>
  <section class="tmdb-batch" aria-labelledby="tmdb-batch-title">
    <div class="tmdb-batch-header">
      <div><p class="eyebrow">Processamento sequencial</p><h3 id="tmdb-batch-title">Executar fila em lote</h3></div>
      <button class="button button-secondary" type="button" :disabled="running" @click="load">Atualizar fila</button>
    </div>
    <p>O lote carrega dados para revisão manual. Nenhum campo do catálogo é aplicado automaticamente.</p>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div class="tmdb-batch-controls">
      <label class="form-field"><span>Máximo de tarefas</span><input v-model.number="limit" type="number" min="1" max="25" /></label>
      <label class="check-field"><input v-model="stopOnError" type="checkbox" /> Parar no primeiro erro</label>
    </div>
    <p>{{ jobs.length }} pendente{{ jobs.length === 1 ? "" : "s" }} · {{ selectedCount }} no próximo lote</p>
    <div v-if="running || progress.total" class="tmdb-batch-progress">
      <div role="progressbar" aria-label="Progresso do lote" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percentage"><span :style="{ width: `${percentage}%` }" /></div>
      <p>{{ progress.processed }}/{{ progress.total }} · {{ progress.succeeded }} sucesso · {{ progress.failed }} falha</p>
    </div>
    <div class="form-actions">
      <button class="button button-primary" type="button" :disabled="running || !selectedCount" @click="run">Executar {{ selectedCount }} tarefa{{ selectedCount === 1 ? "" : "s" }}</button>
      <button v-if="running" class="button button-secondary" type="button" :disabled="cancelRequested" @click="cancelRequested = true">{{ cancelRequested ? "Cancelamento pedido…" : "Parar depois da tarefa atual" }}</button>
    </div>
    <div v-if="result" class="tmdb-batch-summary" role="status"><strong>Lote concluído</strong><span>{{ result.succeeded }} sucessos, {{ result.failed }} falhas<template v-if="result.cancelled">, cancelado</template>.</span></div>
  </section>
</template>
