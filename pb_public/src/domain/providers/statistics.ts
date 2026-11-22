/** Agregações puras do painel de providers e sincronizações. */
import type { ExternalSourceRecord, SyncJobRecord } from "./records";

export interface ProviderSummary {
  provider: string;
  sources: number;
  titles: number;
  primary: number;
  lastSync?: string;
  failedJobs: number;
  runningJobs: number;
}

export function buildProviderSummaries(
  sources: ExternalSourceRecord[],
  jobs: SyncJobRecord[],
): ProviderSummary[] {
  const names = new Set([
    ...sources.map((source) => source.provider),
    ...jobs.map((job) => job.provider).filter(Boolean),
  ]);

  return [...names].map((provider) => {
    const providerSources = sources.filter((source) => source.provider === provider);
    const providerJobs = jobs.filter((job) => job.provider === provider);
    const dates = providerSources
      .map((source) => source.ultima_sincronizacao)
      .filter((value): value is string => Boolean(value))
      .sort()
      .reverse();

    return {
      provider,
      sources: providerSources.length,
      titles: new Set(providerSources.map((source) => source.titulo)).size,
      primary: providerSources.filter((source) => source.principal).length,
      lastSync: dates[0],
      failedJobs: providerJobs.filter((job) => job.estado === "falhou").length,
      runningJobs: providerJobs.filter((job) => job.estado === "em_execucao").length,
    };
  }).sort((a, b) => b.sources - a.sources || a.provider.localeCompare(b.provider));
}

export function jobProgress(job: SyncJobRecord): number {
  if (!job.total || job.total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((job.processados || 0) / job.total) * 100)));
}
