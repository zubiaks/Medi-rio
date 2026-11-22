<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbOperationsReportPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / relatórios TMDB
  Finalidade: Apresentar tendências e exportar relatórios CSV e JSON.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { loadTmdbOperations } from "@/domain/providers/tmdbOperations";
import {
  buildTmdbOperationsReport,
  tmdbOperationsReportCsv,
  tmdbOperationsReportJson,
  type TmdbReportPeriod,
} from "@/domain/providers/tmdbOperationsReport";
import type { SyncJobRecord } from "@/domain/providers/records";

const jobs = ref<SyncJobRecord[]>([]);
const period = ref<TmdbReportPeriod>(30);
const loading = ref(false);
const error = ref("");
const report = computed(() => buildTmdbOperationsReport(jobs.value, period.value));
const activeDays = computed(() => report.value.daily.filter((item) => item.total > 0));
const maxTotal = computed(() => Math.max(1, ...activeDays.value.map((item) => item.total)));

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try { jobs.value = await loadTmdbOperations(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

function download(content: string, extension: "csv" | "json", type: string): void {
  const blob = new Blob([extension === "csv" ? "\uFEFF" : "", content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mediario-tmdb-relatorio-${report.value.from}-${report.value.to}.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>

<template>
  <section class="tmdb-report" aria-labelledby="tmdb-report-title">
    <div class="tmdb-report-header">
      <div><p class="eyebrow">Relatório operacional</p><h3 id="tmdb-report-title">Tendências TMDB</h3></div>
      <label class="form-field"><span>Período</span><select v-model="period"><option :value="7">7 dias</option><option :value="30">30 dias</option><option :value="90">90 dias</option></select></label>
    </div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <dl class="tmdb-report-summary">
      <div><dt>Total</dt><dd>{{ report.total }}</dd></div>
      <div><dt>Concluídas</dt><dd>{{ report.completed }}</dd></div>
      <div><dt>Falharam</dt><dd>{{ report.failed }}</dd></div>
      <div><dt>Taxa de sucesso</dt><dd>{{ report.successRate }}%</dd></div>
    </dl>
    <div v-if="activeDays.length" class="tmdb-report-bars" aria-label="Atividade diária TMDB">
      <div v-for="item in activeDays" :key="item.date" class="tmdb-report-day"><span>{{ item.date.slice(5) }}</span><div><i :style="{ width: `${(item.total / maxTotal) * 100}%` }" /></div><strong>{{ item.total }}</strong></div>
    </div>
    <p v-else>Não existe atividade TMDB no período selecionado.</p>
    <div class="form-actions">
      <button class="button button-secondary" type="button" :disabled="loading" @click="load">Atualizar relatório</button>
      <button class="button button-secondary" type="button" @click="download(tmdbOperationsReportCsv(report), 'csv', 'text/csv;charset=utf-8')">Exportar CSV</button>
      <button class="button button-secondary" type="button" @click="download(tmdbOperationsReportJson(report), 'json', 'application/json;charset=utf-8')">Exportar JSON</button>
    </div>
  </section>
</template>
