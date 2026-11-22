import { describe, expect, it } from "vitest";
import { evaluateTmdbSyncNeed, TMDB_STALE_DAYS } from "./tmdbSyncScheduler";

describe("agendamento TMDB", () => {
  it("recomenda atualização depois do limite", () => {
    const result = evaluateTmdbSyncNeed(
      { ultima_sincronizacao: "2026-01-01T00:00:00Z", sync_estado: "atualizado" } as any,
      new Date("2026-04-15T00:00:00Z"),
    );
    expect(result.need).toBe("stale");
    expect(result.ageDays).toBeGreaterThan(TMDB_STALE_DAYS);
  });

  it("não recomenda uma sincronização recente", () => {
    const result = evaluateTmdbSyncNeed(
      { ultima_sincronizacao: "2026-11-20T00:00:00Z", sync_estado: "atualizado" } as any,
      new Date("2026-11-22T00:00:00Z"),
    );
    expect(result).toMatchObject({ need: "current", recommended: false });
  });

  it("prioriza uma última sincronização com erro", () => {
    const result = evaluateTmdbSyncNeed({ sync_estado: "erro", sync_erro: "Falha externa" } as any);
    expect(result).toMatchObject({ need: "error", recommended: true });
  });
});
