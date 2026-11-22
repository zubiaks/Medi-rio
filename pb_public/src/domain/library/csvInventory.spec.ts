import { describe, expect, it } from "vitest";
import { exportLibraryCsv, parseLibraryCsv } from "./csvInventory";

describe("inventário CSV", () => {
  it("lê uma linha válida em português", () => {
    const result = parseLibraryCsv(
      "titulo,numero_copia,selado\nt1,2,sim",
    );

    expect(result[0]).toMatchObject({
      titulo: "t1",
      numero_copia: 2,
      selado: true,
      erros: [],
    });
  });

  it("exporta cabeçalho e valores protegidos por aspas", () => {
    const result = exportLibraryCsv([
      { titulo: "t1", localizacao: "Estante A" } as any,
    ]);

    expect(result).toContain('"Estante A"');
  });
});
