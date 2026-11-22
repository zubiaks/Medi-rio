import { describe, expect, it } from "vitest";
import { buildTmdbSyncHealth } from "./tmdbSyncHealth";

describe("diagnóstico TMDB", () => {
  it("atribui pontuação máxima a um título completo e recente", () => {
    const report = buildTmdbSyncHealth({
      tmdb_id: 348,
      tipo_tmdb: "movie",
      sinopse: "Sinopse",
      poster_url: "poster",
      backdrop_url: "backdrop",
      tmdb_rating: 8,
      imdb_id: "tt0078748",
      generos: ["g1"],
      fonte_principal: "tmdb",
      sync_estado: "atualizado",
      ultima_sincronizacao: "2026-11-20T00:00:00Z",
    } as any, { id: 348 } as any, new Date("2026-11-22T00:00:00Z"));
    expect(report.score).toBe(100);
    expect(report.tone).toBe("success");
  });

  it("deteta uma associação TMDB incoerente", () => {
    const report = buildTmdbSyncHealth({ tmdb_id: 1 } as any, { id: 2 } as any);
    expect(report.items.find((entry) => entry.key === "identity")).toMatchObject({
      ok: false,
      tone: "danger",
    });
  });
});
