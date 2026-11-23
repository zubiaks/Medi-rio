/**
 * Mediário
 * Caminho: src/domain/lists/listActivity.ts
 * Versão: 1.0.0
 * Domínio: Coleções e listas
 * Finalidade: Histórico local e reversão da última alteração das listas.
 */
import {
  loadPersonalLists,
  replacePersonalLists,
  type PersonalList,
} from "./personalLists";

export type ListActivityType =
  | "created"
  | "updated"
  | "duplicated"
  | "deleted"
  | "refreshed"
  | "converted"
  | "imported"
  | "restored";

export interface ListActivityEntry {
  id: string;
  type: ListActivityType;
  listId: string;
  listName: string;
  message: string;
  createdAt: string;
  before?: PersonalList;
  after?: PersonalList;
}

const KEY = "mediario-list-activity-v1";
const MAX = 100;

export function loadListActivity(): ListActivityEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function recordListActivity(
  entry: Omit<ListActivityEntry, "id" | "createdAt">,
): ListActivityEntry[] {
  const value: ListActivityEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const items = [value, ...loadListActivity()].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function clearListActivity(): void {
  localStorage.removeItem(KEY);
}

export function restoreListActivity(entryId: string): PersonalList[] {
  const entry = loadListActivity().find((item) => item.id === entryId);
  if (!entry?.before) {
    throw new Error("Esta atividade não contém um estado que possa ser restaurado.");
  }
  const lists = loadPersonalLists();
  const exists = lists.some((list) => list.id === entry.before!.id);
  const restored = exists
    ? lists.map((list) => list.id === entry.before!.id ? entry.before! : list)
    : [entry.before, ...lists];
  const saved = replacePersonalLists(restored);
  recordListActivity({
    type: "restored",
    listId: entry.before.id,
    listName: entry.before.name,
    message: `Estado anterior de “${entry.before.name}” restaurado.`,
    after: entry.before,
  });
  return saved;
}
