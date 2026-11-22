/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbBatchExecutor.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / execução em lote TMDB
 * Finalidade: Executar sequencialmente tarefas pendentes com limites e cancelamento seguro.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import type { SyncJobRecord } from "./records";
import {
  executeTmdbUpdateJob,
  type TmdbJobExecutionResult,
} from "./tmdbJobExecutor";

export const TMDB_BATCH_MAX = 25;

export interface TmdbBatchProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  cancelled: boolean;
  currentJobId: string;
}

export interface TmdbBatchResult extends TmdbBatchProgress {
  prepared: TmdbJobExecutionResult[];
  errors: Array<{ jobId: string; message: string }>;
}

export interface TmdbBatchOptions {
  limit?: number;
  stopOnError?: boolean;
  isCancelled?: () => boolean;
  onProgress?: (progress: TmdbBatchProgress) => void;
}

export function selectTmdbBatch(
  jobs: SyncJobRecord[],
  limit = 10,
): SyncJobRecord[] {
  const safeLimit = Math.max(1, Math.min(TMDB_BATCH_MAX, Math.trunc(limit)));
  return jobs
    .filter((job) =>
      job.provider === "tmdb" &&
      job.tipo === "atualizacao" &&
      job.estado === "pendente" &&
      job.entidade === "titulos" &&
      Boolean(job.entidade_id),
    )
    .slice(0, safeLimit);
}

export async function executeTmdbBatch(
  jobs: SyncJobRecord[],
  options: TmdbBatchOptions = {},
): Promise<TmdbBatchResult> {
  const selected = selectTmdbBatch(jobs, options.limit || 10);
  const prepared: TmdbJobExecutionResult[] = [];
  const errors: Array<{ jobId: string; message: string }> = [];
  let cancelled = false;

  const progress = (): TmdbBatchProgress => ({
    total: selected.length,
    processed: prepared.length + errors.length,
    succeeded: prepared.length,
    failed: errors.length,
    cancelled,
    currentJobId: "",
  });

  options.onProgress?.(progress());

  for (const job of selected) {
    if (options.isCancelled?.()) {
      cancelled = true;
      options.onProgress?.(progress());
      break;
    }

    options.onProgress?.({ ...progress(), currentJobId: job.id });

    try {
      prepared.push(await executeTmdbUpdateJob(job));
    } catch (cause) {
      errors.push({
        jobId: job.id,
        message: cause instanceof Error ? cause.message : String(cause),
      });
      if (options.stopOnError) {
        options.onProgress?.(progress());
        break;
      }
    }

    options.onProgress?.(progress());
  }

  return { ...progress(), prepared, errors };
}
