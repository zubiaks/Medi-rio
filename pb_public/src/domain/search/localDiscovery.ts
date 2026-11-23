/**
 * Mediário
 * Caminho: src/domain/search/localDiscovery.ts
 * Versão: 1.0.0
 * Domínio: Pesquisa e descoberta
 * Finalidade: Criar prateleiras locais sem pedidos a providers externos.
 */
import { pb } from "@/infrastructure/pocketbase/client";
import type { GlobalSearchItem } from "./globalSearch";

export type DiscoveryShelfId =
  | "favorites"
  | "top-rated"
  | "recent"
  | "needs-sync"
  | "without-poster";

export interface DiscoveryShelf {
  id: DiscoveryShelfId;
  title: string;
  description: string;
  items: GlobalSearchItem[];
}

function adapt(record: any): GlobalSearchItem {
  return {
    id: record.id,
    entity: "titles",
    title: record.titulo || "Sem título",
    subtitle: [record.titulo_original, record.ano].filter(Boolean).join(" · "),
    description: record.sinopse || "",
    imageUrl: record.poster_url || "",
    year: record.ano || null,
    provider: record.fonte_principal || "",
    record,
  };
}

async function titles(filter: string, sort: string): Promise<GlobalSearchItem[]> {
  const result = await pb.collection("titulos").getList(1, 24, {
    filter: `apagado = false && (${filter})`,
    sort,
    requestKey: `local-discovery-${filter}`,
  });
  return result.items.map(adapt);
}

export async function loadLocalDiscovery(): Promise<DiscoveryShelf[]> {
  const [favorites, topRated, recent, needsSync, withoutPoster] = await Promise.all([
    titles("favorito = true", "-updated"),
    titles("imdb_rating > 0 || tmdb_rating > 0", "-imdb_rating,-tmdb_rating,titulo"),
    titles("created != ''", "-created"),
    titles("sync_estado = 'nunca' || sync_estado = 'desatualizado' || sync_estado = 'erro'", "titulo"),
    titles("poster_url = '' && poster = ''", "titulo"),
  ]);

  return [
    {
      id: "favorites",
      title: "Favoritos",
      description: "Títulos marcados como favoritos.",
      items: favorites,
    },
    {
      id: "top-rated",
      title: "Melhor classificados",
      description: "Ordenados pelos ratings IMDb e TMDB disponíveis.",
      items: topRated,
    },
    {
      id: "recent",
      title: "Adicionados recentemente",
      description: "Registos mais recentes no catálogo.",
      items: recent,
    },
    {
      id: "needs-sync",
      title: "Precisam de atualização",
      description: "Nunca sincronizados, desatualizados ou com erro.",
      items: needsSync,
    },
    {
      id: "without-poster",
      title: "Sem poster",
      description: "Títulos que ainda não têm poster local nem externo.",
      items: withoutPoster,
    },
  ];
}
