import { describe, expect, it } from "vitest";
import {
  createInventoryCsv,
  createInventoryJson,
} from "./inventoryReport";

describe("inventoryReport", () => {
  it("exporta um relatório CSV", () => {
    const result = createInventoryCsv(
      { nome: "Inventário anual" } as any,
      [{ exemplar: "c1", estado: "Encontrado" }] as any,
    );

    expect(result).toContain('"Encontrado"');
  });

  it("exporta um relatório JSON", () => {
    const result = JSON.parse(
      createInventoryJson({ id: "i1" } as any, []),
    );

    expect(result.inventario.id).toBe("i1");
  });
});
