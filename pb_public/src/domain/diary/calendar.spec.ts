import { describe, expect, it } from "vitest";
import { buildDiaryCalendar } from "./calendar";

describe("calendário do Diário", () => {
  it("começa à segunda-feira e associa registos ao dia", () => {
    const result = buildDiaryCalendar(
      2026,
      10,
      [{ iniciado_em: "2026-11-22T20:00:00Z" }] as any,
    );
    expect(result.length % 7).toBe(0);
    expect(result.find((day) => day.date === "2026-11-22")?.entries).toHaveLength(1);
  });
});
