/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbOperations.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / monitorização TMDB
 * Finalidade: Agregar métricas operacionais e identificar tarefas bloqueadas.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { syncJobRepository } from "./repository";
import type { SyncJobRecord } from "./records";

export const TMDB_STUCK_MINUTES = 30;

export interface TmdbOperationsSummary {
  total: number;
  pending: number;
  running: number;
  completed: number;
  partial: number;
  failed: number;
  cancelled: number;
  stuck: number;
  successRate: number;
  averageDurationSeconds: number;
  last24Hours: number;
}

export interface TmdbStuckJob {
  job: SyncJobRecord;
  ageMinutes: number;
}

function parseDate(value?: string): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function findStuckTmdbJobs(
  jobs: SyncJobRecord[],
  now = new Date(),
  thresholdMinutes = TMDB_STUCK_MINUTES,
): TmdbStuckJob[] {
  return jobs
    .filter((job) =>
      job.provider === "tmdb" && job.estado === "em_execucao",
    )
    .map((job) => {
      const started = parseDate(job.iniciado_em);
      const ageMinutes = started === null
        ? Number.POSITIVE_INFINITY
        : Math.max(0, Math.floor((now.getTime() - started) / 60_000));
      return { job, ageMinutes };
    })
    .filter((item) => item.ageMinutes >= thresholdMinutes)
    .sort((a, b) => b.ageMinutes - a.ageMinutes);
}

export function buildTmdbOperationsSummary(
  jobs: SyncJobRecord[],
  now = new Date(),
): TmdbOperationsSummary {
  const tmdbJobs = jobs.filter((job) => job.provider === "tmdb");
  const completedJobs = tmdbJobs.filter((job) =>
    ["concluido", "parcial", "falhou"].includes(job.estado || ""),
  );
  const successes = tmdbJobs.filter((job) => job.estado === "concluido").length;
  const durations = completedJobs
    .map((job) => {
      const start = parseDate(job.iniciado_em);
      const end = parseDate(job.terminado_em);
      return start !== null && end !== null && end >= start
        ? Math.round((end - start) / 1000)
        : null;
    })
    .filter((value): value is number => value !== null);
  const since = now.getTime() - 86_400_000;

  return {
    total: tmdbJobs.length,
    pending: tmdbJobs.filter((job) => job.estado === "pendente").length,
    running: tmdbJobs.filter((job) => job.estado === "em_execucao").length,
    completed: successes,
    partial: tmdbJobs.filter((job) => job.estado === "parcial").length,
    failed: tmdbJobs.filter((job) => job.estado === "falhou").length,
    cancelled: tmdbJobs.filter((job) => job.estado === "cancelado").length,
    stuck: findStuckTmdbJobs(tmdbJobs, now).length,
    successRate: completedJobs.length
      ? Math.round((successes / completedJobs.length) * 100)
      : 0,
    averageDurationSeconds: durations.length
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : 0,
    last24Hours: tmdbJobs.filter((job) => {
      const start = parseDate(job.iniciado_em);
      return start !== null && start >= since;
    }).length,
  };
}

export async function loadTmdbOperations(): Promise<SyncJobRecord[]> {
  return (await syncJobRepository.list({
    page: 1,
    perPage: 500,
    filter: 'provider = "tmdb"',
    sort: "-iniciado_em",
  })).items;
}

export async function markStuckTmdbJobFailed(
  stuck: TmdbStuckJob,
): Promise<SyncJobRecord> {
  if (stuck.job.estado !== "em_execucao") {
    throw new Error("A tarefa já não está em execução.");
  }

  return syncJobRepository.update(stuck.job.id, {
    estado: "falhou",
    terminado_em: new Date().toISOString(),
    erro:
      `Tarefa marcada como bloqueada após ${stuck.ageMinutes} minutos ` +
      "sem conclusão.",
    falhas: Math.max(1, stuck.job.falhas || 0),
  });
}
