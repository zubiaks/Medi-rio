/**
 * Projeto: Mediário
 * Ficheiro: src/domain/iptv/m3uImportPlan.ts
 * Tipo: Planeamento puro de importação M3U
 */
import type { IptvChannelRecord } from "@/types/records";
import type { M3uItem } from "./m3u";
import { findInternalM3uDuplicates } from "./m3uDuplicate";

export type M3uImportMode = "sync" | "sources-only" | "create-only";

export interface M3uImportPlan {
  total: number;
  valid: number;
  invalid: number;
  newChannels: number;
  matchedChannels: number;
  internalDuplicates: number;
}

function matches(item: M3uItem, channel: IptvChannelRecord): boolean {
  return Boolean(item.tvgId && channel.tvg_id === item.tvgId) ||
    channel.url_stream === item.url;
}

export function buildM3uImportPlan(
  items: M3uItem[],
  existing: IptvChannelRecord[],
): M3uImportPlan {
  const internal = findInternalM3uDuplicates(items);
  let valid = 0;
  let invalid = 0;
  let newChannels = 0;
  let matchedChannels = 0;

  items.forEach((item, index) => {
    if (item.errors.length) {
      invalid += 1;
      return;
    }
    if (internal.has(index)) return;

    valid += 1;
    if (existing.some((channel) => matches(item, channel))) matchedChannels += 1;
    else newChannels += 1;
  });

  return {
    total: items.length,
    valid,
    invalid,
    newChannels,
    matchedChannels,
    internalDuplicates: internal.size,
  };
}
