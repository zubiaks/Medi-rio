import { describe, expect, it } from "vitest";
import { detectIncompleteSources, detectStuckJobs } from "./diagnostics";

describe("diagnóstico de manutenção", () => {
  it("detecta tarefas em execução há demasiado tempo", () => {
    const result = detectStuckJobs(
      [{ id: "j1", provider: "tmdb", estado: "em_execucao", iniciado_em: "2026-11-22T10:00:00Z" }] as any,
      new Date("2026-11-22T12:00:00Z"),
    );
    expect(result).toHaveLength(1);
  });
  it("detecta fontes sem endereço", () => {
    expect(detectIncompleteSources([{ id: "f1", provider: "tmdb", external_id: "1" }] as any)).toHaveLength(1);
  });
});
