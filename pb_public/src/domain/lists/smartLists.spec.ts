import { describe, expect, it } from "vitest";
import { normalizeSmartListRule, sortSmartListItems } from "./smartLists";

describe("listas inteligentes", () => {
  it("limita resultados e aplica valores seguros", () => {
    expect(normalizeSmartListRule({ limit: 500 } as any)).toMatchObject({
      sort: "relevance",
      limit: 100,
      filters: { entities: ["titles"] },
    });
  });

  it("ordena por ano e rating", () => {
    const items = [
      { id: "1", title: "A", year: 1979, record: { imdb_rating: 8.5 } },
      { id: "2", title: "B", year: 1986, record: { imdb_rating: 8.4 } },
    ] as any;
    expect(sortSmartListItems(items, "year-desc")[0].id).toBe("2");
    expect(sortSmartListItems(items, "rating-desc")[0].id).toBe("1");
  });
});
