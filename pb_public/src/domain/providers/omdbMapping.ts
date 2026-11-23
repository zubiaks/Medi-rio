/** Mediário | Mapeamento OMDb para os campos confirmados de títulos. */
import type { OmdbDetails } from "./omdbClient";

function runtimeMinutes(value: string): number | undefined {
  const match = value.match(/^(\d+)\s*min$/i);
  return match ? Number(match[1]) : undefined;
}

export function omdbTitlePayload(details: OmdbDetails): Record<string, unknown> {
  return {
    imdb_id: details.imdb_id,
    imdb_rating: details.imdb_rating ?? undefined,
    imdb_votos: details.imdb_votes ?? undefined,
    metascore: details.metascore ?? undefined,
    classificacao_etaria: details.rated || undefined,
    duracao_min: runtimeMinutes(details.runtime),
    poster_url: details.poster_url || undefined,
    rating_externo: details.imdb_rating ?? undefined,
    rating_externo_fonte: "imdb",
    rating_externo_votos: details.imdb_votes ?? undefined,
  };
}

export function omdbDifferenceLabels(): Record<string, string> {
  return {
    imdb_id: "IMDb ID",
    imdb_rating: "Classificação IMDb",
    imdb_votos: "Votos IMDb",
    metascore: "Metascore",
    classificacao_etaria: "Classificação etária",
    duracao_min: "Duração",
    poster_url: "Poster externo",
    rating_externo: "Rating externo",
    rating_externo_fonte: "Fonte do rating",
    rating_externo_votos: "Votos do rating externo",
  };
}
