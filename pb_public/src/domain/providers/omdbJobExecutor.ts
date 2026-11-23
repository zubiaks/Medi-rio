/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/omdbJobExecutor.ts
 * Versão: 1.0.0
 * Domínio: Providers / OMDb
 * Finalidade: Executar tarefas OMDb pendentes e preparar revisão manual.
 */
import { titleRepository } from "@/domain/repositories";
import { loadOmdbDetails, type OmdbDetails } from "./omdbClient";
import { finishSyncJob, startSyncJob, updateSyncProgress } from "./jobWorkflow";
import { syncJobRepository } from "./repository";
import type { SyncJobRecord } from "./records";
import type { TitleRecord } from "@/types/records";

export interface OmdbJobExecutionResult {
  job: SyncJobRecord;
  title: TitleRecord;
  details: OmdbDetails;
}

export function validateOmdbUpdateJob(job: SyncJobRecord): void {
  if (job.provider !== "omdb" || job.tipo !== "atualizacao") {
    throw new Error("A tarefa não é uma atualização OMDb.");
  }
  if (job.entidade !== "titulos" || !job.entidade_id) {
    throw new Error("A tarefa não identifica um título válido.");
  }
  if (job.estado !== "pendente") {
    throw new Error("Apenas tarefas OMDb pendentes podem ser executadas.");
  }
}

export async function listPendingOmdbJobs(): Promise<SyncJobRecord[]> {
  return (await syncJobRepository.list({
    page: 1,
    perPage: 100,
    filter:
      'provider = "omdb" && tipo = "atualizacao" && estado = "pendente"',
    sort: "iniciado_em",
  })).items;
}

export async function executeOmdbUpdateJob(
  job: SyncJobRecord,
): Promise<OmdbJobExecutionResult> {
  validateOmdbUpdateJob(job);
  const running = await startSyncJob(job);

  try {
    const title = await titleRepository.get(job.entidade_id!);
    const imdbId = String(
      (title as unknown as Record<string, unknown>).imdb_id || "",
    );
    if (!/^tt\d{7,8}$/.test(imdbId)) {
      throw new Error("O título não tem um IMDb ID válido.");
    }

    const details = await loadOmdbDetails(imdbId);
    const progressed = await updateSyncProgress(
      { ...running, estado: "em_execucao" },
      {
        processados: 1,
        sucessos: 1,
        falhas: 0,
        total: 1,
        detalhes: {
          modo: "revisao_manual",
          title_id: title.id,
          imdb_id: imdbId,
          metadados_carregados: true,
        },
      },
    );
    const completed = await finishSyncJob(
      { ...progressed, estado: "em_execucao" },
      "concluido",
    );
    return { job: completed, title, details };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    await finishSyncJob(
      { ...running, estado: "em_execucao" },
      "falhou",
      message,
    );
    throw new Error(message);
  }
}
