import { beforeEach, describe, expect, it } from "vitest";
import { compareSearchItems } from "./searchComparator";
import { deleteSavedSearch, loadSavedSearches, saveSearchPreset } from "./savedSearches";

beforeEach(() => localStorage.clear());

describe("Fase 9.2", () => {
  it("guarda e remove pesquisas predefinidas", () => {
    const saved = saveSearchPreset("Sci-fi", "Alien", {
      entities: ["titles"],
      yearFrom: 1970,
      yearTo: 1999,
    });
    expect(saved).toHaveLength(1);
    expect(deleteSavedSearch(saved[0].id)).toHaveLength(0);
    expect(loadSavedSearches()).toEqual([]);
  });

  it("compara no máximo quatro resultados", () => {
    const items = Array.from({ length: 5 }, (_, index) => ({
      id: String(index), entity: "titles", title: `T${index}`, subtitle: "",
      description: "", imageUrl: "", year: 2000 + index, provider: "tmdb",
      record: { imdb_rating: 8 + index / 10 },
    })) as any;
    expect(compareSearchItems(items)[0].values).toHaveLength(4);
  });
});
