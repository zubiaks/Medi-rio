/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
import { episodeRepository } from "@/domain/repositories";
import type { StreamRecord } from "@/types/records";
import { parsePodcastFeed } from "./rss";

export interface PodcastSyncResult { total: number; created: number; updated: number; skipped: number; }
const escapeFilter = (value: string): string => value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

export async function syncPodcastFeed(podcast: StreamRecord): Promise<PodcastSyncResult> {
  if (!podcast.rss_url) throw new Error("Este podcast não tem um endereço RSS configurado.");
  let response: Response;
  try {
    response = await fetch(podcast.rss_url, { headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" } });
  } catch {
    throw new Error("Não foi possível obter o RSS. O servidor pode bloquear pedidos do navegador (CORS). Nesse caso, a sincronização terá de passar por um hook do PocketBase.");
  }
  if (!response.ok) throw new Error(`O feed RSS respondeu com HTTP ${response.status}.`);

  const parsed = parsePodcastFeed(await response.text());
  const result: PodcastSyncResult = { total: parsed.length, created: 0, updated: 0, skipped: 0 };
  for (const item of parsed) {
    if (!item.guid || !item.titulo) { result.skipped++; continue; }
    const existing = await episodeRepository.list({ page: 1, perPage: 1, filter: `podcast = "${podcast.id}" && guid = "${escapeFilter(item.guid)}"` });
    const payload: Record<string, unknown> = {
      podcast: podcast.id, guid: item.guid, titulo: item.titulo, descricao: item.descricao,
      audio_url: item.audioUrl, audio_type: item.audioType, duracao_seg: item.duracaoSeg,
      publicado_em: item.publicadoEm || null, link: item.link, imagem_url: item.imagemUrl,
      numero_episodio: item.numeroEpisodio, numero_temporada: item.numeroTemporada, explicito: item.explicito,
    };
    if (existing.items[0]) { await episodeRepository.update(existing.items[0].id, payload); result.updated++; }
    else { await episodeRepository.create(payload); result.created++; }
  }
  return result;
}
