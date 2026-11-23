import { describe, expect, it } from "vitest";
import { addSearchHistory, clearSearchHistory, loadSearchHistory } from "./searchHistory";

describe("histórico da pesquisa global", () => {
  it("deduplica termos sem distinguir maiúsculas", () => {
    clearSearchHistory();
    addSearchHistory("Alien");
    addSearchHistory("alien");
    expect(loadSearchHistory()).toHaveLength(1);
    expect(loadSearchHistory()[0].query).toBe("alien");
  });
});
