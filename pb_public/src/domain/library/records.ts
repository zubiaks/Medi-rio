import type { BaseRecord, NamedRecord, TitleRecord } from "@/types/records";

export interface LibraryCopyRecord extends BaseRecord {
  titulo?: string;
  formato?: string;
  tipo_edicao?: string;
  localizacao?: string;
  emprestado?: boolean;
  expand?: {
    titulo?: TitleRecord;
    formato?: NamedRecord;
    tipo_edicao?: NamedRecord;
  };
}

export interface LibraryCopyForm {
  titulo: string;
  localizacao: string;
  emprestado: boolean;
}
