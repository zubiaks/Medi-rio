/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbCatalogueSync.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço TypeScript
 * Domínio: Providers / sincronização global TMDB
 * Finalidade: Criar tarefas limitadas para títulos desatualizados, sem as executar.
 */
import { titleRepository } from "@/domain/repositories";
import { syncJobRepository } from "./repository";
import { createSyncJob } from "./jobWorkflow";
import type { SyncJobRecord } from "./records";

export interface CatalogueScheduleResult {
  examined: number;
  created: number;
  skipped: number;
  errors: string[];
}

export async function scheduleTmdbCatalogue(limit = 25): Promise<CatalogueScheduleResult> {
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const titles = await titleRepository.list({
    page: 1,
    perPage: safeLimit,
    filter:
      'apagado = false && tmdb_id > 0 && tipo_tmdb != "" && ' +
      '(sync_estado = "nunca" || sync_estado = "desatualizado" || sync_estado = "erro")',
    sort: "ultima_sincronizacao,titulo",
  });
  const active = await syncJobRepository.list({
    page: 1,
    perPage: 500,
    filter:
      'provider = "tmdb" && tipo = "atualizacao" && ' +
      '(estado = "pendente" || estado = "em_execucao")',
  });
  const created: SyncJobRecord[] = [];
  const errors: string[] = [];

  for (const title of titles.items) {
    try {
      created.push(await createSyncJob({
        tipo: "atualizacao",
        provider: "tmdb",
        entidade: "titulos",
        entidade_id: title.id,
        total: 1,
        detalhes: {
          origem: "catalogo_global",
          titulo: title.titulo,
          revisao_manual_necessaria: true,
        },
      }, [...active.items, ...created]));
    } catch (cause) {
      errors.push(cause instanceof Error ? cause.message : String(cause));
    }
  }

  return {
    examined: titles.items.length,
    created: created.length,
    skipped: titles.items.length - created.length,
    errors,
  };
}
