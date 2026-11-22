<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbOperationsPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / monitorização TMDB
  Finalidade: Apresentar métricas e resolver tarefas bloqueadas.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  buildTmdbOperationsSummary,
  findStuckTmdbJobs,
  loadTmdbOperations,
  markStuckTmdbJobFailed,
  type TmdbStuckJob,
} from "@/domain/providers/tmdbOperations";
import type { SyncJobRecord } from "@/domain/providers/records";

const emit = defineEmits<{
  resolved: [{ id: string; ageMinutes: number }];
}>();

const jobs = ref<SyncJobRecord[]>([]);
const loading = ref(false);
const resolvingId = ref("");
const error = ref("");
const message = ref("");
const summary = computed(() => buildTmdbOperationsSummary(jobs.value));
const stuck = computed(() => findStuckTmdbJobs(jobs.value));

function durationLabel(seconds: number): string {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds} s`;
  return `${Math.round(seconds / 60)} min`;
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    jobs.value = await loadTmdbOperations();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function resolve(item: TmdbStuckJob): Promise<void> {
  resolvingId.value = item.job.id;
  error.value = "";
  message.value = "";
  try {
    await markStuckTmdbJobFailed(item);
    message.value = "A tarefa bloqueada foi encerrada como falha.";
    emit("resolved", {
      id: item.job.id,
      ageMinutes: item.ageMinutes,
    });
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    resolvingId.value = "";
  }
}

onMounted(load);
</script>

<template>
  <section class="tmdb-operations" aria-labelledby="tmdb-operations-title">
    <div class="tmdb-operations-header">
      <div>
        <p class="eyebrow">Monitorização operacional</p>
        <h3 id="tmdb-operations-title">Saúde das tarefas TMDB</h3>
      </div>
      <button
        class="button button-secondary"
        type="button"
        :disabled="loading || Boolean(resolvingId)"
        @click="load"
      >
        Atualizar métricas
      </button>
    </div>

    <div v-if="error" class="form-alert form-alert-error" role="alert">
      {{ error }}
    </div>
    <div v-if="message" class="form-alert" role="status">
      {{ message }}
    </div>

    <dl class="tmdb-operations-metrics">
      <div><dt>Pendentes</dt><dd>{{ summary.pending }}</dd></div>
      <div><dt>Em execução</dt><dd>{{ summary.running }}</dd></div>
      <div><dt>Concluídas</dt><dd>{{ summary.completed }}</dd></div>
      <div><dt>Falharam</dt><dd>{{ summary.failed }}</dd></div>
      <div><dt>Bloqueadas</dt><dd>{{ summary.stuck }}</dd></div>
      <div><dt>Taxa de sucesso</dt><dd>{{ summary.successRate }}%</dd></div>
      <div><dt>Duração média</dt><dd>{{ durationLabel(summary.averageDurationSeconds) }}</dd></div>
      <div><dt>Últimas 24 horas</dt><dd>{{ summary.last24Hours }}</dd></div>
    </dl>

    <section v-if="stuck.length" class="tmdb-stuck-jobs" aria-labelledby="tmdb-stuck-title">
      <h4 id="tmdb-stuck-title">Tarefas possivelmente bloqueadas</h4>
      <ul>
        <li v-for="item in stuck" :key="item.job.id">
          <div>
            <strong>{{ item.job.entidade_id || item.job.id }}</strong>
            <small>Em execução há {{ item.ageMinutes }} minutos</small>
          </div>
          <button
            class="button button-secondary"
            type="button"
            :disabled="Boolean(resolvingId)"
            @click="resolve(item)"
          >
            {{ resolvingId === item.job.id ? "A encerrar…" : "Marcar como falha" }}
          </button>
        </li>
      </ul>
    </section>

    <p v-else-if="!loading">
      Não foram detetadas tarefas TMDB bloqueadas há 30 minutos ou mais.
    </p>
  </section>
</template>
