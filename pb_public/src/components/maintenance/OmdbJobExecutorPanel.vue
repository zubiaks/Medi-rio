<!-- Mediário | Fase 8D: execução de tarefas OMDb para revisão manual. -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  executeOmdbUpdateJob,
  listPendingOmdbJobs,
  type OmdbJobExecutionResult,
} from "@/domain/providers/omdbJobExecutor";
import { saveOmdbPreparedReview } from "@/domain/providers/omdbReviewStore";
import type { SyncJobRecord } from "@/domain/providers/records";

const emit = defineEmits<{ prepared: [OmdbJobExecutionResult] }>();
const jobs = ref<SyncJobRecord[]>([]);
const loading = ref(false);
const runningId = ref("");
const error = ref("");
const message = ref("");

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try { jobs.value = await listPendingOmdbJobs(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function execute(job: SyncJobRecord): Promise<void> {
  runningId.value = job.id;
  error.value = "";
  message.value = "";
  try {
    const result = await executeOmdbUpdateJob(job);
    saveOmdbPreparedReview({
      titleId: result.title.id,
      titleName: result.title.titulo,
      details: result.details,
      jobId: result.job.id,
    });
    jobs.value = jobs.value.filter((item) => item.id !== job.id);
    message.value = `Dados OMDb preparados para ${result.title.titulo}.`;
    emit("prepared", result);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    await load();
  } finally { runningId.value = ""; }
}

onMounted(load);
</script>

<template>
  <section class="omdb-job-executor" aria-labelledby="omdb-job-executor-title">
    <div class="tmdb-operations-header">
      <div><p class="eyebrow">Fila OMDb</p><h3 id="omdb-job-executor-title">Executar atualizações pendentes</h3></div>
      <button class="button button-secondary" type="button" :disabled="loading || Boolean(runningId)" @click="load">Atualizar fila</button>
    </div>
    <p>Os dados são carregados e guardados apenas na sessão para revisão manual em Providers.</p>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
    <p v-if="loading && !jobs.length">A carregar tarefas…</p>
    <p v-else-if="!jobs.length">Não existem atualizações OMDb pendentes.</p>
    <ul v-else class="omdb-job-list">
      <li v-for="job in jobs" :key="job.id">
        <div><strong>{{ job.entidade_id }}</strong><small>{{ new Date(job.iniciado_em || job.created).toLocaleString("pt-PT") }}</small></div>
        <button class="button button-primary" type="button" :disabled="Boolean(runningId)" @click="execute(job)">{{ runningId === job.id ? "A executar…" : "Executar para revisão" }}</button>
      </li>
    </ul>
  </section>
</template>
