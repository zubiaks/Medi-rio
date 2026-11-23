/** Mediário | Comparação leve de resultados da pesquisa global. */
import type { GlobalSearchItem } from "./globalSearch";

export interface ComparisonRow {
  label: string;
  values: string[];
}

function value(item: GlobalSearchItem, key: string): string {
  const record = item.record as Record<string, unknown>;
  const raw = key === "year" ? item.year : key === "provider" ? item.provider : record[key];
  if (raw === null || raw === undefined || raw === "") return "—";
  if (Array.isArray(raw)) return raw.join(", ") || "—";
  return String(raw);
}

export function compareSearchItems(items: GlobalSearchItem[]): ComparisonRow[] {
  const selected = items.slice(0, 4);
  const fields = [
    ["Ano", "year"],
    ["Provider", "provider"],
    ["Estado", "estado"],
    ["IMDb", "imdb_rating"],
    ["TMDB", "tmdb_rating"],
    ["Metascore", "metascore"],
    ["Duração", "duracao_min"],
    ["Classificação", "classificacao_etaria"],
  ];
  return fields.map(([label, key]) => ({
    label,
    values: selected.map((item) => value(item, key)),
  }));
}
