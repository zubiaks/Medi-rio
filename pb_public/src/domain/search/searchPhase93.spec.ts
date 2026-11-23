import { describe, expect, it } from "vitest";
import { actionsForSearchItem } from "./searchActions";
import { buildSearchUrl, parseSearchUrl } from "./searchUrlState";

describe("Fase 9.3", () => {
  it("serializa e recupera o estado da pesquisa", () => {
    const url = buildSearchUrl({
      query: "Alien",
      mode: "search",
      view: "list",
      filters: {
        entities: ["titles", "sources"],
        provider: "tmdb",
        yearFrom: 1970,
        yearTo: 1980,
        includeDeleted: false,
      },
    }, "/providers");
    const restored = parseSearchUrl(url.split("?")[1]);
    expect(restored).toMatchObject({
      query: "Alien",
      view: "list",
      filters: { provider: "tmdb", yearFrom: 1970, yearTo: 1980 },
    });
  });

  it("adiciona ações externas apenas às fontes", () => {
    expect(actionsForSearchItem({
      id: "s1", entity: "sources", title: "IMDb", subtitle: "", description: "",
      imageUrl: "", year: null, provider: "omdb",
      record: { external_id: "tt0078748", external_url: "https://www.imdb.com/title/tt0078748/" },
    }).map((item) => item.id)).toContain("open-source");
  });
});
