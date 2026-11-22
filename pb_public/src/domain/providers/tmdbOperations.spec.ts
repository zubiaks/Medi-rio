import { describe, expect, it } from "vitest";
import {
  buildTmdbOperationsSummary,
  findStuckTmdbJobs,
} from "./tmdbOperations";

const now = new Date("2026-11-22T12:00:00Z");

const jobs = [
  {
    provider: "tmdb",
    estado: "em_execucao",
    iniciado_em: "2026-11-22T10:00:00Z",
  },
  {
    provider: "tmdb",
    estado: "concluido",
    iniciado_em: "2026-11-22T11:00:00Z",
    terminado_em: "2026-11-22T11:02:00Z",
  },
  {
    provider: "tmdb",
    estado: "falhou",
    iniciado_em: "2026-11-22T11:10:00Z",
    terminado_em: "2026-11-22T11:11:00Z",
  },
] as any;

describe("monitorização TMDB", () => {
  it("deteta tarefas em execução há pelo menos trinta minutos", () => {
    expect(findStuckTmdbJobs(jobs, now)).toHaveLength(1);
    expect(findStuckTmdbJobs(jobs, now)[0].ageMinutes).toBe(120);
  });

  it("calcula taxa de sucesso e duração média", () => {
    const summary = buildTmdbOperationsSummary(jobs, now);
    expect(summary).toMatchObject({
      total: 3,
      running: 1,
      completed: 1,
      failed: 1,
      stuck: 1,
      successRate: 50,
      averageDurationSeconds: 90,
    });
  });
});
