/**
 * Mediário
 * Caminho: src/domain/lists/listDashboard.ts
 * Versão: 1.0.0
 * Domínio: Coleções e listas
 * Finalidade: Métricas, duplicação e pesquisa local nas listas.
 */
import {
  loadPersonalLists,
  replacePersonalLists,
  type PersonalList,
  type PersonalListItem,
} from "./personalLists";

export interface ListDashboardMetrics {
  totalLists: number;
  manualLists: number;
  smartLists: number;
  pinnedLists: number;
  totalItems: number;
  uniqueItems: number;
}

export function buildListDashboardMetrics(
  lists: PersonalList[],
): ListDashboardMetrics {
  const unique = new Set<string>();
  let totalItems = 0;
  for (const list of lists) {
    totalItems += list.items.length;
    for (const item of list.items) unique.add(`${item.entity}:${item.id}`);
  }
  return {
    totalLists: lists.length,
    manualLists: lists.filter((list) => list.kind === "manual").length,
    smartLists: lists.filter((list) => list.kind === "smart").length,
    pinnedLists: lists.filter((list) => list.pinned).length,
    totalItems,
    uniqueItems: unique.size,
  };
}

export function duplicatePersonalList(listId: string): PersonalList[] {
  const source = loadPersonalLists().find((list) => list.id === listId);
  if (!source) throw new Error("A lista não foi encontrada.");
  const createdAt = new Date().toISOString();
  const duplicate: PersonalList = {
    ...source,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: `${source.name} — cópia`.slice(0, 120),
    pinned: false,
    createdAt,
    updatedAt: createdAt,
    items: source.items.map((item, index) => ({
      ...item,
      addedAt: createdAt,
      order: index,
    })),
    rule: source.rule
      ? JSON.parse(JSON.stringify(source.rule))
      : undefined,
  };
  return replacePersonalLists([duplicate, ...loadPersonalLists()]);
}

export function filterPersonalListItems(
  items: PersonalListItem[],
  query: string,
): PersonalListItem[] {
  const term = query.trim().toLocaleLowerCase("pt-PT");
  if (!term) return items;
  return items.filter((item) =>
    `${item.title} ${item.subtitle} ${item.entity}`
      .toLocaleLowerCase("pt-PT")
      .includes(term),
  );
}
