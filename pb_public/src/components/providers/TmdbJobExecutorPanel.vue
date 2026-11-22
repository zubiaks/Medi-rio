<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbJobExecutorPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / execução de tarefas TMDB
  Finalidade: Executar tarefas pendentes e devolver os detalhes para revisão manual.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  executeTmdbUpdateJob,
  listPendingTmdbJobs,
  type TmdbJobExecutionResult,
} from "@/domain/providers/tmdbJobExecutor";
import type { SyncJobRecord } from "@/domain/providers/records";

const emit = defineEmits<{
  prepared: [TmdbJobExecutionResult];
}>();

const jobs = ref<SyncJobRecord[]>([]);
const loading = ref(false);
const runningId = ref("");
const error = ref("");

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    jobs.value = await listPendingTmdbJobs();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function execute(job: SyncJobRecord): Promise<void> {
  runningId.value = job.id;
  error.value = "";
  try {
    const result = await executeTmdbUpdateJob(job);
    jobs.value = jobs.value.filter((item) => item.id !== job.id);
    emit("prepared", result);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    await load();
  } finally {
    runningId.value = "";
  }
}

onMounted(load);
</script>

<template>
  <section class="tmdb-job-executor" aria-labelledby="tmdb-job-executor-title">
    <div class="tmdb-job-executor-header">
      <div>
        <p class="eyebrow">Fila TMDB</p>
        <h3 id="tmdb-job-executor-title">Executar atualizações pendentes</h3>
      </div>
      <button
        class="button button-secondary"
        type="button"
        :disabled="loading || Boolean(runningId)"
        @click="load"
      >
        Atualizar fila
      </button>
    </div>

    <p class="tmdb-job-executor-note">
      A execução carrega os dados atuais do TMDB e conclui a tarefa, mas não
      substitui campos do catálogo. A aplicação continua a exigir revisão manual.
    </p>

    <div v-if="error" class="form-alert form-alert-error" role="alert">
      {{ error }}
    </div>

    <p v-if="loading && !jobs.length">A carregar tarefas…</p>
    <p v-else-if="!jobs.length">Não existem atualizações TMDB pendentes.</p>

    <ul v-else class="tmdb-job-list">
      <li v-for="job in jobs" :key="job.id">
        <div>
          <strong>{{ job.entidade_id }}</strong>
          <small>
            Criada em
            {{ new Date(job.iniciado_em || job.created).toLocaleString("pt-PT") }}
          </small>
        </div>
        <button
          class="button button-primary"
          type="button"
          :disabled="Boolean(runningId)"
          @click="execute(job)"
        >
          {{ runningId === job.id ? "A executar…" : "Executar e rever" }}
        </button>
      </li>
    </ul>
  </section>
</template>
