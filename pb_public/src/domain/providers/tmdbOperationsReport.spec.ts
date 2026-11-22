import { describe, expect, it } from "vitest";
import {
  buildTmdbOperationsReport,
  tmdbOperationsReportCsv,
} from "./tmdbOperationsReport";

const jobs = [
  { provider: "tmdb", estado: "concluido", terminado_em: "2026-11-22T10:00:00Z" },
  { provider: "tmdb", estado: "falhou", terminado_em: "2026-11-22T11:00:00Z" },
  { provider: "omdb", estado: "concluido", terminado_em: "2026-11-22T11:00:00Z" },
] as any;

describe("relatório operacional TMDB", () => {
  it("filtra o provider e calcula a taxa de sucesso", () => {
    const report = buildTmdbOperationsReport(jobs, 7, new Date("2026-11-22T23:00:00Z"));
    expect(report).toMatchObject({ total: 2, completed: 1, failed: 1, successRate: 50 });
    expect(report.daily).toHaveLength(7);
  });

  it("exporta uma linha diária em CSV", () => {
    const csv = tmdbOperationsReportCsv(
      buildTmdbOperationsReport(jobs, 7, new Date("2026-11-22T23:00:00Z")),
    );
    expect(csv).toContain('"taxa_sucesso_percentagem"');
    expect(csv).toContain('"2026-11-22","2","1","1"');
  });
});
