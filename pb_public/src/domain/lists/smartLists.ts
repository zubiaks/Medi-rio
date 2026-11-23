/**
 * Mediário
 * Caminho: src/domain/lists/smartLists.ts
 * Versão: 1.0.0
 * Domínio: Coleções e listas
 * Finalidade: Executar regras inteligentes usando o motor de pesquisa global.
 */
import { globalSearch, type GlobalSearchItem } from "@/domain/search/globalSearch";
import {
  loadPersonalLists,
  replacePersonalLists,
  updatePersonalList,
  type PersonalList,
  type PersonalListItem,
  type PersonalListRule,
} from "./personalLists";

export type SmartListSort =
  | "relevance"
  | "title"
  | "year-desc"
  | "year-asc"
  | "rating-desc";

export interface ExtendedSmartListRule extends PersonalListRule {
  sort: SmartListSort;
  limit: number;
}

function rating(item: GlobalSearchItem): number {
  const record = item.record as Record<string, unknown>;
  return Number(record.imdb_rating || record.tmdb_rating || record.rating_externo || 0);
}

export function normalizeSmartListRule(
  rule?: Partial<ExtendedSmartListRule> | null,
): ExtendedSmartListRule {
  return {
    query: String(rule?.query || "").trim().slice(0, 300),
    filters: {
      entities: rule?.filters?.entities?.length
        ? [...rule.filters.entities]
        : ["titles"],
      provider: rule?.filters?.provider || "",
      yearFrom: rule?.filters?.yearFrom || null,
      yearTo: rule?.filters?.yearTo || null,
      includeDeleted: Boolean(rule?.filters?.includeDeleted),
    },
    sort: ["relevance", "title", "year-desc", "year-asc", "rating-desc"]
      .includes(rule?.sort || "")
      ? rule!.sort!
      : "relevance",
    limit: Math.max(1, Math.min(100, Math.trunc(Number(rule?.limit || 25)))),
  };
}

export function sortSmartListItems(
  items: GlobalSearchItem[],
  sort: SmartListSort,
): GlobalSearchItem[] {
  const result = [...items];
  if (sort === "title") {
    return result.sort((a, b) => a.title.localeCompare(b.title, "pt-PT"));
  }
  if (sort === "year-desc") {
    return result.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  }
  if (sort === "year-asc") {
    return result.sort((a, b) => Number(a.year || 9999) - Number(b.year || 9999));
  }
  if (sort === "rating-desc") {
    return result.sort((a, b) => rating(b) - rating(a));
  }
  return result;
}

function listItem(item: GlobalSearchItem, order: number): PersonalListItem {
  return {
    id: item.id,
    entity: item.entity,
    title: item.title,
    subtitle: item.subtitle,
    imageUrl: item.imageUrl,
    addedAt: new Date().toISOString(),
    order,
  };
}

export async function previewSmartList(
  rule: ExtendedSmartListRule,
): Promise<GlobalSearchItem[]> {
  const normalized = normalizeSmartListRule(rule);
  if (normalized.query.length < 2) {
    throw new Error("A regra inteligente precisa de um termo com pelo menos dois caracteres.");
  }
  const result = await globalSearch(
    normalized.query,
    normalized.filters,
    Math.min(100, normalized.limit),
  );
  return sortSmartListItems(result.items, normalized.sort)
    .slice(0, normalized.limit);
}

export async function refreshSmartList(listId: string): Promise<PersonalList[]> {
  const list = loadPersonalLists().find((item) => item.id === listId);
  if (!list || list.kind !== "smart") {
    throw new Error("A lista inteligente não foi encontrada.");
  }
  const rule = normalizeSmartListRule(list.rule as ExtendedSmartListRule | undefined);
  const items = await previewSmartList(rule);
  const updated = updatePersonalList(listId, { rule });
  return replacePersonalLists(updated.map((item) =>
    item.id === listId
      ? {
          ...item,
          items: items.map(listItem),
          updatedAt: new Date().toISOString(),
        }
      : item,
  ));
}

export function convertSmartListToManual(listId: string): PersonalList[] {
  return replacePersonalLists(loadPersonalLists().map((list) =>
    list.id === listId
      ? {
          ...list,
          kind: "manual" as const,
          rule: undefined,
          updatedAt: new Date().toISOString(),
        }
      : list,
  ));
}
