/**
 * Ficheiro: src/types/records.ts
 * Tipo: Definições TypeScript dos records PocketBase.
 *
 * Função:
 * Centraliza os tipos usados pelos módulos Catálogo, VOD, Podcasts,
 * TV/Streams e Biblioteca.
 *
 * Nota:
 * Este ficheiro descreve os campos existentes no PocketBase. Não executa
 * consultas nem contém lógica de negócio.
 *
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 * See LICENSE.md.
 */
import type { RecordModel } from "pocketbase";

export interface BaseRecord extends RecordModel {
  id: string;
  created: string;
  updated: string;
  collectionId?: string;
  collectionName?: string;
}

export interface NamedRecord extends BaseRecord {
  nome?: string;
  codigo?: string;
  slug?: string;
}

/** Record da coleção `titulos`. */
export interface TitleRecord extends BaseRecord {
  titulo: string;
  titulo_original?: string;
  ano?: number;
  tagline?: string;
  sinopse?: string;
  poster?: string;
  backdrop?: string;
  logo?: string;
  poster_url?: string;
  backdrop_url?: string;
  logo_url?: string;
  midia: string;
  tipo?: string;
  estado?: string;
  rating?: number;
  favorito?: boolean;
  apagado: boolean;
  apagado_em?: string;
  apagado_por?: string;
  motivo_eliminacao?: string;
}

/**
 * Record da coleção `streams`.
 * Usado por podcasts, rádios, webcams, TV genérica e outros streams.
 */
export interface StreamRecord extends BaseRecord {
  nome: string;
  tipo: "radio" | "webcam" | "podcast" | "tv" | "outro";
  external_id?: string;
  url_stream?: string;
  url_pagina?: string;
  rss_url?: string;
  logo?: string;
  logo_url?: string;
  pais?: string;
  idiomas?: string[];
  categoria?: string;
  tags?: string[];
  qualidade?: "SD" | "HD" | "FHD" | "4K" | "Audio" | "Desconhecida";
  favorito?: boolean;
  ativo?: boolean;
  cemiterio?: boolean;
  adulto?: boolean;
  adulto_motivos?: unknown;
  ordem?: number;
  playlist_origem?: string;
  notas?: string;
  ultimo_teste_em?: string;
  ultimo_estado?:
    | "ok"
    | "lento"
    | "instavel"
    | "offline"
    | "bloqueado"
    | "geobloqueado"
    | "autenticacao"
    | "limite_excedido"
    | "desconhecido";
  ultimo_erro?: string;
  ultima_sincronizacao?: string;
  latencia_ms?: number;
  bitrate_kbps?: number;
  resolucao?: string;
  tempo_arranque_ms?: number;
  falhas_consecutivas?: number;
  ultimo_sucesso_em?: string;
  metadata_extra?: unknown;
  expand?: {
    pais?: NamedRecord;
    categoria?: NamedRecord;
    idiomas?: NamedRecord[];
    tags?: NamedRecord[];
  };
}

/** Record da coleção `podcast_episodios`. */
export interface PodcastEpisodeRecord extends BaseRecord {
  podcast: string;
  guid?: string;
  titulo: string;
  descricao?: string;
  numero_temporada?: number;
  numero_episodio?: number;
  audio_url?: string;
  audio_type?: string;
  duracao_seg?: number;
  publicado_em?: string;
  link?: string;
  imagem?: string;
  imagem_url?: string;
  explicito?: unknown;
  favorito?: boolean;
  descarregado?: boolean;
  ouvido_ate_seg?: number;
  ouvido_completo?: boolean;
  ultima_escuta_em?: string;
  metadata_extra?: unknown;
  expand?: {
    podcast?: StreamRecord;
  };
}

/**
 * Record da coleção `canais_tv`.
 * Representa o canal; fontes alternativas pertencem a StreamLinkRecord.
 */
export interface ChannelRecord extends BaseRecord {
  nome: string;
  url_stream: string;
  logo?: string;
  idiomas?: string[];
  categoria?: string;
  ativo?: boolean;
  ordem?: number;
  cemiterio?: boolean;
  pais?: string;
  tags?: string[];
  qualidade?: "Desconhecida" | "SD" | "HD" | "FHD" | "4K";
  favorito?: boolean;
  url_pagina?: string;
  tvg_id?: string;
  tvg_name?: string;
  tvg_logo_url?: string;
  epg_id?: string;
  playlist_origem?: string;
  adulto?: boolean;
  adulto_motivos?: unknown;
  ultimo_teste_em?: string;
  expand?: {
    pais?: NamedRecord & { bandeira?: string };
    categoria?: NamedRecord;
    idiomas?: NamedRecord[];
    tags?: NamedRecord[];
  };
}

/**
 * Record da coleção `stream_links`.
 * Um link deve preencher `canal_tv` ou `stream`, nunca ambos.
 */
export interface StreamLinkRecord extends BaseRecord {
  stream?: string;
  canal_tv?: string;
  url: string;
  rotulo?: string;
  tipo?: "hls" | "dash" | "http" | "audio" | "rtmp" | "rtsp" | "udp" | "outro";
  referrer?: string;
  user_agent?: string;
  qualidade?: "SD" | "HD" | "FHD" | "4K" | "Audio" | "Desconhecida";
  prioridade?: number;
  ativo?: boolean;
  ultimo_teste_em?: string;
  ultimo_estado?:
    | "ok"
    | "lento"
    | "instavel"
    | "offline"
    | "bloqueado"
    | "geobloqueado"
    | "autenticacao"
    | "limite_excedido"
    | "desconhecido";
  metadata_extra?: unknown;
  expand?: {
    stream?: StreamRecord;
    canal_tv?: ChannelRecord;
  };
}

/** Record da coleção `categorias_tv`. */
export interface TvCategoryRecord extends BaseRecord {
  nome: string;
  ativo?: boolean;
  ordem?: number;
}

/** Record da coleção `disponibilidades`. */
export interface AvailabilityRecord extends BaseRecord {
  titulo: string;
  provider_nome: string;
  tipo:
    | "streaming"
    | "aluguer"
    | "compra"
    | "gratuito"
    | "broadcast"
    | "biblioteca"
    | "fisico"
    | "outro";
  url?: string;
  pais?: string;
  qualidade?: string;
  preco?: number;
  moeda?: string;
  incluido_subscricao?: boolean;
  data_inicio?: string;
  data_fim?: string;
  ativo?: boolean;
  expand?: {
    titulo?: TitleRecord;
    pais?: NamedRecord;
  };
}
