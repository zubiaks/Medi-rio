/**
 * Projeto: Mediário
 * Ficheiro: src/domain/iptv/m3uDuplicate.ts
 * Versão do ficheiro: 2.0.0
 * Tipo: Regra de domínio TypeScript pura
 * Função: Deteta duplicados existentes e internos de playlists M3U.
 */
import type { IptvChannelRecord } from "@/types/records";
import { normalizeM3uName, type M3uItem } from "./m3u";

export type DuplicateKind = "tvg_id" | "url" | "name" | null;

export interface M3uDuplicate {
  kind: DuplicateKind;
  channel?: IptvChannelRecord;
}

export function findM3uDuplicate(
  item: M3uItem,
  channels: IptvChannelRecord[],
): M3uDuplicate {
  if (item.tvgId) {
    const byTvgId = channels.find((channel) => channel.tvg_id === item.tvgId);
    if (byTvgId) return { kind: "tvg_id", channel: byTvgId };
  }

  const byUrl = channels.find((channel) => channel.url_stream === item.url);
  if (byUrl) return { kind: "url", channel: byUrl };

  const normalizedName = normalizeM3uName(item.name);
  const byName = channels.find(
    (channel) => normalizeM3uName(channel.nome) === normalizedName,
  );

  return byName ? { kind: "name", channel: byName } : { kind: null };
}

export function findInternalM3uDuplicates(items: M3uItem[]): Set<number> {
  const seenUrls = new Set<string>();
  const seenTvgIds = new Set<string>();
  const duplicates = new Set<number>();

  items.forEach((item, index) => {
    const url = item.url.trim();
    const tvgId = item.tvgId.trim().toLocaleLowerCase("pt-PT");

    if (seenUrls.has(url) || (tvgId && seenTvgIds.has(tvgId))) {
      duplicates.add(index);
      return;
    }

    seenUrls.add(url);
    if (tvgId) seenTvgIds.add(tvgId);
  });

  return duplicates;
}
