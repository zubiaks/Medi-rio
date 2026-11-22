/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbAlternativeTitles.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / títulos alternativos TMDB
 * Finalidade: Pré-visualizar e importar aliases localizados sem duplicados.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { BaseRecord, TitleRecord } from "@/types/records";
import type { TmdbAlternativeTitle, TmdbDetails } from "./tmdbClient";

interface AlternativeTitleRecord extends BaseRecord {
  titulo: string;
  nome: string;
  nome_normalizado: string;
  tipo?: string;
  idioma?: string;
  pais?: string;
  principal_no_idioma?: boolean;
  fonte?: string;
}

const repository = new PocketBaseRepository<AlternativeTitleRecord>("titulos_alternativos");

export function normalizeAlternativeTitle(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT").replace(/[^a-z0-9]+/g, " ").trim();
}

export function buildAlternativeTitlePreview(details: TmdbDetails): TmdbAlternativeTitle[] {
  const seen = new Set<string>();
  return (details.alternative_titles || []).filter((item) => {
    const key = `${normalizeAlternativeTitle(item.name)}::${item.country}`;
    if (!item.name.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name, "pt-PT"));
}

function escapeFilter(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export async function importAlternativeTitles(
  title: TitleRecord,
  selected: TmdbAlternativeTitle[],
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  for (const item of selected) {
    const normalized = normalizeAlternativeTitle(item.name);
    const existing = await repository.list({
      page: 1,
      perPage: 1,
      filter: `titulo = "${title.id}" && nome_normalizado = "${escapeFilter(normalized)}" && pais = "${escapeFilter(item.country)}"`,
    });
    if (existing.items[0]) { skipped += 1; continue; }
    await repository.create({
      titulo: title.id,
      nome: item.name.trim(),
      nome_normalizado: normalized,
      tipo: item.type || "alternativo",
      idioma: "",
      pais: item.country,
      principal_no_idioma: false,
      fonte: "tmdb",
    });
    created += 1;
  }
  return { created, skipped };
}
