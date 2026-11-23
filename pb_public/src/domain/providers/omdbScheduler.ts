/** Mediário | Agendamento de atualização OMDb sem execução automática. */
import { syncJobRepository } from "./repository";
import { createSyncJob } from "./jobWorkflow";
import type { SyncJobRecord } from "./records";
import type { TitleRecord } from "@/types/records";

export async function scheduleOmdbRefresh(
  title: TitleRecord,
): Promise<SyncJobRecord> {
  const record = title as unknown as Record<string, unknown>;
  if (!record.imdb_id) {
    throw new Error("O título ainda não tem IMDb ID.");
  }
  const active = await syncJobRepository.list({
    page: 1,
    perPage: 100,
    filter:
      `provider = "omdb" && entidade = "titulos" && ` +
      `entidade_id = "${title.id}" && ` +
      `(estado = "pendente" || estado = "em_execucao")`,
  });
  return createSyncJob({
    tipo: "atualizacao",
    provider: "omdb",
    entidade: "titulos",
    entidade_id: title.id,
    total: 1,
    detalhes: {
      imdb_id: record.imdb_id,
      titulo: title.titulo,
      revisao_manual_necessaria: true,
    },
  }, active.items);
}
