/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/omdbRatings.ts
 * Versão: 1.0.0
 * Domínio: Providers / OMDb
 * Finalidade: Normalizar ratings múltiplos e avaliar cobertura OMDb.
 */
import type { TitleRecord } from "@/types/records";
import type { OmdbDetails, OmdbRating } from "./omdbClient";

export interface NormalizedOmdbRatings {
  imdb: number | null;
  rottenTomatoes: number | null;
  metacritic: number | null;
}

export interface OmdbHealthItem {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
  required: boolean;
}

export interface OmdbHealthReport {
  score: number;
  completed: number;
  total: number;
  items: OmdbHealthItem[];
}

function percentage(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)%$/);
  return match ? Number(match[1]) : null;
}

function scoreOf(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)\/(10|100)$/);
  if (!match) return null;
  const number = Number(match[1]);
  return Number(match[2]) === 10 ? number : number / 10;
}

export function normalizeOmdbRatings(
  ratings: OmdbRating[],
): NormalizedOmdbRatings {
  const source = new Map(ratings.map((item) => [item.Source, item.Value]));
  return {
    imdb: scoreOf(source.get("Internet Movie Database") || ""),
    rottenTomatoes: percentage(source.get("Rotten Tomatoes") || ""),
    metacritic: percentage(source.get("Metacritic") || ""),
  };
}

function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

export function buildOmdbHealth(
  title: TitleRecord,
  details?: OmdbDetails | null,
): OmdbHealthReport {
  const record = title as unknown as Record<string, unknown>;
  const identityMatches = !details || !record.imdb_id ||
    record.imdb_id === details.imdb_id;
  const ratings = details ? normalizeOmdbRatings(details.ratings) : null;
  const items: OmdbHealthItem[] = [
    {
      key: "imdb_id",
      label: "IMDb ID",
      ok: present(record.imdb_id),
      detail: present(record.imdb_id) ? "Identificador associado." : "IMDb ID em falta.",
      required: true,
    },
    {
      key: "identity",
      label: "Coerência da associação",
      ok: identityMatches,
      detail: identityMatches
        ? "O detalhe OMDb corresponde ao título associado."
        : "O IMDb ID guardado não corresponde ao detalhe carregado.",
      required: true,
    },
    {
      key: "imdb_rating",
      label: "Rating IMDb",
      ok: present(record.imdb_rating),
      detail: present(record.imdb_rating)
        ? "Classificação IMDb preenchida."
        : "Classificação IMDb em falta.",
      required: false,
    },
    {
      key: "imdb_votes",
      label: "Votos IMDb",
      ok: present(record.imdb_votos),
      detail: present(record.imdb_votos)
        ? "Votos IMDb preenchidos."
        : "Votos IMDb em falta.",
      required: false,
    },
    {
      key: "metascore",
      label: "Metascore",
      ok: present(record.metascore),
      detail: present(record.metascore)
        ? "Metascore preenchido."
        : "Metascore em falta.",
      required: false,
    },
    {
      key: "rotten_tomatoes",
      label: "Rotten Tomatoes",
      ok: Boolean(ratings?.rottenTomatoes),
      detail: ratings?.rottenTomatoes
        ? `${ratings.rottenTomatoes}% disponível no detalhe OMDb.`
        : "Rating Rotten Tomatoes indisponível.",
      required: false,
    },
  ];
  const completed = items.filter((item) => item.ok).length;
  return {
    score: Math.round((completed / items.length) * 100),
    completed,
    total: items.length,
    items,
  };
}
