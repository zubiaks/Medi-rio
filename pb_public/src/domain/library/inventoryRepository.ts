/**
 * Projeto: Mediário
 * Ficheiro: src/domain/library/inventoryRepository.ts
 * Tipo: Repositórios PocketBase do inventário físico.
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { InventoryItemRecord, InventoryRecord } from "./inventoryRecords";

export const inventoryRepository =
  new PocketBaseRepository<InventoryRecord>("inventarios");

export const inventoryItemRepository =
  new PocketBaseRepository<InventoryItemRecord>("inventario_itens");
