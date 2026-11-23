/** Mediário | Pesquisas guardadas localmente. */
import type { GlobalSearchFilters, SearchEntity } from "./globalSearch";

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: GlobalSearchFilters;
  createdAt: string;
}

const KEY = "mediario-saved-searches";
const MAX = 20;

export function loadSavedSearches(): SavedSearch[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function saveSearchPreset(
  name: string,
  query: string,
  filters: GlobalSearchFilters,
): SavedSearch[] {
  const normalizedName = name.trim();
  const normalizedQuery = query.trim();
  if (!normalizedName || normalizedQuery.length < 2) {
    throw new Error("Indica um nome e uma pesquisa com pelo menos dois caracteres.");
  }
  const preset: SavedSearch = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: normalizedName,
    query: normalizedQuery,
    filters: {
      entities: [...filters.entities] as SearchEntity[],
      provider: filters.provider || "",
      yearFrom: filters.yearFrom || null,
      yearTo: filters.yearTo || null,
      includeDeleted: Boolean(filters.includeDeleted),
    },
    createdAt: new Date().toISOString(),
  };
  const values = [
    preset,
    ...loadSavedSearches().filter(
      (item) => item.name.toLocaleLowerCase("pt-PT") !== normalizedName.toLocaleLowerCase("pt-PT"),
    ),
  ].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(values));
  return values;
}

export function deleteSavedSearch(id: string): SavedSearch[] {
  const values = loadSavedSearches().filter((item) => item.id !== id);
  localStorage.setItem(KEY, JSON.stringify(values));
  return values;
}
