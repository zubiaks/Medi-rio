/** Mediário | Histórico local e privado de pesquisas globais. */
export interface SearchHistoryItem { query: string; usedAt: string }
const KEY = "mediario-global-search-history";
const MAX = 12;

export function loadSearchHistory(): SearchHistoryItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, MAX) : [];
  } catch { return []; }
}

export function addSearchHistory(query: string): SearchHistoryItem[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return loadSearchHistory();
  const items = [
    { query: trimmed, usedAt: new Date().toISOString() },
    ...loadSearchHistory().filter((item) => item.query.toLocaleLowerCase("pt-PT") !== trimmed.toLocaleLowerCase("pt-PT")),
  ].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function clearSearchHistory(): void {
  localStorage.removeItem(KEY);
}
