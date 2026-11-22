/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbClient.ts
 * Versão do ficheiro: 1.1.0
 * Tipo: Cliente TypeScript das rotas locais TMDB
 * Domínio: Providers / TMDB
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
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

export interface TmdbNamedItem { id: number; name: string }
export interface TmdbCountry { iso_3166_1: string; name: string }
export interface TmdbLanguage { iso_639_1: string; name: string; english_name: string }
export interface TmdbCompany { id: number; name: string; origin_country: string; logo_url: string }
export interface TmdbCollection { id: number; name: string; poster_url: string; backdrop_url: string }
export interface TmdbKeyword { id: number; name: string }

export interface TmdbDetails extends TmdbSearchResult {
  tagline: string;
  runtime: number | null;
  episode_run_time: number[];
  status: string;
  genres: TmdbNamedItem[];
  imdb_id: string;
  vote_count: number;
  original_language: string;
  homepage: string;
  production_countries: TmdbCountry[];
  spoken_languages: TmdbLanguage[];
  production_companies: TmdbCompany[];
  belongs_to_collection: TmdbCollection | null;
  keywords: TmdbKeyword[];
  certification: string;
  trailer_youtube_key: string;
  number_of_seasons: number;
  number_of_episodes: number;
  credits: { cast: TmdbCastCredit[]; crew: TmdbCrewCredit[] };
  alternative_titles: TmdbAlternativeTitle[];
}

export async function searchTmdb(query: string, type: TmdbMediaType = "multi", page = 1): Promise<TmdbSearchResponse> {
  const params = new URLSearchParams({ query, type, page: String(page) });
  return pb.send(`/api/mediario/providers/tmdb/search?${params.toString()}`, { method: "GET" });
}

export async function loadTmdbDetails(type: TmdbDetailType, id: number): Promise<TmdbDetails> {
  return pb.send(`/api/mediario/providers/tmdb/details/${type}/${id}`, { method: "GET" });
}

export interface TmdbCastCredit { id: number; credit_id: string; name: string; character: string; order: number; popularity: number; profile_url: string; department: string }
export interface TmdbCrewCredit { id: number; credit_id: string; name: string; job: string; department: string; popularity: number; profile_url: string }

export interface TmdbAlternativeTitle { name: string; country: string; type: string }
