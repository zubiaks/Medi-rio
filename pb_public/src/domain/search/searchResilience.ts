/**
 * Mediário
 * Caminho: src/domain/search/searchResilience.ts
 * Versão: 1.0.0
 * Domínio: Pesquisa e descoberta
 * Finalidade: Ordenação por relevância e tolerância a falhas parciais.
 */
import type { GlobalSearchItem, SearchEntity } from "./globalSearch";

export interface SearchEntityFailure {
  entity: SearchEntity;
  message: string;
}

export function relevanceScore(item: GlobalSearchItem, query: string): number {
  const term = query.trim().toLocaleLowerCase("pt-PT");
  const title = item.title.toLocaleLowerCase("pt-PT");
  const subtitle = item.subtitle.toLocaleLowerCase("pt-PT");
  const description = item.description.toLocaleLowerCase("pt-PT");
  let score = item.entity === "titles" ? 10 : 0;
  if (title === term) score += 100;
  else if (title.startsWith(term)) score += 70;
  else if (title.includes(term)) score += 45;
  if (subtitle.includes(term)) score += 20;
  if (description.includes(term)) score += 5;
  return score;
}

export function sortSearchItems(
  items: GlobalSearchItem[],
  query: string,
): GlobalSearchItem[] {
  return [...items].sort((a, b) =>
    relevanceScore(b, query) - relevanceScore(a, query) ||
    a.title.localeCompare(b.title, "pt-PT"),
  );
}
