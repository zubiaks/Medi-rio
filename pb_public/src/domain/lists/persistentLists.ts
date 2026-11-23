/** Mediário | Persistência PocketBase das listas pessoais. */
import { pb } from "@/infrastructure/pocketbase/client";
import type { PersonalList, PersonalListItem } from "./personalLists";

export interface PersistentListRecord {
  id: string;
  proprietario: string;
  nome: string;
  descricao: string;
  tipo: "manual" | "smart";
  cor: string;
  fixada: boolean;
  regra: Record<string, unknown> | null;
  visibilidade: "privada" | "partilhada" | "publica";
  created: string;
  updated: string;
}

function escape(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export async function listPersistentLists(): Promise<PersistentListRecord[]> {
  return await pb.collection("listas").getFullList<PersistentListRecord>({ sort: "-fixada,-updated" });
}

export async function createPersistentList(local: PersonalList, ownerId: string): Promise<PersistentListRecord> {
  return await pb.collection("listas").create<PersistentListRecord>({
    proprietario: ownerId,
    nome: local.name,
    descricao: local.description,
    tipo: local.kind,
    cor: local.color,
    fixada: local.pinned,
    regra: local.rule || null,
    visibilidade: "privada",
  });
}

export async function createPersistentItems(listId: string, items: PersonalListItem[]): Promise<number> {
  let created = 0;
  for (const item of items.slice(0, 500)) {
    await pb.collection("listas_itens").create({
      lista: listId,
      entidade: item.entity,
      entidade_id: item.id,
      titulo_cache: item.title,
      subtitulo_cache: item.subtitle,
      imagem_cache: item.imageUrl || "",
      ordem: item.order,
      adicionado_em: item.addedAt || new Date().toISOString(),
    });
    created += 1;
  }
  return created;
}

export async function findPersistentDuplicate(local: PersonalList): Promise<PersistentListRecord | null> {
  try {
    return await pb.collection("listas").getFirstListItem<PersistentListRecord>(
      `nome = "${escape(local.name)}" && tipo = "${local.kind}"`,
    );
  } catch {
    return null;
  }
}

export async function recordPersistentMigration(listId: string, source: PersonalList): Promise<void> {
  await pb.collection("listas_atividades").create({
    lista: listId,
    tipo: "migrated",
    mensagem: `Lista local “${source.name}” migrada para o PocketBase.`,
    snapshot_anterior: source,
    snapshot_posterior: { migrated: true, local_id: source.id },
  });
}
