/** Mediário | Cliente das rotas locais OMDb. */
import { pb } from "@/infrastructure/pocketbase/client";

export type OmdbType = "" | "movie" | "series" | "episode";
export interface OmdbSearchResult { imdb_id: string; title: string; year: string; type: string; poster_url: string }
export interface OmdbSearchResponse { page: number; total_results: number; results: OmdbSearchResult[]; message?: string }
export interface OmdbRating { Source: string; Value: string }
export interface OmdbDetails {
  title: string; year: string; rated: string; released: string; runtime: string;
  genres: string[]; director: string; writer: string; actors: string; plot: string;
  languages: string[]; countries: string[]; awards: string; poster_url: string;
  ratings: OmdbRating[]; metascore: number | null; imdb_rating: number | null;
  imdb_votes: number | null; imdb_id: string; type: string;
  total_seasons: number | null; box_office: string; production: string;
}

export async function searchOmdb(
  query: string,
  type: OmdbType = "",
  year = "",
  page = 1,
): Promise<OmdbSearchResponse> {
  const params = new URLSearchParams({ query, type, year, page: String(page) });
  return pb.send(`/api/mediario/providers/omdb/search?${params.toString()}`, {
    method: "GET",
  });
}

export async function loadOmdbDetails(imdbId: string): Promise<OmdbDetails> {
  return pb.send(`/api/mediario/providers/omdb/details/${imdbId}`, {
    method: "GET",
  });
}
