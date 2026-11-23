import { describe, expect, it } from "vitest";
import {
  buildOmdbDifferences,
  buildSelectedOmdbPayload,
  selectEmptyOmdbFields,
} from "./omdbEnrichment";

const details = {
  imdb_id: "tt0078748",
  imdb_rating: 8.5,
  imdb_votes: 1000,
  metascore: 89,
  rated: "R",
  runtime: "117 min",
  poster_url: "poster",
} as any;

describe("enriquecimento OMDb", () => {
  it("seleciona automaticamente apenas campos vazios", () => {
    const differences = buildOmdbDifferences({
      imdb_rating: 9,
      midia: "m1",
      titulo: "Alien",
      apagado: false,
    } as any, details);
    expect(selectEmptyOmdbFields(differences)).toContain("metascore");
    expect(selectEmptyOmdbFields(differences)).not.toContain("imdb_rating");
  });

  it("constrói apenas o payload selecionado", () => {
    expect(buildSelectedOmdbPayload(details, ["imdb_id", "metascore"]))
      .toEqual({ imdb_id: "tt0078748", metascore: 89 });
  });
});
