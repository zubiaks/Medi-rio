import { beforeEach, describe, expect, it } from "vitest";
import {
  addItemToPersonalList,
  createPersonalList,
  loadPersonalLists,
  movePersonalListItem,
} from "./personalLists";
import { exportPersonalLists, importPersonalLists } from "./listTransfer";

beforeEach(() => localStorage.clear());

describe("listas pessoais", () => {
  it("cria lista, evita duplicados e permite ordenar", () => {
    const list = createPersonalList("Favoritos de ficção")[0];
    const item = { id: "t1", entity: "titles", title: "Alien", subtitle: "1979", imageUrl: "" } as any;
    addItemToPersonalList(list.id, item);
    addItemToPersonalList(list.id, item);
    expect(loadPersonalLists()[0].items).toHaveLength(1);
    expect(movePersonalListItem(list.id, 0, 0)[0].items[0].order).toBe(0);
  });

  it("exporta e importa listas num formato versionado", () => {
    const lists = createPersonalList("Clássicos");
    expect(importPersonalLists(exportPersonalLists(lists))).toHaveLength(1);
  });
});
