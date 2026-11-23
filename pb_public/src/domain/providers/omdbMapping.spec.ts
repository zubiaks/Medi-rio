import { describe, expect, it } from "vitest";
import { omdbTitlePayload } from "./omdbMapping";

describe("mapeamento OMDb", () => {
  it("normaliza ratings, votos e duração", () => {
    expect(omdbTitlePayload({
      imdb_id: "tt0137523",
      imdb_rating: 8.8,
      imdb_votes: 2669989,
      metascore: 67,
      rated: "R",
      runtime: "139 min",
      poster_url: "poster",
    } as any)).toMatchObject({
      imdb_id: "tt0137523",
      imdb_rating: 8.8,
      imdb_votos: 2669989,
      metascore: 67,
      duracao_min: 139,
      rating_externo_fonte: "imdb",
    });
  });
});
