/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbEnrichment.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / enriquecimento TMDB
 * Finalidade: Comparar e aplicar metadados TMDB de forma controlada.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import type { TitleRecord } from "@/types/records";
import type { TmdbDetails } from "./tmdbClient";

export const TMDB_ENRICHMENT_FIELDS = [
  "titulo",
  "titulo_original",
  "ano",
  "data_lancamento",
  "status_producao",
  "sinopse",
  "tagline",
  "duracao_min",
  "poster_url",
  "backdrop_url",
  "homepage",
  "imdb_id",
  "tmdb_rating",
  "tmdb_votos",
  "idioma_original",
] as const;

export type TmdbEnrichmentField = typeof TMDB_ENRICHMENT_FIELDS[number];
export type TmdbEnrichmentPayload = Partial<Record<TmdbEnrichmentField, string | number>>;

export interface TmdbFieldDifference {
  field: TmdbEnrichmentField;
  label: string;
  currentValue: string | number | null;
  proposedValue: string | number | null;
  empty: boolean;
  changed: boolean;
}

const labels: Record<TmdbEnrichmentField, string> = {
  titulo: "Título",
  titulo_original: "Título original",
  ano: "Ano",
  data_lancamento: "Data de lançamento",
  status_producao: "Estado de produção",
  sinopse: "Sinopse",
  tagline: "Tagline",
  duracao_min: "Duração",
  poster_url: "Poster externo",
  backdrop_url: "Backdrop externo",
  homepage: "Página oficial",
  imdb_id: "IMDb ID",
  tmdb_rating: "Classificação TMDB",
  tmdb_votos: "Votos TMDB",
  idioma_original: "Idioma original",
};

function empty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function tmdbTitlePayload(details: TmdbDetails): TmdbEnrichmentPayload {
  const year = details.date ? Number(details.date.slice(0, 4)) : 0;
  const runtime = details.runtime || details.episode_run_time?.[0] || 0;

  return {
    titulo: details.title,
    titulo_original: details.original_title,
    ano: year || undefined,
    data_lancamento: details.date,
    status_producao: details.status,
    sinopse: details.overview,
    tagline: details.tagline,
    duracao_min: runtime || undefined,
    poster_url: details.poster_url,
    backdrop_url: details.backdrop_url,
    homepage: details.homepage,
    imdb_id: details.imdb_id,
    tmdb_rating: details.vote_average,
    tmdb_votos: details.vote_count,
    idioma_original: details.original_language,
  };
}

export function buildTmdbDifferences(
  title: TitleRecord,
  details: TmdbDetails,
): TmdbFieldDifference[] {
  const proposed = tmdbTitlePayload(details);

  return TMDB_ENRICHMENT_FIELDS.map((field) => {
    const currentRecord = title as unknown as Record<string, unknown>;
    const currentValue = (currentRecord[field] as string | number | undefined) ?? null;
    const proposedValue = proposed[field] ?? null;

    return {
      field,
      label: labels[field],
      currentValue,
      proposedValue,
      empty: empty(currentValue),
      changed: !empty(proposedValue) && String(currentValue ?? "") !== String(proposedValue),
    };
  }).filter((item) => item.changed);
}

export function selectEmptyTmdbFields(
  differences: TmdbFieldDifference[],
): TmdbEnrichmentField[] {
  return differences.filter((item) => item.empty).map((item) => item.field);
}

export function buildSelectedTmdbPayload(
  details: TmdbDetails,
  selected: TmdbEnrichmentField[],
): TmdbEnrichmentPayload {
  const candidates = tmdbTitlePayload(details);
  return Object.fromEntries(
    selected
      .filter((field) => candidates[field] !== undefined && candidates[field] !== "")
      .map((field) => [field, candidates[field]]),
  ) as TmdbEnrichmentPayload;
}
