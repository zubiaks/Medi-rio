/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/titleVersions.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / histórico e recuperação
 * Finalidade: Criar snapshots e restaurar campos de títulos com segurança.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import { titleRepository } from "@/domain/repositories";
import type { BaseRecord, TitleRecord } from "@/types/records";

export interface TitleVersionRecord extends BaseRecord {
  titulo: string;
  versao_num: number;
  motivo?: string;
  origem?: string;
  user_info?: string;
  campos_alterados?: unknown;
  snapshot?: unknown;
  restaurada?: boolean;
  restaurada_em?: string;
}

const repository = new PocketBaseRepository<TitleVersionRecord>("titulos_versoes");

const blockedFields = new Set([
  "id", "collectionId", "collectionName", "created", "updated",
]);

export function buildTitleSnapshot(title: TitleRecord): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(title as unknown as Record<string, unknown>)
      .filter(([key]) => !blockedFields.has(key) && key !== "expand"),
  );
}

export function restorableFields(snapshot: unknown): string[] {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return [];
  return Object.keys(snapshot as Record<string, unknown>)
    .filter((key) => !blockedFields.has(key) && key !== "midia")
    .sort((a, b) => a.localeCompare(b, "pt-PT"));
}

export async function listTitleVersions(titleId: string): Promise<TitleVersionRecord[]> {
  return (await repository.list({
    page: 1,
    perPage: 100,
    filter: `titulo = "${titleId}"`,
    sort: "-versao_num",
  })).items;
}

export async function createTitleSnapshot(
  title: TitleRecord,
  reason: string,
  fields: string[] = [],
): Promise<TitleVersionRecord> {
  const versions = await listTitleVersions(title.id);
  const next = Math.max(0, ...versions.map((item) => item.versao_num || 0)) + 1;
  return repository.create({
    titulo: title.id,
    versao_num: next,
    motivo: reason.trim() || "Snapshot antes da sincronização TMDB",
    origem: "sincronizacao",
    user_info: "frontend-local",
    campos_alterados: fields,
    snapshot: buildTitleSnapshot(title),
    restaurada: false,
    restaurada_em: "",
  });
}

export async function restoreTitleVersion(
  version: TitleVersionRecord,
  selectedFields: string[],
): Promise<Record<string, unknown>> {
  if (!version.snapshot || typeof version.snapshot !== "object" || Array.isArray(version.snapshot)) {
    throw new Error("Esta versão não contém um snapshot restaurável.");
  }
  const source = version.snapshot as Record<string, unknown>;
  const payload = Object.fromEntries(
    selectedFields
      .filter((field) => restorableFields(source).includes(field))
      .map((field) => [field, source[field]]),
  );
  if (!Object.keys(payload).length) throw new Error("Seleciona pelo menos um campo para restaurar.");
  await titleRepository.update(version.titulo, payload);
  await repository.update(version.id, {
    restaurada: true,
    restaurada_em: new Date().toISOString(),
  });
  return payload;
}
