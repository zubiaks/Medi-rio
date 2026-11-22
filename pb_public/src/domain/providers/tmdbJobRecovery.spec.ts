import { describe, expect, it } from "vitest";
import {
  isRecoverableTmdbJob,
  summarizeRecoverableTmdbJobs,
  tmdbRecoveryCsv,
} from "./tmdbJobRecovery";

const jobs = [
  { id: "1", provider: "tmdb", tipo: "atualizacao", entidade: "titulos", estado: "falhou", erro: "Erro" },
  { id: "2", provider: "tmdb", tipo: "atualizacao", entidade: "titulos", estado: "parcial" },
  { id: "3", provider: "tmdb", tipo: "atualizacao", entidade: "titulos", estado: "concluido" },
] as any;

describe("recuperação de tarefas TMDB", () => {
  it("identifica apenas estados recuperáveis", () => {
    expect(jobs.map(isRecoverableTmdbJob)).toEqual([true, true, false]);
    expect(summarizeRecoverableTmdbJobs(jobs)).toMatchObject({
      total: 2,
      failed: 1,
      partial: 1,
    });
  });

  it("exporta erros em CSV com cabeçalho", () => {
    const csv = tmdbRecoveryCsv(jobs);
    expect(csv).toContain('"entidade_id"');
    expect(csv).toContain('"Erro"');
    expect(csv).not.toContain('"concluido"');
  });
});
