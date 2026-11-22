import { describe, expect, it } from "vitest";
import { selectTmdbBatch, TMDB_BATCH_MAX } from "./tmdbBatchExecutor";

describe("execução TMDB em lote", () => {
  it("seleciona apenas atualizações TMDB pendentes de títulos", () => {
    const jobs = [
      { id: "1", provider: "tmdb", tipo: "atualizacao", estado: "pendente", entidade: "titulos", entidade_id: "t1" },
      { id: "2", provider: "omdb", tipo: "atualizacao", estado: "pendente", entidade: "titulos", entidade_id: "t2" },
      { id: "3", provider: "tmdb", tipo: "atualizacao", estado: "concluido", entidade: "titulos", entidade_id: "t3" },
    ] as any;
    expect(selectTmdbBatch(jobs, 10).map((item) => item.id)).toEqual(["1"]);
  });

  it("limita o lote ao máximo operacional", () => {
    const jobs = Array.from({ length: 40 }, (_, index) => ({
      id: String(index), provider: "tmdb", tipo: "atualizacao",
      estado: "pendente", entidade: "titulos", entidade_id: `t${index}`,
    })) as any;
    expect(selectTmdbBatch(jobs, 100)).toHaveLength(TMDB_BATCH_MAX);
  });
});
