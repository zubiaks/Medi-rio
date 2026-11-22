import { describe, expect, it } from "vitest";
import { tmdbExternalUrl, tmdbSourcePayload } from "./tmdbMapping";

describe("mapeamento TMDB", () => {
  const result = {
    id: 550,
    media_type: "movie",
    title: "Clube de Combate",
    original_title: "Fight Club",
    date: "1999-10-15",
    overview: "Sinopse",
    poster_url: "poster",
    backdrop_url: "backdrop",
    vote_average: 8.4,
    popularity: 100,
  };

  it("cria a ligação pública do TMDB", () => {
    expect(tmdbExternalUrl(result)).toBe(
      "https://www.themoviedb.org/movie/550",
    );
  });

  it("cria uma fonte externa compatível com o esquema", () => {
    expect(tmdbSourcePayload("title-1", result as any)).toMatchObject({
      titulo: "title-1",
      provider: "tmdb",
      external_id: "550",
      tipo_externo: "movie",
      principal: true,
    });
  });
});
