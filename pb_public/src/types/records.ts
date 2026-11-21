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
}
