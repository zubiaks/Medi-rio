<!--
  Projeto: Mediário
  Caminho: src/components/maintenance/TmdbOperationsWorkspace.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Manutenção / operações globais TMDB
  Finalidade: Agrupar tarefas, lotes, recuperação, métricas, relatórios e configuração.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { ref } from "vue";
import TmdbJobExecutorPanel from "@/components/providers/TmdbJobExecutorPanel.vue";
import TmdbBatchExecutorPanel from "@/components/providers/TmdbBatchExecutorPanel.vue";
import TmdbJobRecoveryPanel from "@/components/providers/TmdbJobRecoveryPanel.vue";
import TmdbOperationsPanel from "@/components/providers/TmdbOperationsPanel.vue";
import TmdbOperationsReportPanel from "@/components/providers/TmdbOperationsReportPanel.vue";
import TmdbOperationalSettingsPanel from "@/components/maintenance/TmdbOperationalSettingsPanel.vue";
import OmdbJobExecutorPanel from "@/components/maintenance/OmdbJobExecutorPanel.vue";
import OmdbBatchRecoveryPanel from "@/components/maintenance/OmdbBatchRecoveryPanel.vue";
import ProviderAdminPanel from "@/components/maintenance/ProviderAdminPanel.vue";
import type { OmdbJobExecutionResult } from "@/domain/providers/omdbJobExecutor";
import type { TmdbJobExecutionResult } from "@/domain/providers/tmdbJobExecutor";
import type { TmdbBatchResult } from "@/domain/providers/tmdbBatchExecutor";

type Tab = "queue" | "omdb" | "recovery" | "health" | "reports" | "settings";
const tab = ref<Tab>("queue");
const notice = ref("");

function prepared(result: TmdbJobExecutionResult): void {
  notice.value = `Tarefa concluída para ${result.titleName}. Abre Providers para rever e aplicar os dados.`;
}

function batchCompleted(result: TmdbBatchResult): void {
  notice.value = `Lote concluído: ${result.succeeded} sucessos e ${result.failed} falhas.`;
}

function omdbPrepared(result: OmdbJobExecutionResult): void {
  notice.value = `Dados OMDb preparados para ${result.title.titulo}. Abre Providers e seleciona Pesquisar OMDb para rever.`;
}
</script>

<template>
  <section class="tmdb-workspace" aria-labelledby="tmdb-workspace-title">
    <div><p class="eyebrow">Operações globais</p><h2 id="tmdb-workspace-title">Manutenção TMDB</h2></div>
    <p>As operações globais foram separadas da pesquisa e enriquecimento de um título.</p>
    <div v-if="notice" class="form-alert" role="status">{{ notice }}</div>
    <div class="tmdb-workspace-tabs" role="tablist" aria-label="Áreas de manutenção TMDB">
      <button v-for="item in ([['queue','Fila TMDB'],['omdb','Fila OMDb'],['recovery','Recuperação'],['health','Saúde'],['reports','Relatórios'],['settings','Configuração']] as const)" :key="item[0]" class="button button-secondary" :class="{ 'is-active': tab === item[0] }" type="button" role="tab" :aria-selected="tab === item[0]" @click="tab = item[0]">{{ item[1] }}</button>
    </div>
    <div v-show="tab === 'queue'"><TmdbJobExecutorPanel @prepared="prepared" /><TmdbBatchExecutorPanel @completed="batchCompleted" /></div>
    <div v-show="tab === 'omdb'"><OmdbJobExecutorPanel @prepared="omdbPrepared" /><OmdbBatchRecoveryPanel /></div>
    <div v-show="tab === 'recovery'"><TmdbJobRecoveryPanel /></div>
    <div v-show="tab === 'health'"><TmdbOperationsPanel /></div>
    <div v-show="tab === 'reports'"><TmdbOperationsReportPanel /></div>
    <div v-show="tab === 'settings'"><ProviderAdminPanel /><TmdbOperationalSettingsPanel /></div>
  </section>
</template>
