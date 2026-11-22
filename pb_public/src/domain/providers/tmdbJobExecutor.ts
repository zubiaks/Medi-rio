/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbJobExecutor.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / execução de tarefas TMDB
 * Finalidade: Executar tarefas pendentes de atualização sem aplicar dados automaticamente.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { titleRepository } from "@/domain/repositories";
import { loadTmdbDetails, type TmdbDetailType, type TmdbDetails } from "./tmdbClient";
import { finishSyncJob, startSyncJob, updateSyncProgress } from "./jobWorkflow";
import { syncJobRepository } from "./repository";
import type { SyncJobRecord } from "./records";

export interface TmdbJobExecutionResult {
  job: SyncJobRecord;
  titleId: string;
  titleName: string;
  details: TmdbDetails;
}

export function validateTmdbUpdateJob(job: SyncJobRecord): void {
  if (job.provider !== "tmdb" || job.tipo !== "atualizacao") {
    throw new Error("A tarefa não é uma atualização TMDB.");
  }
  if (job.entidade !== "titulos" || !job.entidade_id) {
    throw new Error("A tarefa não identifica um título válido.");
  }
  if (job.estado !== "pendente") {
    throw new Error("Apenas tarefas pendentes podem ser executadas.");
  }
}

export async function listPendingTmdbJobs(): Promise<SyncJobRecord[]> {
  return (await syncJobRepository.list({
    page: 1,
    perPage: 100,
    filter:
      'provider = "tmdb" && tipo = "atualizacao" && estado = "pendente"',
    sort: "iniciado_em",
  })).items;
}

export async function executeTmdbUpdateJob(
  job: SyncJobRecord,
): Promise<TmdbJobExecutionResult> {
  validateTmdbUpdateJob(job);
  const running = await startSyncJob(job);

  try {
    const title = await titleRepository.get(job.entidade_id!);
    const record = title as unknown as Record<string, unknown>;
    const tmdbId = Number(record.tmdb_id || 0);
    const type = String(record.tipo_tmdb || "") as TmdbDetailType;

    if (!tmdbId || !["movie", "tv"].includes(type)) {
      throw new Error(
        "O título não tem tmdb_id e tipo_tmdb válidos para executar a atualização.",
      );
    }

    const details = await loadTmdbDetails(type, tmdbId);
    await updateSyncProgress(running, {
      processados: 1,
      sucessos: 1,
      falhas: 0,
      total: 1,
      detalhes: {
        modo: "revisao_manual",
        title_id: title.id,
        tmdb_id: tmdbId,
        tipo_tmdb: type,
        metadados_carregados: true,
      },
    });
    const completed = await finishSyncJob(
      { ...running, estado: "em_execucao" },
      "concluido",
    );

    return {
      job: completed,
      titleId: title.id,
      titleName: title.titulo,
      details,
    };
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
