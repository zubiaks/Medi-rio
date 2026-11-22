/**
 * Projeto: Mediário
 * Ficheiro: src/domain/providers/settings.ts
 * Tipo: Serviço de configuração segura do frontend
 * Domínio: Providers e manutenção
 *
 * O frontend nunca devolve valores de chaves sensíveis à interface.
 * A indicação «Configurado» significa apenas que existe um valor não vazio.
 */
import { appSettingRepository } from "./repository";
import type { AppSettingRecord } from "./records";

export const PROVIDER_SETTING_KEYS = [
  "tmdb_api_key_v3",
  "omdb_api_key",
  "rawg_api_key",
  "google_books_api_key",
] as const;

export type ProviderSettingKey = typeof PROVIDER_SETTING_KEYS[number];

export interface ProviderSettingStatus {
  key: ProviderSettingKey;
  label: string;
  configured: boolean;
}

const labels: Record<ProviderSettingKey, string> = {
  tmdb_api_key_v3: "TMDB API Key v3",
  omdb_api_key: "OMDb API Key",
  rawg_api_key: "RAWG API Key",
  google_books_api_key: "Google Books API Key",
};

function hasConfiguredValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

export function buildProviderSettingStatuses(
  settings: AppSettingRecord[],
): ProviderSettingStatus[] {
  return PROVIDER_SETTING_KEYS.map((key) => {
    const record = settings.find((setting) => setting.chave === key);
    return {
      key,
      label: labels[key],
      configured: hasConfiguredValue(record?.valor),
    };
  });
}

export async function loadProviderSettingStatuses(): Promise<ProviderSettingStatus[]> {
  const result = await appSettingRepository.list({
    page: 1,
    perPage: 100,
    filter: PROVIDER_SETTING_KEYS
      .map((key) => `chave = "${key}"`)
      .join(" || "),
    sort: "chave",
  });

  return buildProviderSettingStatuses(result.items);
}
