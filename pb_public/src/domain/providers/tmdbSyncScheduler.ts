/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbSyncScheduler.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / agendamento TMDB
 * Finalidade: Avaliar a necessidade de atualização e criar tarefas sem duplicados.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import type { TitleRecord } from "@/types/records";
import { createSyncJob } from "./jobWorkflow";
import { syncJobRepository } from "./repository";
import type { SyncJobRecord } from "./records";

export const TMDB_STALE_DAYS = 90;

export type TmdbSyncNeed = "never" | "stale" | "error" | "current";

export interface TmdbSyncScheduleStatus {
  need: TmdbSyncNeed;
  label: string;
  detail: string;
  recommended: boolean;
  ageDays: number | null;
}

export function evaluateTmdbSyncNeed(
  title: TitleRecord,
  now = new Date(),
): TmdbSyncScheduleStatus {
  const record = title as unknown as Record<string, unknown>;
  const state = String(record.sync_estado || "nunca");
  const rawDate = record.ultima_sincronizacao;

  if (state === "erro") {
    return {
      need: "error",
      label: "Nova tentativa recomendada",
      detail: String(record.sync_erro || "A última sincronização terminou com erro."),
      recommended: true,
      ageDays: null,
    };
  }

  if (!rawDate) {
    return {
      need: "never",
      label: "Nunca sincronizado",
      detail: "O título ainda não tem uma sincronização TMDB concluída.",
      recommended: true,
      ageDays: null,
    };
  }

  const date = new Date(String(rawDate));
  const ageDays = Number.isFinite(date.getTime())
    ? Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86_400_000))
    : null;

  if (ageDays === null || ageDays > TMDB_STALE_DAYS || state === "desatualizado") {
    return {
      need: "stale",
      label: "Atualização recomendada",
      detail: ageDays === null
        ? "A data da última sincronização é inválida."
        : `A última sincronização tem ${ageDays} dias.`,
      recommended: true,
      ageDays,
    };
  }

  return {
    need: "current",
    label: "Sincronização atual",
    detail: `Última sincronização há ${ageDays} dias.`,
    recommended: false,
    ageDays,
  };
}

export async function scheduleTmdbRefresh(
  title: TitleRecord,
  force = false,
): Promise<SyncJobRecord> {
  const status = evaluateTmdbSyncNeed(title);
  if (!status.recommended && !force) {
    throw new Error(
      "A sincronização ainda está atual. Ativa o agendamento forçado para criar uma tarefa mesmo assim.",
    );
  }

  const existing = await syncJobRepository.list({
    page: 1,
    perPage: 100,
    filter:
      `provider = "tmdb" && entidade = "titulos" && ` +
      `entidade_id = "${title.id}" && ` +
      `(estado = "pendente" || estado = "em_execucao")`,
    sort: "-iniciado_em",
  });

  return createSyncJob(
    {
      tipo: "atualizacao",
      provider: "tmdb",
      entidade: "titulos",
      entidade_id: title.id,
      total: 1,
      detalhes: {
        titulo: title.titulo,
        motivo: status.need,
        forçado: force,
        dias_desde_sincronizacao: status.ageDays,
      },
    },
    existing.items,
  );
}
