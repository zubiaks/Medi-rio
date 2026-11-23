/** Mediário | Execução sequencial e recuperação de tarefas OMDb. */
import type { SyncJobRecord } from "./records";
import { executeOmdbUpdateJob, listPendingOmdbJobs } from "./omdbJobExecutor";
import { repeatSyncJob } from "./jobWorkflow";
import { syncJobRepository } from "./repository";
import { saveOmdbPreparedReview } from "./omdbReviewStore";

export interface OmdbBatchResult {
  total: number;
  succeeded: number;
  failed: number;
  cancelled: boolean;
  errors: string[];
}

export async function executeOmdbBatch(
  limit = 10,
  isCancelled: () => boolean = () => false,
  onProgress?: (processed: number, total: number) => void,
): Promise<OmdbBatchResult> {
  const jobs = (await listPendingOmdbJobs()).slice(0, Math.max(1, Math.min(25, limit)));
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const job of jobs) {
    if (isCancelled()) break;
    try {
      const result = await executeOmdbUpdateJob(job);
      saveOmdbPreparedReview({
        titleId: result.title.id,
        titleName: result.title.titulo,
        details: result.details,
        jobId: result.job.id,
      });
      succeeded += 1;
    } catch (cause) {
      failed += 1;
      errors.push(cause instanceof Error ? cause.message : String(cause));
    }
    onProgress?.(succeeded + failed, jobs.length);
  }
  return {
    total: jobs.length,
    succeeded,
    failed,
    cancelled: isCancelled(),
    errors,
  };
}

export async function listRecoverableOmdbJobs(): Promise<SyncJobRecord[]> {
  return (await syncJobRepository.list({
    page: 1,
    perPage: 200,
    filter:
      'provider = "omdb" && tipo = "atualizacao" && entidade = "titulos" && ' +
      '(estado = "falhou" || estado = "parcial" || estado = "cancelado")',
    sort: "-terminado_em,-iniciado_em",
  })).items;
}

export async function retryOmdbJobs(jobs: SyncJobRecord[]): Promise<number> {
  const active = (await syncJobRepository.list({
    page: 1,
    perPage: 500,
    filter:
      'provider = "omdb" && tipo = "atualizacao" && ' +
      '(estado = "pendente" || estado = "em_execucao")',
  })).items;
  const created: SyncJobRecord[] = [];
  for (const job of jobs) {
    created.push(await repeatSyncJob(job, [...active, ...created]));
  }
  return created.length;
}
