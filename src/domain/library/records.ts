import type { BaseRecord, NamedRecord, TitleRecord } from "@/types/records";

export interface PhysicalFormatRecord extends BaseRecord {
  nome: string;
  categoria?: string;
  digital?: boolean;
  ativo?: boolean;
  ordem?: number;
}

export interface EditionTypeRecord extends BaseRecord {
  nome: string;
  slug?: string;
  categoria?: string;
  descricao?: string;
  limitada?: boolean;
  numerada?: boolean;
  exclusiva?: boolean;
  ativo?: boolean;
  ordem?: number;
}

export interface LibraryCopyRecord extends BaseRecord {
  titulo: string;
  formato?: string;
  tipo_edicao?: string;
  numero_copia?: number;
  codigo_barras?: string;
  codigo_interno?: string;
  estado_fisico?: string;
  regiao?: string;
  localizacao?: string;
  selado?: boolean;
  steelbook?: boolean;
  notas?: string;
  emprestado?: boolean;
  emprestado_a?: string;
  data_emprestimo?: string;
  data_prevista?: string;
  expand?: {
    titulo?: TitleRecord;
    formato?: PhysicalFormatRecord;
    tipo_edicao?: EditionTypeRecord;
    emprestado_a?: NamedRecord;
  };
}

export interface LoanHistoryRecord extends BaseRecord {
  titulo: string;
  exemplar: string;
  pessoa: string;
  estado: string;
  data_emprestimo: string;
  data_prevista?: string;
  data_devolucao?: string;
  renovacoes?: number;
  devolvido_em_bom_estado?: boolean;
  notas?: string;
}

export interface LibraryCopyForm {
  titulo: string;
  formato: string;
  tipo_edicao: string;
  numero_copia: number | null;
  codigo_barras: string;
  codigo_interno: string;
  estado_fisico: string;
  regiao: string;
  localizacao: string;
  selado: boolean;
  steelbook: boolean;
  notas: string;
  emprestado: boolean;
  emprestado_a: string;
  data_emprestimo: string;
  data_prevista: string;
}
