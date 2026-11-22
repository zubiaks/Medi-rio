/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbRelations.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / relações TMDB
 * Finalidade: Resolver, criar e aplicar relações estruturais do TMDB.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import { titleRepository } from "@/domain/repositories";
import type { BaseRecord, TitleRecord } from "@/types/records";
import type { TmdbDetails } from "./tmdbClient";

export type RelationMode = "append" | "replace";
export type TmdbRelationField = "generos" | "pais_origem" | "idiomas" | "companhias" | "colecao" | "keywords";

interface LookupRecord extends BaseRecord {
  nome?: string;
  slug?: string;
  codigo?: string;
  tmdb_id?: number;
}

export interface TmdbRelationPreview {
  field: TmdbRelationField;
  label: string;
  values: string[];
}

const repositories = {
  generos: new PocketBaseRepository<LookupRecord>("generos"),
  pais_origem: new PocketBaseRepository<LookupRecord>("paises"),
  idiomas: new PocketBaseRepository<LookupRecord>("idiomas"),
  companhias: new PocketBaseRepository<LookupRecord>("companhias"),
  colecao: new PocketBaseRepository<LookupRecord>("colecoes"),
  keywords: new PocketBaseRepository<LookupRecord>("keywords"),
};

function escapeFilter(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export function slugifyTmdb(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function buildTmdbRelationPreview(details: TmdbDetails): TmdbRelationPreview[] {
  return [
    { field: "generos", label: "Géneros", values: details.genres.map((item) => item.name) },
    { field: "pais_origem", label: "Países de origem", values: details.production_countries.map((item) => item.name || item.iso_3166_1) },
    { field: "idiomas", label: "Idiomas falados", values: details.spoken_languages.map((item) => item.name || item.english_name || item.iso_639_1) },
    { field: "companhias", label: "Companhias", values: details.production_companies.map((item) => item.name) },
    { field: "colecao", label: "Coleção ou saga", values: details.belongs_to_collection ? [details.belongs_to_collection.name] : [] },
    { field: "keywords", label: "Keywords", values: details.keywords.map((item) => item.name) },
  ].filter((item) => item.values.length > 0) as TmdbRelationPreview[];
}

async function first(repository: PocketBaseRepository<LookupRecord>, filter: string): Promise<LookupRecord | null> {
  const result = await repository.list({ page: 1, perPage: 1, filter });
  return result.items[0] || null;
}

async function resolveCode(field: "pais_origem" | "idiomas", code: string): Promise<string | null> {
  const record = await first(repositories[field], `codigo = "${escapeFilter(code)}"`);
  return record?.id || null;
}

async function resolveGenre(name: string): Promise<string> {
  const slug = slugifyTmdb(name);
  const existing = await first(repositories.generos, `nome = "${escapeFilter(name)}" || slug = "${escapeFilter(slug)}"`);
  if (existing) return existing.id;
  return (await repositories.generos.create({ nome: name, slug, ativo: true, ordem: 0 })).id;
}

async function resolveCompany(item: TmdbDetails["production_companies"][number]): Promise<string> {
  const byTmdb = await first(repositories.companhias, `tmdb_id = ${item.id}`);
  if (byTmdb) return byTmdb.id;
  const byName = await first(repositories.companhias, `nome = "${escapeFilter(item.name)}"`);
  if (byName) return byName.id;
  const countryId = item.origin_country ? await resolveCode("pais_origem", item.origin_country) : null;
  return (await repositories.companhias.create({
    nome: item.name,
    tipo: "Estudio",
    pais: countryId || "",
    tmdb_id: item.id,
    ativo: true,
    ordem: 0,
  })).id;
}

async function resolveKeyword(item: TmdbDetails["keywords"][number]): Promise<string> {
  const slug = slugifyTmdb(item.name);
  const existing = await first(repositories.keywords, `tmdb_id = ${item.id} || slug = "${escapeFilter(slug)}"`);
  if (existing) return existing.id;
  return (await repositories.keywords.create({ nome: item.name, slug, fonte: "tmdb", tmdb_id: item.id, ativo: true, ordem: 0 })).id;
}

async function resolveCollection(item: NonNullable<TmdbDetails["belongs_to_collection"]>): Promise<string> {
  const slug = slugifyTmdb(item.name);
  const existing = await first(repositories.colecao, `slug = "${escapeFilter(slug)}"`);
  if (existing) return existing.id;
  return (await repositories.colecao.create({ nome: item.name, slug, tipo: "Saga", canonico: true, ordem: 0 })).id;
}

function merge(current: string[] | undefined, incoming: string[], mode: RelationMode): string[] {
  return mode === "replace" ? [...new Set(incoming)] : [...new Set([...(current || []), ...incoming])];
}

export async function applyTmdbRelations(
  title: TitleRecord,
  details: TmdbDetails,
  selected: TmdbRelationField[],
  mode: RelationMode,
): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = {};
  const current = title as unknown as Record<string, unknown>;

  if (selected.includes("generos")) {
    const ids = await Promise.all(details.genres.map((item) => resolveGenre(item.name)));
    payload.generos = merge(current.generos as string[] | undefined, ids, mode);
  }
  if (selected.includes("pais_origem")) {
    const ids = (await Promise.all(details.production_countries.map((item) => resolveCode("pais_origem", item.iso_3166_1)))).filter(Boolean) as string[];
    payload.pais_origem = merge(current.pais_origem as string[] | undefined, ids, mode);
  }
  if (selected.includes("idiomas")) {
    const ids = (await Promise.all(details.spoken_languages.map((item) => resolveCode("idiomas", item.iso_639_1)))).filter(Boolean) as string[];
    payload.idiomas = merge(current.idiomas as string[] | undefined, ids, mode);
  }
  if (selected.includes("companhias")) {
    const ids = await Promise.all(details.production_companies.map(resolveCompany));
    payload.companhias = merge(current.companhias as string[] | undefined, ids, mode);
  }
  if (selected.includes("colecao") && details.belongs_to_collection) {
    const id = await resolveCollection(details.belongs_to_collection);
    payload.colecao = mode === "replace" || !current.colecao ? id : current.colecao;
  }
  if (selected.includes("keywords")) {
    const ids = await Promise.all(details.keywords.map(resolveKeyword));
    payload.keywords = merge(current.keywords as string[] | undefined, ids, mode);
  }

  if (details.certification) payload.classificacao_etaria = details.certification;
  if (details.trailer_youtube_key) payload.trailer_youtube_key = details.trailer_youtube_key;
  if (details.number_of_seasons) payload.n_temporadas = details.number_of_seasons;
  if (details.number_of_episodes) payload.n_episodios = details.number_of_episodes;

  await titleRepository.update(title.id, payload);
  return payload;
}
