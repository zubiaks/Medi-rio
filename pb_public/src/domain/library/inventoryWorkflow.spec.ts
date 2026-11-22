import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateInventoryProgress, completeInventory, createInventory } from "./inventoryWorkflow";

const mocks = vi.hoisted(() => ({
  copyList: vi.fn(),
  inventoryCreate: vi.fn(),
  inventoryUpdate: vi.fn(),
  inventoryDelete: vi.fn(),
  itemCreate: vi.fn(),
}));

vi.mock("./repository", () => ({
  libraryCopyRepository: { list: mocks.copyList },
}));

vi.mock("./inventoryRepository", () => ({
  inventoryRepository: {
    create: mocks.inventoryCreate,
    update: mocks.inventoryUpdate,
    delete: mocks.inventoryDelete,
  },
  inventoryItemRepository: { create: mocks.itemCreate },
}));

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
});

describe("inventoryWorkflow", () => {
  it("calcula o progresso da sessão", () => {
    const progress = calculateInventoryProgress([
      { estado: "Encontrado" },
      { estado: "Por verificar" },
      { estado: "Não localizado" },
    ] as any);
    expect(progress).toMatchObject({ total: 3, verificados: 2, restantes: 1, percentagem: 67 });
  });

  it("cria uma sessão e um item por exemplar", async () => {
    mocks.copyList.mockResolvedValue({ items: [{ id: "c1" }, { id: "c2" }], totalPages: 1 });
    mocks.inventoryCreate.mockResolvedValue({ id: "i1", nome: "Inventário", estado: "Preparação" });
    mocks.itemCreate.mockResolvedValue({});
    await createInventory({ nome: "Inventário anual" });
    expect(mocks.itemCreate).toHaveBeenCalledTimes(2);
  });

  it("impede a conclusão com itens por verificar", async () => {
    await expect(completeInventory({ id: "i1" } as any, [{ estado: "Por verificar" }] as any)).rejects.toThrow("por verificar");
  });
});
