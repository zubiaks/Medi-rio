/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbSyncHealth.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / diagnóstico TMDB
 * Finalidade: Avaliar cobertura, coerência e antiguidade da sincronização.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import type { TitleRecord } from "@/types/records";
import type { TmdbDetails } from "./tmdbClient";

export type SyncHealthTone = "success" | "warning" | "danger";

export interface SyncHealthItem {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
  tone: SyncHealthTone;
}

export interface SyncHealthReport {
  score: number;
  tone: SyncHealthTone;
  completed: number;
  total: number;
  items: SyncHealthItem[];
}

function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "" &&
    (!Array.isArray(value) || value.length > 0);
}

function item(
  key: string,
  label: string,
  ok: boolean,
  success: string,
  failure: string,
  required = false,
): SyncHealthItem {
  return {
    key,
    label,
    ok,
    detail: ok ? success : failure,
    tone: ok ? "success" : required ? "danger" : "warning",
  };
}

export function buildTmdbSyncHealth(
  title: TitleRecord,
  details?: TmdbDetails | null,
  now = new Date(),
): SyncHealthReport {
  const record = title as unknown as Record<string, unknown>;
  const lastSync = record.ultima_sincronizacao
    ? new Date(String(record.ultima_sincronizacao))
    : null;
  const ageDays = lastSync && Number.isFinite(lastSync.getTime())
    ? Math.floor((now.getTime() - lastSync.getTime()) / 86_400_000)
    : null;
  const tmdbIdMatches = !details || !record.tmdb_id ||
    Number(record.tmdb_id) === Number(details.id);

  const items = [
    item("tmdb_id", "Identificador TMDB", present(record.tmdb_id), "Identificador associado.", "Falta associar o identificador TMDB.", true),
    item("type", "Tipo TMDB", present(record.tipo_tmdb), "Tipo externo definido.", "Falta definir movie ou tv.", true),
    item("identity", "Coerência da associação", tmdbIdMatches, "O detalhe corresponde ao título associado.", "O identificador guardado não corresponde ao detalhe carregado.", true),
    item("overview", "Sinopse", present(record.sinopse), "Sinopse preenchida.", "Sinopse em falta."),
    item("images", "Imagens", present(record.poster_url) && present(record.backdrop_url), "Poster e backdrop externos preenchidos.", "Falta poster ou backdrop externo."),
    item("ratings", "Classificação TMDB", present(record.tmdb_rating), "Classificação preenchida.", "Classificação TMDB em falta."),
    item("imdb", "Ligação IMDb", present(record.imdb_id), "IMDb ID preenchido.", "IMDb ID em falta."),
    item("genres", "Géneros", present(record.generos), "Relação de géneros preenchida.", "Géneros ainda não associados."),
    item("source", "Fonte principal", record.fonte_principal === "tmdb", "TMDB definido como fonte principal.", "TMDB não está definido como fonte principal."),
    item("state", "Estado da sincronização", record.sync_estado === "atualizado", "Sincronização marcada como atualizada.", "Estado de sincronização não está atualizado.", true),
    item("freshness", "Atualidade", ageDays !== null && ageDays <= 90, ageDays === null ? "Sincronização recente." : `Sincronizado há ${ageDays} dias.`, ageDays === null ? "Nunca sincronizado." : `Sincronização com ${ageDays} dias.`),
  ];

  const completed = items.filter((entry) => entry.ok).length;
  const score = Math.round((completed / items.length) * 100);
  const tone: SyncHealthTone = score >= 85 ? "success" : score >= 60 ? "warning" : "danger";
  return { score, tone, completed, total: items.length, items };
}
