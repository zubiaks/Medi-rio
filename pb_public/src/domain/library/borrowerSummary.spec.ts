import { describe, expect, it } from "vitest";
import { buildBorrowerSummaries } from "./borrowerSummary";

describe("buildBorrowerSummaries", () => {
  it("agrupa empréstimos por pessoa e contabiliza atrasos", () => {
    const result = buildBorrowerSummaries(
      [
        {
          pessoa: "p1",
          estado: "Emprestado",
          data_prevista: "2026-11-20",
          expand: { pessoa: { nome: "Ana" } },
        },
        {
          pessoa: "p1",
          estado: "Devolvido",
          data_emprestimo: "2026-10-01",
        },
      ] as any,
      "2026-11-22",
    );

    expect(result[0]).toMatchObject({
      name: "Ana",
      active: 1,
      overdue: 1,
      total: 2,
    });
  });
});
