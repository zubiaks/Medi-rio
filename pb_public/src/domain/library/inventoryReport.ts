/** Gera relatórios CSV e JSON das sessões de inventário. */
import type { InventoryItemRecord, InventoryRecord } from "./inventoryRecords";

function quote(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function createInventoryCsv(inventory: InventoryRecord, items: InventoryItemRecord[]): string {
  const header = ["inventario", "exemplar", "estado", "localizacao_esperada", "localizacao_encontrada", "verificado_em", "observacoes"];
  const rows = items.map((item) => [inventory.nome, item.exemplar, item.estado, item.localizacao_esperada, item.localizacao_encontrada, item.verificado_em, item.observacoes].map(quote).join(","));
  return [header.join(","), ...rows].join("\n");
}

export function createInventoryJson(inventory: InventoryRecord, items: InventoryItemRecord[]): string {
  return JSON.stringify({ exportado_em: new Date().toISOString(), inventario: inventory, itens: items }, null, 2);
}
