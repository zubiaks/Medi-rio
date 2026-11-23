/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/omdbEnrichment.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / OMDb
 * Finalidade: Comparar e selecionar campos OMDb antes da aplicação.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import type { TitleRecord } from "@/types/records";
import type { OmdbDetails } from "./omdbClient";
import { omdbDifferenceLabels, omdbTitlePayload } from "./omdbMapping";

export type OmdbEnrichmentField =
  | "imdb_id"
  | "imdb_rating"
  | "imdb_votos"
  | "metascore"
  | "classificacao_etaria"
  | "duracao_min"
  | "poster_url"
  | "rating_externo"
  | "rating_externo_fonte"
  | "rating_externo_votos";

export interface OmdbFieldDifference {
  field: OmdbEnrichmentField;
  label: string;
  currentValue: unknown;
  proposedValue: unknown;
  empty: boolean;
  changed: boolean;
}

function empty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function buildOmdbDifferences(
  title: TitleRecord,
  details: OmdbDetails,
): OmdbFieldDifference[] {
  const current = title as unknown as Record<string, unknown>;
  const proposed = omdbTitlePayload(details);
  const labels = omdbDifferenceLabels();

  return (Object.keys(proposed) as OmdbEnrichmentField[])
    .map((field) => ({
      field,
      label: labels[field] || field,
      currentValue: current[field] ?? null,
      proposedValue: proposed[field] ?? null,
      empty: empty(current[field]),
      changed:
        !empty(proposed[field]) &&
        String(current[field] ?? "") !== String(proposed[field]),
    }))
    .filter((item) => item.changed);
}

export function selectEmptyOmdbFields(
  differences: OmdbFieldDifference[],
): OmdbEnrichmentField[] {
  return differences.filter((item) => item.empty).map((item) => item.field);
}

export function buildSelectedOmdbPayload(
  details: OmdbDetails,
  selected: OmdbEnrichmentField[],
): Record<string, unknown> {
  const proposed = omdbTitlePayload(details);
  return Object.fromEntries(
    selected
      .filter((field) => proposed[field] !== undefined && proposed[field] !== "")
      .map((field) => [field, proposed[field]]),
  );
}
