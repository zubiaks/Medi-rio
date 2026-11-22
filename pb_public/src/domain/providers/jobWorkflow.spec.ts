import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelSyncJob,
  createSyncJob,
  finishSyncJob,
  jobDurationSeconds,
  repeatSyncJob,
  startSyncJob,
  updateSyncProgress,
} from "./jobWorkflow";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("./repository", () => ({
  syncJobRepository: {
    create: mocks.create,
    update: mocks.update,
  },
}));

beforeEach(() => {
  mocks.create.mockReset();
  mocks.update.mockReset();
});

describe("jobWorkflow", () => {
  it("impede tarefas equivalentes activas", async () => {
    await expect(
      createSyncJob(
        { tipo: "enriquecimento", provider: "tmdb" },
        [{ tipo: "enriquecimento", provider: "tmdb", estado: "pendente" }] as any,
      ),
    ).rejects.toThrow("equivalente");
  });

  it("inicia apenas tarefas pendentes", async () => {
    mocks.update.mockResolvedValue({ id: "j1", estado: "em_execucao" });
    await startSyncJob({ id: "j1", estado: "pendente" } as any);
    expect(mocks.update).toHaveBeenCalledWith(
      "j1",
      expect.objectContaining({ estado: "em_execucao" }),
    );
  });

  it("limita o progresso ao total", async () => {
    mocks.update.mockResolvedValue({});
    await updateSyncProgress(
      { id: "j1", estado: "em_execucao", total: 10 } as any,
      { processados: 12, sucessos: 9, falhas: 3 },
    );
    expect(mocks.update).toHaveBeenCalledWith(
      "j1",
      expect.objectContaining({ processados: 10 }),
    );
  });

  it("exige erro ao terminar como falha", async () => {
    await expect(
      finishSyncJob({ id: "j1", estado: "em_execucao" } as any, "falhou"),
    ).rejects.toThrow("erro");
  });

  it("cancela tarefas activas", async () => {
    mocks.update.mockResolvedValue({});
    await cancelSyncJob({ id: "j1", estado: "pendente" } as any);
    expect(mocks.update).toHaveBeenCalledWith(
      "j1",
      expect.objectContaining({ estado: "cancelado" }),
    );
  });

  it("repete uma tarefa encerrada através de um novo record", async () => {
    mocks.create.mockResolvedValue({ id: "j2" });
    await repeatSyncJob(
      {
        id: "j1",
        tipo: "enriquecimento",
        provider: "tmdb",
        estado: "falhou",
        iniciado_em: "2026-11-22T10:00:00Z",
      } as any,
      [],
    );
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ estado: "pendente" }),
    );
  });

  it("calcula a duração em segundos", () => {
    expect(
      jobDurationSeconds({
        iniciado_em: "2026-11-22T10:00:00Z",
        terminado_em: "2026-11-22T10:02:30Z",
      }),
    ).toBe(150);
  });
});
