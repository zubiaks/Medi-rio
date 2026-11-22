import { describe, expect, it } from "vitest";
import { buildTitleSnapshot, restorableFields } from "./titleVersions";

describe("versões de títulos", () => {
  it("remove metadados internos do snapshot", () => {
    expect(buildTitleSnapshot({ id: "t1", collectionId: "c", titulo: "Alien", midia: "m", apagado: false } as any)).toEqual({ titulo: "Alien", midia: "m", apagado: false });
  });
  it("não permite restaurar identificadores internos nem a relação obrigatória de média", () => {
    expect(restorableFields({ id: "t1", titulo: "Alien", midia: "m", sinopse: "x" })).toEqual(["sinopse", "titulo"]);
  });
});
