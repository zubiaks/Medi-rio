/**
 * Projeto: Mediário
 * Ficheiro: src/domain/diary/records.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Contratos TypeScript dos records PocketBase
 * Domínio: Diário e avaliações
 *
 * Finalidade:
 * Define os contratos das coleções `visualizacoes` e `reviews`.
 * Não executa consultas nem contém regras de negócio.
 */
import type { BaseRecord, NamedRecord, TitleRecord } from "@/types/records";

export interface SeasonRecord extends BaseRecord {
  titulo: string;
  numero: number;
  nome?: string;
}

export interface EpisodeRecord extends BaseRecord {
  temporada: string;
  numero: number;
  titulo: string;
  duracao_min?: number;
}

export interface DiaryEntryRecord extends BaseRecord {
  titulo: string;
  temporada?: string;
  episodio?: string;
  iniciado_em: string;
  terminado_em?: string;
  duracao_seg?: number;
  progresso_seg?: number;
  percentagem?: number;
  completo?: boolean;
  revisualizacao?: boolean;
  origem?: string;
  plataforma?: string;
  notas?: string;
  metadata_extra?: unknown;
  expand?: {
    titulo?: TitleRecord;
    temporada?: SeasonRecord;
    episodio?: EpisodeRecord;
    plataforma?: NamedRecord;
  };
}

export type ReviewPublicationState =
  | "Rascunho"
  | "Publicado"
  | "Arquivado";

export interface ReviewRecord extends BaseRecord {
  titulo: string;
  titulo_review?: string;
  rating?: number;
  texto?: string;
  tem_spoilers?: boolean;
  favorito?: boolean;
  recomenda?: boolean;
  tags_review?: string[];
  estado_publicacao?: ReviewPublicationState | string;
  data_visto?: string;
  data_publicacao?: string;
  revisao_numero?: number;
  metadata_extra?: unknown;
  expand?: {
    titulo?: TitleRecord;
    tags_review?: NamedRecord[];
  };
}

export interface DiaryEntryForm {
  titulo: string;
  temporada: string;
  episodio: string;
  iniciado_em: string;
  terminado_em: string;
  duracao_seg: number | null;
  progresso_seg: number | null;
  completo: boolean;
  revisualizacao: boolean;
  origem: string;
  plataforma: string;
  notas: string;
}

export interface ReviewForm {
  titulo: string;
  titulo_review: string;
  rating: number | null;
  texto: string;
  tem_spoilers: boolean;
  favorito: boolean;
  recomenda: boolean;
  tags_review: string[];
  estado_publicacao: ReviewPublicationState;
  data_visto: string;
  data_publicacao: string;
  revisao_numero: number;
}
