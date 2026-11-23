/**
 * Mediário | ZIP 12B — gestor remoto e sincronização das listas.
 */
import { pb } from "@/infrastructure/pocketbase/client";
import type { PersonalList, PersonalListItem } from "./personalLists";
import type { PersistentListRecord } from "./persistentLists";

interface PersistentItemRecord {
  id: string;
  lista: string;
  entidade: PersonalListItem["entity"];
  entidade_id: string;
  titulo_cache: string;
  subtitulo_cache: string;
  imagem_cache: string;
  ordem: number;
  adicionado_em: string;
}

function toLocal(record: PersistentListRecord, items: PersistentItemRecord[]): PersonalList {
  return {
    id: record.id,
    name: record.nome,
    description: record.descricao || "",
    kind: record.tipo,
    color: record.cor || "#6366f1",
    pinned: Boolean(record.fixada),
    createdAt: record.created,
    updatedAt: record.updated,
    rule: record.regra || undefined,
    items: items
      .sort((a, b) => a.ordem - b.ordem)
      .map((item) => ({
        id: item.entidade_id,
        entity: item.entidade,
        title: item.titulo_cache,
        subtitle: item.subtitulo_cache || "",
        imageUrl: item.imagem_cache || "",
        addedAt: item.adicionado_em || "",
        order: item.ordem,
      })),
  };
}

export async function loadRemotePersonalLists(): Promise<PersonalList[]> {
  const lists = await pb.collection("listas").getFullList<PersistentListRecord>({
    sort: "-fixada,-updated",
  });
  const result: PersonalList[] = [];
  for (const list of lists) {
    const items = await pb.collection("listas_itens").getFullList<PersistentItemRecord>({
      filter: `lista = "${list.id}"`,
      sort: "ordem",
      requestKey: `remote-list-items-${list.id}`,
    });
    result.push(toLocal(list, items));
  }
  return result;
}

export async function saveRemotePersonalList(
  list: PersonalList,
  expectedUpdated?: string,
): Promise<PersonalList> {
  const current = await pb.collection("listas").getOne<PersistentListRecord>(list.id);
  if (expectedUpdated && current.updated !== expectedUpdated) {
    throw new Error("A lista foi alterada noutro dispositivo. Atualiza antes de guardar.");
  }
  const updated = await pb.collection("listas").update<PersistentListRecord>(list.id, {
    nome: list.name,
    descricao: list.description,
    tipo: list.kind,
    cor: list.color,
    fixada: list.pinned,
    regra: list.rule || null,
  });
  const existing = await pb.collection("listas_itens").getFullList<PersistentItemRecord>({
    filter: `lista = "${list.id}"`,
  });
  const desired = new Map(list.items.map((item) => [`${item.entity}:${item.id}`, item]));
  for (const item of existing) {
    const key = `${item.entidade}:${item.entidade_id}`;
    if (!desired.has(key)) await pb.collection("listas_itens").delete(item.id);
  }
  for (const [key, item] of desired) {
    const remote = existing.find((value) => `${value.entidade}:${value.entidade_id}` === key);
    const payload = {
      lista: list.id,
      entidade: item.entity,
      entidade_id: item.id,
      titulo_cache: item.title,
      subtitulo_cache: item.subtitle,
      imagem_cache: item.imageUrl || "",
      ordem: item.order,
      adicionado_em: item.addedAt || new Date().toISOString(),
    };
    if (remote) await pb.collection("listas_itens").update(remote.id, payload);
    else await pb.collection("listas_itens").create(payload);
  }
  return toLocal(updated, await pb.collection("listas_itens").getFullList<PersistentItemRecord>({
    filter: `lista = "${list.id}"`,
    sort: "ordem",
  }));
}

export async function deleteRemotePersonalList(id: string): Promise<void> {
  await pb.collection("listas").delete(id);
}

export async function createRemotePersonalList(
  list: PersonalList,
  ownerId: string,
): Promise<PersonalList> {
  const record = await pb.collection("listas").create<PersistentListRecord>({
    proprietario: ownerId,
    nome: list.name,
    descricao: list.description,
    tipo: list.kind,
    cor: list.color,
    fixada: list.pinned,
    regra: list.rule || null,
    visibilidade: "privada",
  });
  return toLocal(record, []);
}
