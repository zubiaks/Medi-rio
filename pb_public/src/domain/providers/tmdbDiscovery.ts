/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbDiscovery.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Cliente TypeScript
 * Domínio: Providers / descoberta TMDB
 * Finalidade: Consultar recomendações e conteúdos semelhantes sem alterar o catálogo.
 */
import { pb } from "@/infrastructure/pocketbase/client";
import type { TmdbDetailType, TmdbSearchResponse } from "./tmdbClient";

export type TmdbDiscoveryMode = "recommendations" | "similar";

export async function loadTmdbDiscovery(
  type: TmdbDetailType,
  id: number,
  mode: TmdbDiscoveryMode,
  page = 1,
): Promise<TmdbSearchResponse> {
  return pb.send(
    `/api/mediario/providers/tmdb/discovery/${type}/${id}/${mode}?page=${page}`,
    { method: "GET" },
  );
}
