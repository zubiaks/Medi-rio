import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTmdbWorkspaceTab,
  loadTmdbWorkspaceTab,
  saveTmdbWorkspaceTab,
} from "./tmdbWorkspaceState";

describe("estado do workspace TMDB", () => {
  beforeEach(() => sessionStorage.clear());

  it("usa Metadados quando não existe preferência", () => {
    expect(loadTmdbWorkspaceTab()).toBe("metadata");
  });

  it("guarda apenas o identificador do separador", () => {
    saveTmdbWorkspaceTab("images");
    expect(loadTmdbWorkspaceTab()).toBe("images");
    clearTmdbWorkspaceTab();
    expect(loadTmdbWorkspaceTab()).toBe("metadata");
  });
});
