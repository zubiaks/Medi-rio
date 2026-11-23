import { describe, expect, it } from "vitest";
import { validateOmdbUpdateJob } from "./omdbJobExecutor";

describe("executor OMDb", () => {
  it("aceita uma atualização OMDb pendente", () => {
    expect(() => validateOmdbUpdateJob({
      provider: "omdb",
      tipo: "atualizacao",
      entidade: "titulos",
      entidade_id: "t1",
      estado: "pendente",
    } as any)).not.toThrow();
  });

  it("recusa tarefas de outro provider", () => {
    expect(() => validateOmdbUpdateJob({
      provider: "tmdb",
      tipo: "atualizacao",
      entidade: "titulos",
      entidade_id: "t1",
      estado: "pendente",
    } as any)).toThrow("OMDb");
  });
});
