<!--
  Projeto: Mediário
  Ficheiro: src/components/maintenance/SyncJobPanel.vue
  Versão do ficheiro: 2.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers e manutenção

  Finalidade:
  Apresenta, filtra e abre o detalhe das tarefas de sincronização.
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { jobProgress } from "@/domain/providers/statistics";
import type { SyncJobRecord } from "@/domain/providers/records";

const props = defineProps<{
  jobs: SyncJobRecord[];
}>();

const emit = defineEmits<{
  "row-click": [SyncJobRecord];
}>();

const selectedState = ref("");
const selectedProvider = ref("");

const providers = computed(() =>
  [...new Set(props.jobs.map((job) => job.provider))].sort(),
);

const filteredJobs = computed(() =>
  props.jobs.filter(
    (job) =>
      (!selectedState.value || job.estado === selectedState.value) &&
      (!selectedProvider.value || job.provider === selectedProvider.value),
  ),
);

function stateLabel(value?: string): string {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    em_execucao: "Em execução",
    concluido: "Concluído",
    parcial: "Parcial",
    falhou: "Falhou",
    cancelado: "Cancelado",
  };

  return labels[value || ""] || value || "Sem estado";
}
</script>

<template>
  <section class="panel sync-job-panel" aria-labelledby="sync-job-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Sincronizações</p>
        <h2 id="sync-job-title">Tarefas</h2>
      </div>

      <div class="maintenance-inline-filters">
        <select
          v-model="selectedProvider"
          aria-label="Filtrar por provider"
        >
          <option value="">Todos os providers</option>
          <option v-for="provider in providers" :key="provider">
            {{ provider }}
          </option>
        </select>

        <select
          v-model="selectedState"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos os estados</option>
          <option value="pendente">Pendente</option>
          <option value="em_execucao">Em execução</option>
          <option value="concluido">Concluído</option>
          <option value="parcial">Parcial</option>
          <option value="falhou">Falhou</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
    </div>

    <p v-if="!filteredJobs.length">
      Não existem tarefas para os filtros seleccionados.
    </p>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Progresso</th>
            <th>Sucessos</th>
            <th>Falhas</th>
            <th>Erro</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="job in filteredJobs"
            :key="job.id"
            class="clickable-row"
            tabindex="0"
            @click="emit('row-click', job)"
            @keydown.enter="emit('row-click', job)"
            @keydown.space.prevent="emit('row-click', job)"
          >
            <td>{{ job.provider }}</td>
            <td>{{ job.tipo || "—" }}</td>
            <td>{{ stateLabel(job.estado) }}</td>
            <td>
              <div
                class="job-progress"
                role="progressbar"
                :aria-label="`Progresso da tarefa ${job.provider}`"
                :aria-valuenow="jobProgress(job)"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <span :style="{ width: `${jobProgress(job)}%` }" />
              </div>
              <small>
                {{ job.processados || 0 }} / {{ job.total || 0 }}
              </small>
            </td>
            <td>{{ job.sucessos || 0 }}</td>
            <td>{{ job.falhas || 0 }}</td>
            <td>{{ job.erro || "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
