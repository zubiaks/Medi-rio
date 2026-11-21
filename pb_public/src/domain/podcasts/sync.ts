/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
import { episodeRepository, streamRepository } from "@/domain/repositories";
import type { PodcastEpisodeRecord, StreamRecord } from "@/types/records";
import { parsePodcastFeed, type ParsedPodcastEpisode } from "./rss";

export interface PodcastSyncResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
}

type EpisodeRecord = PodcastEpisodeRecord & {
  link?: string;
  imagem_url?: string;
  explicito?: unknown;
};

type EpisodePayload = {
  podcast: string;
  guid: string;
  titulo: string;
  descricao: string;
  audio_url: string;
  audio_type: string;
  duracao_seg: number | null;
  publicado_em: string | null;
  link: string;
  imagem_url: string;
  numero_episodio: number | null;
  numero_temporada: number | null;
  explicito: boolean | string | null;
};

const escapeFilter = (value: string): string =>
  value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeDate(value: unknown): string {
  if (!value || typeof value !== "string") return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.trim() : date.toISOString();
}

function normalizeExplicit(value: unknown): boolean | string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "1", "explicit"].includes(normalized)) return true;
    if (["false", "no", "0", "clean"].includes(normalized)) return false;
    return value.trim();
  }
  return JSON.stringify(value);
}

function createPayload(
  podcastId: string,
  item: ParsedPodcastEpisode,
): EpisodePayload {
  return {
    podcast: podcastId,
    guid: item.guid.trim(),
    titulo: item.titulo.trim(),
    descricao: item.descricao.trim(),
    audio_url: item.audioUrl.trim(),
    audio_type: item.audioType.trim(),
    duracao_seg: item.duracaoSeg,
    publicado_em: item.publicadoEm || null,
    link: item.link.trim(),
    imagem_url: item.imagemUrl.trim(),
    numero_episodio: item.numeroEpisodio,
    numero_temporada: item.numeroTemporada,
    explicito: item.explicito,
  };
}

function hasChanged(record: EpisodeRecord, payload: EpisodePayload): boolean {
  return (
    normalizeText(record.podcast) !== payload.podcast ||
    normalizeText(record.guid) !== payload.guid ||
    normalizeText(record.titulo) !== payload.titulo ||
    normalizeText(record.descricao) !== payload.descricao ||
    normalizeText(record.audio_url) !== payload.audio_url ||
    normalizeText(record.audio_type) !== payload.audio_type ||
    normalizeNumber(record.duracao_seg) !== payload.duracao_seg ||
    normalizeDate(record.publicado_em) !== normalizeDate(payload.publicado_em) ||
    normalizeText(record.link) !== payload.link ||
    normalizeText(record.imagem_url) !== payload.imagem_url ||
    normalizeNumber(record.numero_episodio) !== payload.numero_episodio ||
    normalizeNumber(record.numero_temporada) !== payload.numero_temporada ||
    normalizeExplicit(record.explicito) !== normalizeExplicit(payload.explicito)
  );
}

export async function syncPodcastFeed(
  podcast: StreamRecord,
): Promise<PodcastSyncResult> {
  if (!podcast.rss_url) {
    throw new Error("Este podcast não tem um endereço RSS configurado.");
  }

  let response: Response;

  try {
    response = await fetch(podcast.rss_url, {
      headers: {
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
  } catch {
    await streamRepository.update(podcast.id, {
      ultimo_teste_em: new Date().toISOString(),
      ultimo_estado: "offline",
      ultimo_erro:
        "Não foi possível obter o RSS. O servidor pode bloquear pedidos do navegador (CORS).",
    });

    throw new Error(
      "Não foi possível obter o RSS. O servidor pode bloquear pedidos do navegador (CORS). Nesse caso, a sincronização terá de passar por um hook do PocketBase.",
    );
  }

  if (!response.ok) {
    const message = `O feed RSS respondeu com HTTP ${response.status}.`;

    await streamRepository.update(podcast.id, {
      ultimo_teste_em: new Date().toISOString(),
      ultimo_estado: "offline",
      ultimo_erro: message,
    });

    throw new Error(message);
  }

  const parsed = parsePodcastFeed(await response.text());
  const result: PodcastSyncResult = {
    total: parsed.length,
    created: 0,
    updated: 0,
    skipped: 0,
  };

  for (const item of parsed) {
    if (!item.guid.trim() || !item.titulo.trim()) {
      result.skipped += 1;
      continue;
    }

    const existingPage = await episodeRepository.list({
      page: 1,
      perPage: 1,
      filter:
        `podcast = "${podcast.id}" && ` +
        `guid = "${escapeFilter(item.guid.trim())}"`,
    });

    const payload = createPayload(podcast.id, item);
    const existing = existingPage.items[0] as EpisodeRecord | undefined;

    if (!existing) {
      await episodeRepository.create(payload);
      result.created += 1;
      continue;
    }

    if (!hasChanged(existing, payload)) {
      result.skipped += 1;
      continue;
    }

    await episodeRepository.update(existing.id, payload);
    result.updated += 1;
  }

  const now = new Date().toISOString();

  await streamRepository.update(podcast.id, {
    ultima_sincronizacao: now,
    ultimo_teste_em: now,
    ultimo_estado: "ok",
    ultimo_erro: "",
  });

  return result;
}
