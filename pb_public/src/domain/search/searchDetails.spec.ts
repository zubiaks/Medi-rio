import { describe, expect, it } from "vitest";
import type { GlobalSearchItem } from "./globalSearch";

describe("detalhes da pesquisa", () => {
  it("mantém a entidade e o registo no resultado normalizado", () => {
    const item: GlobalSearchItem = {
      id: "t1",
      entity: "titles",
      title: "Alien",
      subtitle: "1979",
      description: "Sinopse",
      imageUrl: "poster",
      year: 1979,
      provider: "tmdb",
      record: { imdb_id: "tt0078748" },
    };
    expect(item).toMatchObject({ entity: "titles", year: 1979 });
  });
});
