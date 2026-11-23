/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/providerOperations.ts
 * Versão: 1.0.0
 * Domínio: Providers / operação transversal
 * Finalidade: Métricas comparáveis por provider e deteção de tarefas bloqueadas.
 */
import { syncJobRepository } from "./repository";
import type { SyncJobRecord } from "./records";

export type OperationalProvider = "tmdb" | "omdb";

export interface ProviderMetric {
  provider: OperationalProvider;
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  partial: number;
  cancelled: number;
  stuck: number;
  successRate: number;
  averageDurationSeconds: number;
}

function timestamp(value?: string): number | null {
  if (!value) return null;
  const result = new Date(value).getTime();
  return Number.isFinite(result) ? result : null;
}

export function buildProviderMetric(
  provider: OperationalProvider,
  jobs: SyncJobRecord[],
  now = new Date(),
  stuckMinutes = 30,
): ProviderMetric {
  const selected = jobs.filter((job) => job.provider === provider);
  const completed = selected.filter((job) => job.estado === "concluido").length;
  const failed = selected.filter((job) => job.estado === "falhou").length;
  const partial = selected.filter((job) => job.estado === "parcial").length;
  const closed = completed + failed + partial;
  const durations = selected
    .map((job) => {
      const start = timestamp(job.iniciado_em);
      const end = timestamp(job.terminado_em);
      return start !== null && end !== null && end >= start
        ? Math.round((end - start) / 1000)
        : null;
    })
    .filter((value): value is number => value !== null);
  const stuck = selected.filter((job) => {
    if (job.estado !== "em_execucao") return false;
    const start = timestamp(job.iniciado_em);
    return start === null || now.getTime() - start >= stuckMinutes * 60_000;
  }).length;

  return {
    provider,
    total: selected.length,
    pending: selected.filter((job) => job.estado === "pendente").length,
    running: selected.filter((job) => job.estado === "em_execucao").length,
    completed,
    failed,
    partial,
    cancelled: selected.filter((job) => job.estado === "cancelado").length,
    stuck,
    successRate: closed ? Math.round((completed / closed) * 100) : 0,
    averageDurationSeconds: durations.length
      ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
      : 0,
  };
}

export async function loadAllProviderJobs(): Promise<SyncJobRecord[]> {
  return (await syncJobRepository.list({
    page: 1,
    perPage: 500,
    filter: '(provider = "tmdb" || provider = "omdb")',
    sort: "-iniciado_em",
  })).items;
}
