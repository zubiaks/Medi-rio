/**
 * Projeto: Mediário
 * Ficheiro: src/domain/providers/jobWorkflow.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers e manutenção
 *
 * Finalidade:
 * Controla o ciclo de vida de `sync_jobs` e preserva o histórico através da
 * criação de uma nova tarefa ao repetir uma tarefa encerrada.
 *
 * Regras:
 * - Não reabre tarefas concluídas, parciais, falhadas ou canceladas.
 * - Impede tarefas equivalentes simultaneamente activas.
 * - Mantém contadores inteiros e não negativos.
 * - Não executa pedidos HTTP a providers externos no browser.
 */
import { syncJobRepository } from "./repository";
import type {
  SyncJobRecord,
  SyncJobState,
  SyncJobType,
} from "./records";

export interface CreateSyncJobInput {
  tipo: SyncJobType;
  provider: string;
  entidade?: string;
  entidade_id?: string;
  total?: number;
  detalhes?: unknown;
}

export interface SyncProgressInput {
  processados: number;
  sucessos: number;
  falhas: number;
  total?: number;
  detalhes?: unknown;
}

const activeStates: SyncJobState[] = ["pendente", "em_execucao"];

export function syncJobKey(
  value: Pick<SyncJobRecord, "tipo" | "provider" | "entidade" | "entidade_id">,
): string {
  return [
    value.tipo || "outro",
    value.provider.trim(),
    value.entidade?.trim() || "",
    value.entidade_id?.trim() || "",
  ]
    .join("::")
    .toLocaleLowerCase("pt-PT");
}

export function findEquivalentActiveJob(
  input: CreateSyncJobInput,
  jobs: SyncJobRecord[],
): SyncJobRecord | undefined {
  const key = syncJobKey(input);
  return jobs.find(
    (job) => activeStates.includes(job.estado || "pendente") && syncJobKey(job) === key,
  );
}

export async function createSyncJob(
  input: CreateSyncJobInput,
  existingJobs: SyncJobRecord[],
): Promise<SyncJobRecord> {
  if (!input.provider.trim()) {
    throw new Error("Indica o provider da tarefa.");
  }

  if (findEquivalentActiveJob(input, existingJobs)) {
    throw new Error("Já existe uma tarefa equivalente pendente ou em execução.");
  }

  return syncJobRepository.create({
    tipo: input.tipo,
    provider: input.provider.trim(),
    entidade: input.entidade?.trim() || "",
    entidade_id: input.entidade_id?.trim() || "",
    estado: "pendente",
    iniciado_em: new Date().toISOString(),
    terminado_em: "",
    total: Math.max(0, Math.trunc(input.total || 0)),
    processados: 0,
    sucessos: 0,
    falhas: 0,
    erro: "",
    detalhes: input.detalhes ?? null,
  });
}

export async function startSyncJob(job: SyncJobRecord): Promise<SyncJobRecord> {
  if (job.estado !== "pendente") {
    throw new Error("Apenas uma tarefa pendente pode ser iniciada.");
  }

  return syncJobRepository.update(job.id, {
    estado: "em_execucao",
    iniciado_em: new Date().toISOString(),
    terminado_em: "",
    erro: "",
  });
}

export async function updateSyncProgress(
  job: SyncJobRecord,
  input: SyncProgressInput,
): Promise<SyncJobRecord> {
  if (job.estado !== "em_execucao") {
    throw new Error("O progresso só pode ser actualizado numa tarefa em execução.");
  }

  const total = Math.max(0, Math.trunc(input.total ?? job.total ?? 0));
  const processados = Math.max(0, Math.trunc(input.processados));

  return syncJobRepository.update(job.id, {
    total,
    processados: total ? Math.min(processados, total) : processados,
    sucessos: Math.max(0, Math.trunc(input.sucessos)),
    falhas: Math.max(0, Math.trunc(input.falhas)),
    detalhes: input.detalhes ?? job.detalhes ?? null,
  });
}

export async function finishSyncJob(
  job: SyncJobRecord,
  state: Extract<SyncJobState, "concluido" | "parcial" | "falhou">,
  error = "",
): Promise<SyncJobRecord> {
  if (job.estado !== "em_execucao") {
    throw new Error("Apenas uma tarefa em execução pode ser encerrada.");
  }

  if (state === "falhou" && !error.trim()) {
    throw new Error("Indica o erro que causou a falha da tarefa.");
  }

  return syncJobRepository.update(job.id, {
    estado: state,
    terminado_em: new Date().toISOString(),
    erro: error.trim(),
  });
}

export async function cancelSyncJob(job: SyncJobRecord): Promise<SyncJobRecord> {
  if (!activeStates.includes(job.estado || "pendente")) {
    throw new Error("Esta tarefa já está encerrada.");
  }

  return syncJobRepository.update(job.id, {
    estado: "cancelado",
    terminado_em: new Date().toISOString(),
  });
}

export async function repeatSyncJob(
  job: SyncJobRecord,
  existingJobs: SyncJobRecord[],
): Promise<SyncJobRecord> {
  if (activeStates.includes(job.estado || "pendente")) {
    throw new Error("Uma tarefa activa não pode ser repetida.");
  }

  return createSyncJob(
    {
      tipo: job.tipo || "outro",
      provider: job.provider,
      entidade: job.entidade,
      entidade_id: job.entidade_id,
      total: job.total,
      detalhes: {
        repeticao_de: job.id,
        detalhes_anteriores: job.detalhes ?? null,
      },
    },
    existingJobs,
  );
}

export function jobDurationSeconds(
  job: Pick<SyncJobRecord, "iniciado_em" | "terminado_em">,
  now = new Date(),
): number {
  const start = new Date(job.iniciado_em).getTime();
  const end = job.terminado_em
    ? new Date(job.terminado_em).getTime()
    : now.getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.round((end - start) / 1000));
}
