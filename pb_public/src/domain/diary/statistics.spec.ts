import { describe, expect, it } from "vitest";
import {
  buildDiaryStatistics,
  buildMediaDistribution,
  buildMonthlyActivity,
} from "./statistics";

describe("estatísticas do Diário", () => {
  const entries = [
    {
      iniciado_em: "2026-11-20T20:00:00Z",
      progresso_seg: 3600,
      percentagem: 100,
      completo: true,
      revisualizacao: false,
      expand: { titulo: { midia: "Filme" } },
    },
    {
      iniciado_em: "2026-11-21T20:00:00Z",
      progresso_seg: 1800,
      percentagem: 50,
      completo: false,
      revisualizacao: true,
      expand: { titulo: { midia: "Série" } },
    },
  ] as any;

  it("calcula totais, horas e sequências", () => {
    const result = buildDiaryStatistics(
      entries,
      [{ rating: 8, recomenda: true }] as any,
      new Date("2026-11-22T12:00:00Z"),
    );

    expect(result).toMatchObject({
      totalEntries: 2,
      completedEntries: 1,
      rewatches: 1,
      totalHours: 1.5,
      averageProgress: 75,
      activeDays: 2,
      currentStreak: 2,
      longestStreak: 2,
      averageRating: 8,
    });
  });

  it("produz os doze meses do ano", () => {
    const result = buildMonthlyActivity(entries, 2026);
    expect(result).toHaveLength(12);
    expect(result[10]).toMatchObject({ entries: 2, hours: 1.5 });
  });

  it("calcula a distribuição por tipo de média", () => {
    expect(buildMediaDistribution(entries)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Filme", percentage: 50 }),
        expect.objectContaining({ label: "Série", percentage: 50 }),
      ]),
    );
  });
});
