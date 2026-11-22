import { describe, expect, it } from "vitest";
import {
  buildSelectedTmdbPayload,
  buildTmdbDifferences,
  selectEmptyTmdbFields,
} from "./tmdbEnrichment";

const details = {
  id: 348,
  media_type: "movie",
  title: "Alien - O 8.º Passageiro",
  original_title: "Alien",
  date: "1979-05-25",
  overview: "Sinopse TMDB",
  tagline: "No espaço, ninguém te consegue ouvir a gritar.",
  runtime: 117,
  episode_run_time: [],
  status: "Released",
  genres: [],
  imdb_id: "tt0078748",
  poster_url: "poster",
  backdrop_url: "backdrop",
  vote_average: 8.176,
  vote_count: 17187,
  popularity: 23,
  original_language: "en",
  homepage: "https://www.foxmovies.com/movies/alien",
};

describe("enriquecimento TMDB", () => {
  it("identifica diferenças sem selecionar valores manuais", () => {
    const differences = buildTmdbDifferences(
      { id: "t1", titulo: "Alien manual", midia: "m1", apagado: false } as any,
      details,
    );
    expect(differences.find((item) => item.field === "titulo")).toMatchObject({
      empty: false,
      changed: true,
    });
    expect(selectEmptyTmdbFields(differences)).not.toContain("titulo");
    expect(selectEmptyTmdbFields(differences)).toContain("imdb_id");
  });

  it("aplica apenas os campos selecionados", () => {
    expect(buildSelectedTmdbPayload(details, ["imdb_id", "duracao_min"]))
      .toEqual({ imdb_id: "tt0078748", duracao_min: 117 });
  });
});
