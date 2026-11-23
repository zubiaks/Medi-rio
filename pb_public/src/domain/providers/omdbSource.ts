/** Mediário | Fonte externa OMDb/IMDb. */
import type { ExternalSourceRecord } from "./records";
import type { OmdbDetails } from "./omdbClient";

export function imdbExternalUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/`;
}

export function omdbSourcePayload(
  titleId: string,
  details: OmdbDetails,
): Omit<ExternalSourceRecord, "id" | "created" | "updated"> {
  return {
    titulo: titleId,
    provider: "omdb",
    external_id: details.imdb_id,
    external_url: imdbExternalUrl(details.imdb_id),
    tipo_externo: details.type || "title",
    principal: false,
    ultima_sincronizacao: new Date().toISOString(),
    metadata_extra: {
      imdb_rating: details.imdb_rating,
      imdb_votes: details.imdb_votes,
      metascore: details.metascore,
      ratings: details.ratings,
      awards: details.awards,
      box_office: details.box_office,
      production: details.production,
    },
  };
}
