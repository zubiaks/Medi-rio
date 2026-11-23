/**
 * Mediário
 * Caminho: src/domain/lists/personalLists.ts
 * Versão: 1.0.0
 * Domínio: Coleções e listas
 * Finalidade: Listas pessoais manuais e inteligentes sem alterar o esquema PocketBase.
 */
import type { GlobalSearchFilters, GlobalSearchItem } from "@/domain/search/globalSearch";

export type PersonalListKind = "manual" | "smart";

export interface PersonalListItem {
  id: string;
  entity: GlobalSearchItem["entity"];
  title: string;
  subtitle: string;
  imageUrl: string;
  addedAt: string;
  order: number;
}

export interface PersonalListRule {
  query: string;
  filters: GlobalSearchFilters;
}

export interface PersonalList {
  id: string;
  name: string;
  description: string;
  kind: PersonalListKind;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  items: PersonalListItem[];
  rule?: PersonalListRule;
}

const KEY = "mediario-personal-lists-v1";
const MAX_LISTS = 50;
const MAX_ITEMS = 500;

function now(): string {
  return new Date().toISOString();
}

export function loadPersonalLists(): PersonalList[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, MAX_LISTS) : [];
  } catch {
    return [];
  }
}

export function replacePersonalLists(values: PersonalList[]): PersonalList[] {
  const normalized = values.slice(0, MAX_LISTS).map((list) => ({
    ...list,
    items: (list.items || []).slice(0, MAX_ITEMS),
  }));
  localStorage.setItem(KEY, JSON.stringify(normalized));
  return normalized;
}

export function createPersonalList(
  name: string,
  description = "",
  kind: PersonalListKind = "manual",
  rule?: PersonalListRule,
): PersonalList[] {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Indica um nome para a lista.");
  const value: PersonalList = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmed.slice(0, 120),
    description: description.trim().slice(0, 500),
    kind,
    color: "#6366f1",
    pinned: false,
    createdAt: now(),
    updatedAt: now(),
    items: [],
    rule,
  };
  return replacePersonalLists([value, ...loadPersonalLists()]);
}

export function updatePersonalList(
  id: string,
  changes: Partial<Pick<PersonalList, "name" | "description" | "color" | "pinned" | "rule">>,
): PersonalList[] {
  return replacePersonalLists(loadPersonalLists().map((list) =>
    list.id === id
      ? { ...list, ...changes, updatedAt: now() }
      : list,
  ));
}

export function deletePersonalList(id: string): PersonalList[] {
  return replacePersonalLists(loadPersonalLists().filter((list) => list.id !== id));
}

export function addItemToPersonalList(
  listId: string,
  item: GlobalSearchItem,
): PersonalList[] {
  return replacePersonalLists(loadPersonalLists().map((list) => {
    if (list.id !== listId) return list;
    if (list.kind !== "manual") throw new Error("Não é possível adicionar itens manualmente a uma lista inteligente.");
    if (list.items.some((existing) => existing.id === item.id && existing.entity === item.entity)) {
      return list;
    }
    const next: PersonalListItem = {
      id: item.id,
      entity: item.entity,
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
      addedAt: now(),
      order: list.items.length,
    };
    return {
      ...list,
      items: [...list.items, next].slice(0, MAX_ITEMS),
      updatedAt: now(),
    };
  }));
}

export function removeItemFromPersonalList(
  listId: string,
  entity: PersonalListItem["entity"],
  itemId: string,
): PersonalList[] {
  return replacePersonalLists(loadPersonalLists().map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items
            .filter((item) => !(item.id === itemId && item.entity === entity))
            .map((item, index) => ({ ...item, order: index })),
          updatedAt: now(),
        }
      : list,
  ));
}

export function movePersonalListItem(
  listId: string,
  from: number,
  to: number,
): PersonalList[] {
  return replacePersonalLists(loadPersonalLists().map((list) => {
    if (list.id !== listId) return list;
    const items = [...list.items];
    if (from < 0 || from >= items.length || to < 0 || to >= items.length) return list;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    return {
      ...list,
      items: items.map((item, index) => ({ ...item, order: index })),
      updatedAt: now(),
    };
  }));
}
