/**
 * Projeto: Mediário
 * Ficheiro: src/domain/library/inventoryRecords.ts
 * Tipo: Contratos TypeScript dos records PocketBase.
 * Domínio: Biblioteca física — Inventário.
 */
import type { BaseRecord } from "@/types/records";
import type { LibraryCopyRecord } from "./records";

export type InventoryState =
  | "Preparação"
  | "Em curso"
  | "Concluído"
  | "Cancelado";

export type InventoryItemState =
  | "Por verificar"
  | "Encontrado"
  | "Não localizado"
  | "Localização incorrecta"
  | "Dados incompletos";

export interface InventoryRecord extends BaseRecord {
  nome: string;
  estado: InventoryState;
  iniciado_em?: string;
  concluido_em?: string;
  total_previsto?: number;
  total_verificado?: number;
  encontrados?: number;
  nao_localizados?: number;
  localizacao_incorrecta?: number;
  dados_incompletos?: number;
  notas?: string;
}

export interface InventoryItemRecord extends BaseRecord {
  inventario: string;
  exemplar: string;
  estado: InventoryItemState;
  localizacao_esperada?: string;
  localizacao_encontrada?: string;
  verificado_em?: string;
  observacoes?: string;
  expand?: {
    inventario?: InventoryRecord;
    exemplar?: LibraryCopyRecord;
  };
}
