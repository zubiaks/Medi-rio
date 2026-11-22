/**
 * Projeto: Mediário
 * Ficheiro: src/domain/providers/tmdbClient.ts
 * Tipo: Cliente das rotas locais PocketBase para TMDB
 *
 * A chave TMDB nunca é enviada ao browser. Este cliente comunica apenas com
 * `/api/mediario/providers/tmdb/*` no backend local.
 */
import { pb } from "@/infrastructure/pocketbase/client";

export type TmdbMediaType = "multi" | "movie" | "tv" | "person";
export type TmdbDetailType = "movie" | "tv";

export interface TmdbSearchResult {
  id: number;
  media_type: string;
  title: string;
  original_title: string;
  date: string;
  overview: string;
  poster_url: string;
  backdrop_url: string;
  vote_average: number;
  popularity: number;
}

export interface TmdbSearchResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbSearchResult[];
}

export interface TmdbDetails extends TmdbSearchResult {
  tagline: string;
  runtime: number | null;
  episode_run_time: number[];
  status: string;
  genres: Array<{ id: number; name: string }>;
  imdb_id: string;
  vote_count: number;
  original_language: string;
  homepage: string;
}

export async function searchTmdb(
  query: string,
  type: TmdbMediaType = "multi",
  page = 1,
): Promise<TmdbSearchResponse> {
  const params = new URLSearchParams({ query, type, page: String(page) });
  return pb.send(`/api/mediario/providers/tmdb/search?${params.toString()}`, {
    method: "GET",
  });
}

export async function loadTmdbDetails(
  type: TmdbDetailType,
  id: number,
): Promise<TmdbDetails> {
  return pb.send(`/api/mediario/providers/tmdb/details/${type}/${id}`, {
    method: "GET",
  });
}
