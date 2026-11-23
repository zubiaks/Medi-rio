import { describe, expect, it } from "vitest";
import { relevanceScore, sortSearchItems } from "./searchResilience";
import { exportSavedSearches, importSavedSearches } from "./savedSearchTransfer";

describe("Fase 9.4", () => {
  it("prioriza correspondências exatas e títulos", () => {
    const items = [
      { id: "1", entity: "people", title: "Alien Actor", subtitle: "", description: "", imageUrl: "", year: null, provider: "", record: {} },
      { id: "2", entity: "titles", title: "Alien", subtitle: "1979", description: "", imageUrl: "", year: 1979, provider: "tmdb", record: {} },
    ] as any;
    expect(relevanceScore(items[1], "Alien")).toBeGreaterThan(relevanceScore(items[0], "Alien"));
    expect(sortSearchItems(items, "Alien")[0].id).toBe("2");
  });

  it("exporta e importa pesquisas com formato versionado", () => {
    const source = [{
      id: "s1",
      name: "Alien",
      query: "Alien",
      filters: { entities: ["titles"] },
      createdAt: "2026-11-23T00:00:00Z",
    }] as any;
    expect(importSavedSearches(exportSavedSearches(source))).toHaveLength(1);
  });
});
