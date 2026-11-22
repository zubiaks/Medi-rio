<!--
  Projeto: Mediário
  Ficheiro: src/components/diary/DiaryStatisticsPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Diário e avaliações — Estatísticas

  Finalidade:
  Apresenta métricas gerais, actividade mensal, distribuição por média,
  sequências e exportação do resumo anual.
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import BaseMetricCard from "@/components/base/BaseMetricCard.vue";
import type { DiaryEntryRecord, ReviewRecord } from "@/domain/diary/records";
import {
  buildDiaryStatistics,
  buildMediaDistribution,
  buildMonthlyActivity,
} from "@/domain/diary/statistics";
import {
  createAnnualSummaryCsv,
  createAnnualSummaryJson,
} from "@/domain/diary/annualSummary";

const props = defineProps<{
  entries: DiaryEntryRecord[];
  reviews: ReviewRecord[];
}>();

const availableYears = computed(() => {
  const years = new Set<number>([new Date().getFullYear()]);
  props.entries.forEach((entry) =>
    years.add(new Date(entry.iniciado_em).getFullYear()),
  );
  props.reviews.forEach((review) => {
    const value = review.data_publicacao || review.data_visto || review.created;
    if (value) years.add(new Date(value).getFullYear());
  });
  return [...years].sort((a, b) => b - a);
});

const selectedYear = ref(new Date().getFullYear());
const yearEntries = computed(() =>
  props.entries.filter(
    (entry) => new Date(entry.iniciado_em).getFullYear() === selectedYear.value,
  ),
);
const yearReviews = computed(() =>
  props.reviews.filter((review) => {
    const value = review.data_publicacao || review.data_visto || review.created;
    return value
      ? new Date(value).getFullYear() === selectedYear.value
      : false;
  }),
);
const statistics = computed(() =>
  buildDiaryStatistics(yearEntries.value, yearReviews.value),
);
const months = computed(() =>
  buildMonthlyActivity(yearEntries.value, selectedYear.value),
);
const distribution = computed(() =>
  buildMediaDistribution(yearEntries.value),
);
const maximumMonthlyEntries = computed(() =>
  Math.max(1, ...months.value.map((month) => month.entries)),
);

function download(content: string, name: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportJson(): void {
  download(
    createAnnualSummaryJson(
      props.entries,
      props.reviews,
      selectedYear.value,
    ),
    `resumo-diario-${selectedYear.value}.json`,
    "application/json;charset=utf-8",
  );
}

function exportCsv(): void {
  download(
    `\uFEFF${createAnnualSummaryCsv(
      props.entries,
      props.reviews,
      selectedYear.value,
    )}`,
    `resumo-diario-${selectedYear.value}.csv`,
    "text/csv;charset=utf-8",
  );
}
</script>

<template>
  <section class="diary-statistics" aria-labelledby="diary-statistics-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Resumo anual</p>
        <h2 id="diary-statistics-title">Estatísticas do Diário</h2>
      </div>

      <div class="diary-statistics-actions">
        <label class="form-field">
          <span>Ano</span>
          <select v-model.number="selectedYear">
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </label>
        <button class="button button-secondary" type="button" @click="exportCsv">
          Exportar CSV
        </button>
        <button class="button button-secondary" type="button" @click="exportJson">
          Exportar JSON
        </button>
      </div>
    </div>

    <section class="stats-grid compact-stats">
      <BaseMetricCard icon="◷" label="Registos" :value="statistics.totalEntries" detail="no ano seleccionado" />
      <BaseMetricCard icon="✓" label="Concluídos" :value="statistics.completedEntries" detail="sessões concluídas" tone="cyan" />
      <BaseMetricCard icon="↻" label="Revisualizações" :value="statistics.rewatches" detail="novos consumos" tone="amber" />
      <BaseMetricCard icon="⌚" label="Horas" :value="statistics.totalHours" detail="tempo registado" tone="pink" />
      <BaseMetricCard icon="▦" label="Dias activos" :value="statistics.activeDays" detail="com actividade" />
      <BaseMetricCard icon="🔥" label="Sequência actual" :value="statistics.currentStreak" detail="dias consecutivos" tone="amber" />
      <BaseMetricCard icon="★" label="Maior sequência" :value="statistics.longestStreak" detail="recorde de dias" tone="pink" />
      <BaseMetricCard icon="✎" label="Classificação média" :value="statistics.averageRating ?? '—'" detail="avaliações do ano" tone="cyan" />
    </section>

    <div class="diary-statistics-grid">
      <section class="panel" aria-labelledby="monthly-activity-title">
        <h3 id="monthly-activity-title">Actividade mensal</h3>
        <div class="monthly-bars">
          <div v-for="month in months" :key="month.month" class="monthly-bar-row">
            <span>{{ month.label }}</span>
            <div class="monthly-bar-track" :title="`${month.entries} registos`">
              <span :style="{ width: `${(month.entries / maximumMonthlyEntries) * 100}%` }" />
            </div>
            <strong>{{ month.entries }}</strong>
            <small>{{ month.hours }} h</small>
          </div>
        </div>
      </section>

      <section class="panel" aria-labelledby="media-distribution-title">
        <h3 id="media-distribution-title">Distribuição por tipo de média</h3>
        <p v-if="!distribution.length">Ainda não existem dados para este ano.</p>
        <ul v-else class="media-distribution-list">
          <li v-for="item in distribution" :key="item.key">
            <div>
              <strong>{{ item.label }}</strong>
              <span>{{ item.count }} registos</span>
            </div>
            <div class="distribution-track">
              <span :style="{ width: `${item.percentage}%` }" />
            </div>
            <strong>{{ item.percentage }}%</strong>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
