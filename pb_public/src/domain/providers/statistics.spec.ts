import { describe, expect, it } from "vitest";
import { buildProviderSummaries, jobProgress } from "./statistics";

describe("estatísticas de providers", () => {
  it("agrupa fontes e tarefas por provider", () => {
    const result = buildProviderSummaries(
      [{ provider: "tmdb", titulo: "t1", principal: true }] as any,
      [{ provider: "tmdb", estado: "falhou" }] as any,
    );
    expect(result[0]).toMatchObject({ provider: "tmdb", sources: 1, failedJobs: 1 });
  });
  it("limita o progresso entre 0 e 100", () => {
    expect(jobProgress({ total: 10, processados: 12 } as any)).toBe(100);
  });
});
