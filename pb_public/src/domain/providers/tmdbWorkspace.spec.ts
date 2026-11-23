import { describe, expect, it } from "vitest";
import {
  availableTmdbWorkspaceTabs,
  nextTmdbWorkspaceTab,
} from "./tmdbWorkspace";

describe("espaço de trabalho TMDB", () => {
  it("oculta temporadas para filmes", () => {
    expect(availableTmdbWorkspaceTabs("movie").map((item) => item.id))
      .not.toContain("seasons");
  });

  it("mantém temporadas para séries", () => {
    expect(availableTmdbWorkspaceTabs("tv").map((item) => item.id))
      .toContain("seasons");
  });

  it("faz navegação circular pelos separadores disponíveis", () => {
    expect(nextTmdbWorkspaceTab("health", "movie", 1)).toBe("metadata");
    expect(nextTmdbWorkspaceTab("metadata", "movie", -1)).toBe("health");
  });
});
