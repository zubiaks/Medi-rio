<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbJobRecoveryPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / recuperação de tarefas TMDB
  Finalidade: Rever falhas, repetir tarefas e exportar diagnóstico CSV.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { SyncJobRecord } from "@/domain/providers/records";
import {
  listRecoverableTmdbJobs,
  retryTmdbJobs,
  summarizeRecoverableTmdbJobs,
  tmdbRecoveryCsv,
} from "@/domain/providers/tmdbJobRecovery";

const emit = defineEmits<{
  retried: [{ created: number; failed: number }];
}>();

const jobs = ref<SyncJobRecord[]>([]);
const selected = ref<string[]>([]);
const loading = ref(false);
const error = ref("");
const message = ref("");
const summary = computed(() => summarizeRecoverableTmdbJobs(jobs.value));
const selectedJobs = computed(() => jobs.value.filter((job) => selected.value.includes(job.id)));

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    jobs.value = await listRecoverableTmdbJobs();
    selected.value = [];
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function retry(): Promise<void> {
  if (!selectedJobs.value.length) return;
  loading.value = true;
  error.value = "";
  message.value = "";
  try {
    const result = await retryTmdbJobs(selectedJobs.value);
    message.value = `${result.created.length} tarefa(s) criada(s), ${result.errors.length} falha(s).`;
    emit("retried", {
      created: result.created.length,
      failed: result.errors.length,
    });
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

function exportCsv(): void {
  const blob = new Blob(["\uFEFF", tmdbRecoveryCsv(jobs.value)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mediario-tmdb-recuperacao-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>

<template>
  <section class="tmdb-recovery" aria-labelledby="tmdb-recovery-title">
    <div class="tmdb-recovery-header">
      <div>
        <p class="eyebrow">Recuperação operacional</p>
        <h3 id="tmdb-recovery-title">Falhas e tarefas interrompidas</h3>
      </div>
      <div class="tmdb-recovery-actions">
        <button class="button button-secondary" type="button" :disabled="loading" @click="load">
          Atualizar
        </button>
        <button class="button button-secondary" type="button" :disabled="!jobs.length" @click="exportCsv">
          Exportar CSV
        </button>
      </div>
    </div>

    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="message" class="form-alert" role="status">{{ message }}</div>

    <dl class="tmdb-recovery-summary">
      <div><dt>Total</dt><dd>{{ summary.total }}</dd></div>
      <div><dt>Falharam</dt><dd>{{ summary.failed }}</dd></div>
      <div><dt>Parciais</dt><dd>{{ summary.partial }}</dd></div>
      <div><dt>Canceladas</dt><dd>{{ summary.cancelled }}</dd></div>
    </dl>

    <p v-if="loading && !jobs.length">A carregar tarefas…</p>
    <p v-else-if="!jobs.length">Não existem tarefas TMDB recuperáveis.</p>

    <ul v-else class="tmdb-recovery-list">
      <li v-for="job in jobs" :key="job.id">
        <input v-model="selected" type="checkbox" :value="job.id" :aria-label="`Selecionar tarefa ${job.id}`" />
        <div>
          <strong>{{ job.entidade_id || "Título desconhecido" }}</strong>
          <small>{{ job.estado }} · {{ job.erro || "Sem mensagem de erro" }}</small>
        </div>
      </li>
    </ul>

    <div class="form-actions">
      <button
        class="button button-primary"
        type="button"
        :disabled="loading || !selected.length"
        @click="retry"
      >
        Repetir {{ selected.length }} tarefa{{ selected.length === 1 ? "" : "s" }}
      </button>
    </div>
  </section>
</template>
