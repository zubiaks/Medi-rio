import { describe, expect, it } from "vitest";
import { validateTmdbUpdateJob } from "./tmdbJobExecutor";

describe("executor de tarefas TMDB", () => {
  it("aceita uma atualização pendente de título", () => {
    expect(() => validateTmdbUpdateJob({
      provider: "tmdb",
      tipo: "atualizacao",
      entidade: "titulos",
      entidade_id: "t1",
      estado: "pendente",
    } as any)).not.toThrow();
  });

  it("recusa uma tarefa já iniciada", () => {
    expect(() => validateTmdbUpdateJob({
      provider: "tmdb",
      tipo: "atualizacao",
      entidade: "titulos",
      entidade_id: "t1",
      estado: "em_execucao",
    } as any)).toThrow("pendentes");
  });
});
