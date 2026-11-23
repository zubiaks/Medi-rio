/** Mediário | Migração validada das listas locais para PocketBase. */
import { pb } from "@/infrastructure/pocketbase/client";
import { loadPersonalLists, type PersonalList } from "./personalLists";
import {
  createPersistentItems,
  createPersistentList,
  findPersistentDuplicate,
  recordPersistentMigration,
} from "./persistentLists";

export interface LocalListMigrationPreview {
  total: number;
  items: number;
  duplicates: Array<{ localId: string; name: string; remoteId: string }>;
  migratable: PersonalList[];
}

export interface LocalListMigrationResult {
  createdLists: number;
  createdItems: number;
  skippedDuplicates: number;
  failures: Array<{ name: string; message: string }>;
}

export async function previewLocalListMigration(): Promise<LocalListMigrationPreview> {
  const local = loadPersonalLists();
  const duplicates: LocalListMigrationPreview["duplicates"] = [];
  const migratable: PersonalList[] = [];
  for (const list of local) {
    const duplicate = await findPersistentDuplicate(list);
    if (duplicate) duplicates.push({ localId: list.id, name: list.name, remoteId: duplicate.id });
    else migratable.push(list);
  }
  return {
    total: local.length,
    items: local.reduce((sum, list) => sum + list.items.length, 0),
    duplicates,
    migratable,
  };
}

export async function migrateLocalLists(
  preview: LocalListMigrationPreview,
): Promise<LocalListMigrationResult> {
  const ownerId = pb.authStore.record?.id;
  if (!ownerId) throw new Error("É necessário iniciar sessão para migrar as listas.");
  let createdLists = 0;
  let createdItems = 0;
  const failures: LocalListMigrationResult["failures"] = [];
  for (const local of preview.migratable) {
    let remoteId = "";
    try {
      const remote = await createPersistentList(local, ownerId);
      remoteId = remote.id;
      createdItems += await createPersistentItems(remote.id, local.items);
      await recordPersistentMigration(remote.id, local);
      createdLists += 1;
    } catch (cause) {
      if (remoteId) {
        try { await pb.collection("listas").delete(remoteId); } catch { /* limpeza best effort */ }
      }
      failures.push({ name: local.name, message: cause instanceof Error ? cause.message : String(cause) });
    }
  }
  return {
    createdLists,
    createdItems,
    skippedDuplicates: preview.duplicates.length,
    failures,
  };
}
