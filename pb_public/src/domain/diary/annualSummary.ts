/** Exportação do resumo anual do Diário em CSV e JSON. */
import type { DiaryEntryRecord, ReviewRecord } from "./records";
import {
  buildDiaryStatistics,
  buildMediaDistribution,
  buildMonthlyActivity,
} from "./statistics";

export function createAnnualSummary(
  entries: DiaryEntryRecord[],
  reviews: ReviewRecord[],
  year: number,
) {
  const yearEntries = entries.filter(
    (entry) => new Date(entry.iniciado_em).getFullYear() === year,
  );
  const yearReviews = reviews.filter((review) => {
    const value = review.data_publicacao || review.data_visto || review.created;
    return value ? new Date(value).getFullYear() === year : false;
  });

  return {
    ano: year,
    gerado_em: new Date().toISOString(),
    estatisticas: buildDiaryStatistics(yearEntries, yearReviews),
    meses: buildMonthlyActivity(yearEntries, year),
    distribuicao: buildMediaDistribution(yearEntries),
  };
}

export function createAnnualSummaryJson(
  entries: DiaryEntryRecord[],
  reviews: ReviewRecord[],
  year: number,
): string {
  return JSON.stringify(createAnnualSummary(entries, reviews, year), null, 2);
}

export function createAnnualSummaryCsv(
  entries: DiaryEntryRecord[],
  reviews: ReviewRecord[],
  year: number,
): string {
  const summary = createAnnualSummary(entries, reviews, year);
  const rows = [
    ["Métrica", "Valor"],
    ["Ano", summary.ano],
    ["Registos", summary.estatisticas.totalEntries],
    ["Concluídos", summary.estatisticas.completedEntries],
    ["Revisualizações", summary.estatisticas.rewatches],
    ["Horas consumidas", summary.estatisticas.totalHours],
    ["Dias activos", summary.estatisticas.activeDays],
    ["Sequência actual", summary.estatisticas.currentStreak],
    ["Maior sequência", summary.estatisticas.longestStreak],
    ["Avaliações", summary.estatisticas.reviews],
    ["Classificação média", summary.estatisticas.averageRating ?? ""],
  ];

  return rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
