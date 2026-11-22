/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbOperationalSettings.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de configuração TypeScript
 * Domínio: Providers / operação TMDB
 * Finalidade: Centralizar limites operacionais sem expor a chave TMDB.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { appSettingRepository } from "./repository";
import type { AppSettingRecord } from "./records";

export const TMDB_OPERATIONAL_KEY = "tmdb_operational_settings";

export interface TmdbOperationalSettings {
  staleDays: number;
  stuckMinutes: number;
  batchDefault: number;
  batchMax: number;
  castLimit: number;
  imagesLimit: number;
  requestsPerMinute: number;
  catalogueRunLimit: number;
  retries: number;
  defaultLanguage: string;
  fallbackLanguage: string;
}

export const TMDB_OPERATIONAL_DEFAULTS: TmdbOperationalSettings = {
  staleDays: 90,
  stuckMinutes: 30,
  batchDefault: 10,
  batchMax: 25,
  castLimit: 50,
  imagesLimit: 40,
  requestsPerMinute: 30,
  catalogueRunLimit: 25,
  retries: 3,
  defaultLanguage: "pt-PT",
  fallbackLanguage: "en",
};

function integer(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(min, Math.min(max, Math.trunc(parsed)))
    : fallback;
}

export function normalizeTmdbOperationalSettings(
  value?: Partial<TmdbOperationalSettings> | null,
): TmdbOperationalSettings {
  return {
    staleDays: integer(value?.staleDays, 90, 1, 365),
    stuckMinutes: integer(value?.stuckMinutes, 30, 5, 240),
    batchDefault: integer(value?.batchDefault, 10, 1, 25),
    batchMax: integer(value?.batchMax, 25, 1, 50),
    castLimit: integer(value?.castLimit, 50, 1, 200),
    imagesLimit: integer(value?.imagesLimit, 40, 1, 100),
    requestsPerMinute: integer(value?.requestsPerMinute, 30, 1, 40),
    catalogueRunLimit: integer(value?.catalogueRunLimit, 25, 1, 100),
    retries: integer(value?.retries, 3, 0, 5),
    defaultLanguage: String(value?.defaultLanguage || "pt-PT").slice(0, 10),
    fallbackLanguage: String(value?.fallbackLanguage || "en").slice(0, 10),
  };
}

function decodeValue(value: unknown): Partial<TmdbOperationalSettings> | null {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Partial<TmdbOperationalSettings>;
  }
  if (typeof value === "string") {
    try { return JSON.parse(value) as Partial<TmdbOperationalSettings>; }
    catch { return null; }
  }
  return null;
}

export async function loadTmdbOperationalSettings(): Promise<TmdbOperationalSettings> {
  const result = await appSettingRepository.list({
    page: 1,
    perPage: 1,
    filter: `chave = "${TMDB_OPERATIONAL_KEY}"`,
  });
  return normalizeTmdbOperationalSettings(decodeValue(result.items[0]?.valor));
}

export async function saveTmdbOperationalSettings(
  value: TmdbOperationalSettings,
): Promise<AppSettingRecord> {
  const normalized = normalizeTmdbOperationalSettings(value);
  const result = await appSettingRepository.list({
    page: 1,
    perPage: 1,
    filter: `chave = "${TMDB_OPERATIONAL_KEY}"`,
  });
  return result.items[0]
    ? appSettingRepository.update(result.items[0].id, { valor: normalized })
    : appSettingRepository.create({ chave: TMDB_OPERATIONAL_KEY, valor: normalized });
}
