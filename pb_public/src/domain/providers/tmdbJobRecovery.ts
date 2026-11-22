/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbJobRecovery.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / recuperação de tarefas TMDB
 * Finalidade: Rever, repetir e exportar tarefas TMDB encerradas com problemas.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { repeatSyncJob } from "./jobWorkflow";
import { syncJobRepository } from "./repository";
import type { SyncJobRecord } from "./records";

export type RecoverableTmdbState = "parcial" | "falhou" | "cancelado";

export interface TmdbRecoverySummary {
  total: number;
  failed: number;
  partial: number;
  cancelled: number;
}

export function isRecoverableTmdbJob(job: SyncJobRecord): boolean {
  return job.provider === "tmdb" &&
    job.tipo === "atualizacao" &&
    job.entidade === "titulos" &&
    ["parcial", "falhou", "cancelado"].includes(job.estado || "");
}

export function summarizeRecoverableTmdbJobs(
  jobs: SyncJobRecord[],
): TmdbRecoverySummary {
  const recoverable = jobs.filter(isRecoverableTmdbJob);
  return {
    total: recoverable.length,
    failed: recoverable.filter((job) => job.estado === "falhou").length,
    partial: recoverable.filter((job) => job.estado === "parcial").length,
    cancelled: recoverable.filter((job) => job.estado === "cancelado").length,
  };
}

export async function listRecoverableTmdbJobs(): Promise<SyncJobRecord[]> {
  return (await syncJobRepository.list({
    page: 1,
    perPage: 200,
    filter:
      'provider = "tmdb" && tipo = "atualizacao" && entidade = "titulos" && ' +
      '(estado = "parcial" || estado = "falhou" || estado = "cancelado")',
    sort: "-terminado_em,-iniciado_em",
  })).items;
}

export async function retryTmdbJobs(
  selected: SyncJobRecord[],
): Promise<{ created: SyncJobRecord[]; errors: Array<{ id: string; message: string }> }> {
  const active = (await syncJobRepository.list({
    page: 1,
    perPage: 500,
    filter:
      'provider = "tmdb" && tipo = "atualizacao" && ' +
      '(estado = "pendente" || estado = "em_execucao")',
  })).items;
  const created: SyncJobRecord[] = [];
  const errors: Array<{ id: string; message: string }> = [];

  for (const job of selected.filter(isRecoverableTmdbJob)) {
    try {
      const repeated = await repeatSyncJob(job, [...active, ...created]);
      created.push(repeated);
    } catch (cause) {
      errors.push({
        id: job.id,
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  return { created, errors };
}

function csvCell(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function tmdbRecoveryCsv(jobs: SyncJobRecord[]): string {
  const header = [
    "id", "entidade_id", "estado", "iniciado_em", "terminado_em",
    "processados", "sucessos", "falhas", "erro",
  ];
  const rows = jobs.filter(isRecoverableTmdbJob).map((job) => [
    job.id,
    job.entidade_id || "",
    job.estado || "",
    job.iniciado_em || "",
    job.terminado_em || "",
    job.processados || 0,
    job.sucessos || 0,
    job.falhas || 0,
    job.erro || "",
  ].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...rows].join("\r\n");
}
