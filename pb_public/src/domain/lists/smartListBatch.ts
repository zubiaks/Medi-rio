/** Mediário | Atualização sequencial das listas inteligentes. */
import { loadPersonalLists, type PersonalList } from "./personalLists";
import { refreshSmartList } from "./smartLists";

export interface SmartListBatchResult {
  total: number;
  updated: number;
  failed: number;
  cancelled: boolean;
  errors: Array<{ id: string; name: string; message: string }>;
}

export async function refreshAllSmartLists(
  isCancelled: () => boolean = () => false,
  onProgress?: (processed: number, total: number) => void,
): Promise<SmartListBatchResult> {
  const smartLists = loadPersonalLists().filter((list) => list.kind === "smart");
  let updated = 0;
  let failed = 0;
  const errors: SmartListBatchResult["errors"] = [];

  for (const list of smartLists) {
    if (isCancelled()) break;
    try {
      await refreshSmartList(list.id);
      updated += 1;
    } catch (cause) {
      failed += 1;
      errors.push({
        id: list.id,
        name: list.name,
        message: cause instanceof Error ? cause.message : String(cause),
      });
    }
    onProgress?.(updated + failed, smartLists.length);
  }

  return {
    total: smartLists.length,
    updated,
    failed,
    cancelled: isCancelled(),
    errors,
  };
}

export function pinnedLists(lists: PersonalList[]): PersonalList[] {
  return lists
    .filter((list) => list.pinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
