/** Mediário | Diferenças entre snapshots de listas inteligentes. */
import type { GlobalSearchItem } from "@/domain/search/globalSearch";
import type { PersonalListItem } from "./personalLists";

export interface SmartListDifference {
  added: GlobalSearchItem[];
  removed: PersonalListItem[];
  unchanged: number;
}

function key(entity: string, id: string): string {
  return `${entity}:${id}`;
}

export function compareSmartListSnapshot(
  current: PersonalListItem[],
  proposed: GlobalSearchItem[],
): SmartListDifference {
  const currentKeys = new Set(current.map((item) => key(item.entity, item.id)));
  const proposedKeys = new Set(proposed.map((item) => key(item.entity, item.id)));
  return {
    added: proposed.filter((item) => !currentKeys.has(key(item.entity, item.id))),
    removed: current.filter((item) => !proposedKeys.has(key(item.entity, item.id))),
    unchanged: proposed.filter((item) => currentKeys.has(key(item.entity, item.id))).length,
  };
}
