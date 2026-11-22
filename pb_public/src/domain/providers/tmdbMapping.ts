/** Mapeamento seguro de resultados TMDB para fontes externas. */
import type { ExternalSourceRecord } from "./records";
import type { TmdbDetails, TmdbSearchResult } from "./tmdbClient";

export function tmdbExternalUrl(result: Pick<TmdbSearchResult, "id" | "media_type">): string {
  const type = result.media_type === "tv" ? "tv" : "movie";
  return `https://www.themoviedb.org/${type}/${result.id}`;
}

export function tmdbSourcePayload(
  titleId: string,
  result: TmdbSearchResult,
  details?: TmdbDetails,
): Omit<ExternalSourceRecord, "id" | "created" | "updated"> {
  return {
    titulo: titleId,
    provider: "tmdb",
    external_id: String(result.id),
    external_url: tmdbExternalUrl(result),
    tipo_externo: result.media_type === "tv" ? "tv" : "movie",
    principal: true,
    ultima_sincronizacao: new Date().toISOString(),
    metadata_extra: {
      titulo: details?.title || result.title,
      titulo_original: details?.original_title || result.original_title,
      data: details?.date || result.date,
      sinopse: details?.overview || result.overview,
      tagline: details?.tagline || "",
      poster_url: details?.poster_url || result.poster_url,
      backdrop_url: details?.backdrop_url || result.backdrop_url,
      imdb_id: details?.imdb_id || "",
      rating_tmdb: details?.vote_average ?? result.vote_average,
      votos_tmdb: details?.vote_count || 0,
      idioma_original: details?.original_language || "",
      generos: details?.genres || [],
    },
  };
}
