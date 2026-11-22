/**
 * Projeto: Mediário
 * Ficheiro: src/domain/providers/records.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Contratos TypeScript dos records PocketBase
 * Domínio: Providers e manutenção
 *
 * Finalidade:
 * Representa `fontes_externas`, `sync_jobs`, `app_settings` e `audit_log`
 * exactamente de acordo com o esquema PocketBase 1.0.0 confirmado.
 */
import type { BaseRecord, TitleRecord } from "@/types/records";

export const EXTERNAL_PROVIDERS = [
  "tmdb", "imdb", "omdb", "anilist", "myanimelist", "jikan", "kitsu",
  "rawg", "igdb", "giantbomb", "openlibrary", "googlebooks", "goodreads",
  "comicvine", "musicbrainz", "discogs", "itunes", "spotify", "outro",
] as const;

export type ExternalProvider = typeof EXTERNAL_PROVIDERS[number];

export interface ExternalSourceRecord extends BaseRecord {
  titulo: string;
  provider: ExternalProvider;
  external_id: string;
  external_url?: string;
  tipo_externo?: string;
  principal?: boolean;
  ultima_sincronizacao?: string;
  metadata_extra?: unknown;
  expand?: { titulo?: TitleRecord };
}

export const SYNC_JOB_TYPES = [
  "importacao", "enriquecimento", "atualizacao", "rss", "epg", "m3u",
  "backup", "manutencao", "outro",
] as const;
export type SyncJobType = typeof SYNC_JOB_TYPES[number];

export const SYNC_JOB_STATES = [
  "pendente", "em_execucao", "concluido", "parcial", "falhou", "cancelado",
] as const;
export type SyncJobState = typeof SYNC_JOB_STATES[number];

export interface SyncJobRecord extends BaseRecord {
  tipo?: SyncJobType;
  provider: string;
  entidade?: string;
  entidade_id?: string;
  estado?: SyncJobState;
  iniciado_em: string;
  terminado_em?: string;
  total?: number;
  processados?: number;
  sucessos?: number;
  falhas?: number;
  erro?: string;
  detalhes?: unknown;
}

export interface AppSettingRecord extends BaseRecord {
  chave: string;
  valor?: unknown;
}

export const AUDIT_ACTIONS = [
  "criar", "editar", "apagar", "mover_lixeira", "restaurar", "emprestar",
  "devolver", "importar", "exportar", "sincronizar", "migrar", "fundir",
  "arquivar", "desarquivar", "erro",
] as const;
export type AuditAction = typeof AUDIT_ACTIONS[number];

export const AUDIT_ORIGINS = [
  "interface", "quick_add", "importacao", "migracao", "sincronizacao",
  "backup", "manutencao", "merge", "edicao_massa", "api",
] as const;
export type AuditOrigin = typeof AUDIT_ORIGINS[number];

export interface AuditLogRecord extends BaseRecord {
  entidade: string;
  entidade_id?: string;
  entidade_nome?: string;
  acao: AuditAction;
  detalhes?: unknown;
  user_info?: string;
  origem?: AuditOrigin;
  sucesso?: boolean;
  erro?: string;
}

export interface ExternalSourceForm {
  titulo: string;
  provider: ExternalProvider | "";
  external_id: string;
  external_url: string;
  tipo_externo: string;
  principal: boolean;
  ultima_sincronizacao: string;
  metadata_extra: string;
}
