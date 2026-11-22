import { describe, expect, it } from "vitest";
import {
  createAnnualSummaryCsv,
  createAnnualSummaryJson,
} from "./annualSummary";

describe("resumo anual", () => {
  it("exporta JSON para o ano seleccionado", () => {
    const result = JSON.parse(
      createAnnualSummaryJson(
        [{ iniciado_em: "2026-11-22T20:00:00Z" }] as any,
        [],
        2026,
      ),
    );
    expect(result.ano).toBe(2026);
    expect(result.estatisticas.totalEntries).toBe(1);
  });

  it("exporta CSV em português", () => {
    expect(createAnnualSummaryCsv([], [], 2026)).toContain(
      '"Horas consumidas"',
    );
  });
});
