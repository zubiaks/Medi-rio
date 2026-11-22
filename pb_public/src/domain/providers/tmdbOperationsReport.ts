/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbOperationsReport.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / relatórios TMDB
 * Finalidade: Gerar tendências diárias e exportações operacionais CSV e JSON.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import type { SyncJobRecord } from "./records";

export type TmdbReportPeriod = 7 | 30 | 90;

export interface TmdbDailyMetric {
  date: string;
  total: number;
  completed: number;
  failed: number;
  partial: number;
  cancelled: number;
  successRate: number;
}

export interface TmdbOperationsReport {
  generatedAt: string;
  periodDays: TmdbReportPeriod;
  from: string;
  to: string;
  total: number;
  completed: number;
  failed: number;
  partial: number;
  cancelled: number;
  successRate: number;
  daily: TmdbDailyMetric[];
}

function validDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildTmdbOperationsReport(
  jobs: SyncJobRecord[],
  periodDays: TmdbReportPeriod,
  now = new Date(),
): TmdbOperationsReport {
  const fromDate = new Date(now.getTime() - (periodDays - 1) * 86_400_000);
  fromDate.setUTCHours(0, 0, 0, 0);
  const filtered = jobs.filter((job) => {
    const date = validDate(job.terminado_em || job.iniciado_em);
    return job.provider === "tmdb" && date !== null &&
      date.getTime() >= fromDate.getTime() && date.getTime() <= now.getTime();
  });
  const daily: TmdbDailyMetric[] = [];

  for (let index = 0; index < periodDays; index += 1) {
    const date = new Date(fromDate.getTime() + index * 86_400_000);
    const key = dayKey(date);
    const items = filtered.filter((job) => {
      const value = validDate(job.terminado_em || job.iniciado_em);
      return value ? dayKey(value) === key : false;
    });
    const completed = items.filter((job) => job.estado === "concluido").length;
    const failed = items.filter((job) => job.estado === "falhou").length;
    const partial = items.filter((job) => job.estado === "parcial").length;
    const cancelled = items.filter((job) => job.estado === "cancelado").length;
    const closed = completed + failed + partial;
    daily.push({
      date: key,
      total: items.length,
      completed,
      failed,
      partial,
      cancelled,
      successRate: closed ? Math.round((completed / closed) * 100) : 0,
    });
  }

  const completed = filtered.filter((job) => job.estado === "concluido").length;
  const failed = filtered.filter((job) => job.estado === "falhou").length;
  const partial = filtered.filter((job) => job.estado === "parcial").length;
  const cancelled = filtered.filter((job) => job.estado === "cancelado").length;
  const closed = completed + failed + partial;

  return {
    generatedAt: now.toISOString(),
    periodDays,
    from: dayKey(fromDate),
    to: dayKey(now),
    total: filtered.length,
    completed,
    failed,
    partial,
    cancelled,
    successRate: closed ? Math.round((completed / closed) * 100) : 0,
    daily,
  };
}

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function tmdbOperationsReportCsv(report: TmdbOperationsReport): string {
  const header = [
    "data", "total", "concluidas", "falharam", "parciais", "canceladas",
    "taxa_sucesso_percentagem",
  ];
  const rows = report.daily.map((item) => [
    item.date, item.total, item.completed, item.failed, item.partial,
    item.cancelled, item.successRate,
  ].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...rows].join("\r\n");
}

export function tmdbOperationsReportJson(report: TmdbOperationsReport): string {
  return JSON.stringify(report, null, 2);
}
