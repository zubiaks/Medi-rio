/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbClosure.spec.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Teste de encerramento do marco TMDB
 * Domínio: Providers
 */
import { describe, expect, it } from "vitest";
import { normalizeTmdbOperationalSettings } from "./tmdbOperationalSettings";
import { buildTmdbOperationsReport } from "./tmdbOperationsReport";
import { buildTmdbSyncHealth } from "./tmdbSyncHealth";
import { tmdbExternalUrl } from "./tmdbMapping";

describe("encerramento do marco TMDB", () => {
  it("mantém URLs públicas sem HTML incorporado", () => {
    const url = tmdbExternalUrl({ id: 348, media_type: "movie" });
    expect(url).toBe("https://www.themoviedb.org/movie/348");
    expect(url).not.toContain("<a");
  });

  it("mantém limites operacionais dentro dos intervalos seguros", () => {
    const settings = normalizeTmdbOperationalSettings({
      batchMax: 999,
      requestsPerMinute: 999,
      retries: 999,
    });
    expect(settings).toMatchObject({
      batchMax: 50,
      requestsPerMinute: 40,
      retries: 5,
    });
  });

  it("produz diagnóstico e relatório sem dados simulados externos", () => {
    const health = buildTmdbSyncHealth({
      tmdb_id: 348,
      tipo_tmdb: "movie",
      sync_estado: "atualizado",
      fonte_principal: "tmdb",
      ultima_sincronizacao: "2026-11-22T00:00:00Z",
    } as any, { id: 348 } as any, new Date("2026-11-22T12:00:00Z"));
    const report = buildTmdbOperationsReport([], 7, new Date("2026-11-22T12:00:00Z"));
    expect(health.items.find((item) => item.key === "identity")?.ok).toBe(true);
    expect(report.daily).toHaveLength(7);
  });
});
