/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/protectedSync.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / proteção de sincronização
 * Finalidade: Impedir escritas sobre títulos alterados e criar snapshots automáticos.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
import { titleRepository } from "@/domain/repositories";
import type { TitleRecord } from "@/types/records";
import { createTitleSnapshot, type TitleVersionRecord } from "./titleVersions";

export interface ProtectedSyncContext {
  original: TitleRecord;
  current: TitleRecord;
  version: TitleVersionRecord;
}

export function titleWasModified(
  original: Pick<TitleRecord, "updated">,
  current: Pick<TitleRecord, "updated">,
): boolean {
  return Boolean(original.updated && current.updated && original.updated !== current.updated);
}

export async function prepareProtectedSync(
  original: TitleRecord,
  operation: string,
  fields: string[] = [],
): Promise<ProtectedSyncContext> {
  const current = await titleRepository.get(original.id);

  if (titleWasModified(original, current)) {
    throw new Error(
      "O título foi alterado depois da pré-visualização. Fecha o diálogo, volta a carregar os dados e repete a comparação.",
    );
  }

  const version = await createTitleSnapshot(
    current,
    `Snapshot automático antes de ${operation}`,
    fields,
  );

  return { original, current, version };
}
