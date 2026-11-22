import { describe, expect, it } from "vitest";
import { buildTmdbRelationPreview, slugifyTmdb } from "./tmdbRelations";

describe("relações TMDB", () => {
  it("normaliza slugs com acentos e espaços", () => {
    expect(slugifyTmdb("Ficção científica")).toBe("ficcao-cientifica");
  });

  it("cria uma pré-visualização apenas com relações disponíveis", () => {
    const result = buildTmdbRelationPreview({
      genres: [{ id: 878, name: "Ficção científica" }],
      production_countries: [{ iso_3166_1: "US", name: "Estados Unidos" }],
      spoken_languages: [],
      production_companies: [],
      belongs_to_collection: null,
      keywords: [{ id: 1, name: "espaço" }],
    } as any);
    expect(result.map((item) => item.field)).toEqual(["generos", "pais_origem", "keywords"]);
  });
});
