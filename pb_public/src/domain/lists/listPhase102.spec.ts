import { beforeEach, describe, expect, it } from "vitest";
import {
  buildListDashboardMetrics,
  duplicatePersonalList,
  filterPersonalListItems,
} from "./listDashboard";
import { compareSmartListSnapshot } from "./smartListDiff";
import { createPersonalList } from "./personalLists";

beforeEach(() => localStorage.clear());

describe("Fase 10.2", () => {
  it("calcula métricas e duplica listas", () => {
    const lists = createPersonalList("Clássicos");
    expect(buildListDashboardMetrics(lists)).toMatchObject({
      totalLists: 1,
      manualLists: 1,
    });
    expect(duplicatePersonalList(lists[0].id)).toHaveLength(2);
  });

  it("calcula adicionados, removidos e inalterados", () => {
    const diff = compareSmartListSnapshot(
      [{ id: "1", entity: "titles" }] as any,
      [
        { id: "1", entity: "titles" },
        { id: "2", entity: "titles" },
      ] as any,
    );
    expect(diff).toMatchObject({ unchanged: 1 });
    expect(diff.added).toHaveLength(1);
    expect(diff.removed).toHaveLength(0);
  });

  it("pesquisa dentro dos itens", () => {
    expect(filterPersonalListItems([
      { id: "1", entity: "titles", title: "Alien", subtitle: "1979" },
      { id: "2", entity: "titles", title: "Blade Runner", subtitle: "1982" },
    ] as any, "alien")).toHaveLength(1);
  });
});
