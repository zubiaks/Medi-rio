/**
 * Mediário
 * Caminho: src/domain/search/searchUrlState.ts
 * Versão: 1.0.0
 * Domínio: Pesquisa e descoberta
 * Finalidade: Serializar o estado da pesquisa no URL sem depender do router.
 */
import type { GlobalSearchFilters, SearchEntity } from "./globalSearch";

export interface SearchUrlState {
  query: string;
  mode: "search" | "discover";
  view: "grid" | "list";
  filters: GlobalSearchFilters;
}

const validEntities: SearchEntity[] = [
  "titles", "people", "collections", "episodes", "streams", "aliases", "sources",
];

export function parseSearchUrl(search: string): Partial<SearchUrlState> {
  const params = new URLSearchParams(search);
  const entities = (params.get("entities") || "")
    .split(",")
    .filter((value): value is SearchEntity => validEntities.includes(value as SearchEntity));
  const yearFrom = Number(params.get("yearFrom") || 0) || null;
  const yearTo = Number(params.get("yearTo") || 0) || null;
  return {
    query: params.get("q") || "",
    mode: params.get("mode") === "discover" ? "discover" : "search",
    view: params.get("view") === "list" ? "list" : "grid",
    filters: {
      entities: entities.length ? entities : [...validEntities],
      provider: params.get("provider") || "",
      yearFrom,
      yearTo,
      includeDeleted: params.get("deleted") === "1",
    },
  };
}

export function buildSearchUrl(
  state: SearchUrlState,
  pathname = window.location.pathname,
): string {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  params.set("mode", state.mode);
  params.set("view", state.view);
  params.set("entities", state.filters.entities.join(","));
  if (state.filters.provider) params.set("provider", state.filters.provider);
  if (state.filters.yearFrom) params.set("yearFrom", String(state.filters.yearFrom));
  if (state.filters.yearTo) params.set("yearTo", String(state.filters.yearTo));
  if (state.filters.includeDeleted) params.set("deleted", "1");
  return `${pathname}?${params.toString()}`;
}

export function replaceSearchUrl(state: SearchUrlState): void {
  history.replaceState(history.state, "", buildSearchUrl(state));
}
