import { describe, expect, it } from "vitest";
import { buildProviderMetric } from "./providerOperations";

const jobs = [
  { provider: "omdb", estado: "concluido", iniciado_em: "2026-11-23T00:00:00Z", terminado_em: "2026-11-23T00:01:00Z" },
  { provider: "omdb", estado: "falhou", iniciado_em: "2026-11-23T00:02:00Z", terminado_em: "2026-11-23T00:04:00Z" },
  { provider: "tmdb", estado: "concluido" },
] as any;

describe("métricas transversais dos providers", () => {
  it("isola o provider e calcula métricas encerradas", () => {
    expect(buildProviderMetric("omdb", jobs)).toMatchObject({
      total: 2,
      completed: 1,
      failed: 1,
      successRate: 50,
      averageDurationSeconds: 90,
    });
  });
});
