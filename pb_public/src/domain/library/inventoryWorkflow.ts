/**
 * Projeto: Mediário
 * Ficheiro: src/domain/library/inventoryWorkflow.ts
 * Tipo: Serviço de domínio TypeScript.
 * Domínio: Biblioteca física — Inventário.
 *
 * Finalidade:
 * Cria sessões, gera os respetivos itens, atualiza o progresso e encerra ou
 * cancela inventários sem eliminar exemplares.
 */
import { libraryCopyRepository } from "./repository";
import { inventoryItemRepository, inventoryRepository } from "./inventoryRepository";
import type { InventoryItemRecord, InventoryItemState, InventoryRecord } from "./inventoryRecords";
import type { LibraryCopyRecord } from "./records";

export interface CreateInventoryInput {
  nome: string;
  notas?: string;
}

export interface InventoryProgress {
  total: number;
  verificados: number;
  restantes: number;
  percentagem: number;
  encontrados: number;
  naoLocalizados: number;
  localizacaoIncorrecta: number;
  dadosIncompletos: number;
}

export function calculateInventoryProgress(items: InventoryItemRecord[]): InventoryProgress {
  const total = items.length;
  const verificados = items.filter((item) => item.estado !== "Por verificar").length;
  return {
    total,
    verificados,
    restantes: Math.max(0, total - verificados),
    percentagem: total ? Math.round((verificados / total) * 100) : 0,
    encontrados: items.filter((item) => item.estado === "Encontrado").length,
    naoLocalizados: items.filter((item) => item.estado === "Não localizado").length,
    localizacaoIncorrecta: items.filter((item) => item.estado === "Localização incorrecta").length,
    dadosIncompletos: items.filter((item) => item.estado === "Dados incompletos").length,
  };
}

async function loadAllCopies(): Promise<LibraryCopyRecord[]> {
  const copies: LibraryCopyRecord[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await libraryCopyRepository.list({
      page,
      perPage: 500,
      sort: "created",
      expand: "titulo,formato,tipo_edicao",
    });
    copies.push(...result.items);
    totalPages = result.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return copies;
}

export async function createInventory(input: CreateInventoryInput): Promise<InventoryRecord> {
  const name = input.nome.trim();
  if (!name) throw new Error("Indica um nome para a sessão de inventário.");

  const copies = await loadAllCopies();
  const inventory = await inventoryRepository.create({
    nome: name,
    estado: "Preparação",
    total_previsto: copies.length,
    total_verificado: 0,
    encontrados: 0,
    nao_localizados: 0,
    localizacao_incorrecta: 0,
    dados_incompletos: 0,
    notas: input.notas?.trim() || "",
  });

  try {
    for (const copy of copies) {
      await inventoryItemRepository.create({
        inventario: inventory.id,
        exemplar: copy.id,
        estado: "Por verificar",
        localizacao_esperada: copy.localizacao || "",
        localizacao_encontrada: "",
        observacoes: "",
      });
    }
    return inventory;
  } catch (cause) {
    await inventoryRepository.delete(inventory.id);
    throw cause;
  }
}

export async function startInventory(inventory: InventoryRecord): Promise<InventoryRecord> {
  if (inventory.estado !== "Preparação") {
    throw new Error("Apenas uma sessão em preparação pode ser iniciada.");
  }
  return inventoryRepository.update(inventory.id, {
    estado: "Em curso",
    iniciado_em: new Date().toISOString(),
  });
}

export async function updateInventoryItem(
  item: InventoryItemRecord,
  estado: InventoryItemState,
  localizacaoEncontrada = "",
  observacoes = "",
): Promise<InventoryItemRecord> {
  if (estado === "Por verificar") {
    throw new Error("Escolhe um resultado de verificação válido.");
  }
  return inventoryItemRepository.update(item.id, {
    estado,
    localizacao_encontrada: localizacaoEncontrada.trim(),
    verificado_em: new Date().toISOString(),
    observacoes: observacoes.trim(),
  });
}

export async function saveInventoryProgress(
  inventory: InventoryRecord,
  items: InventoryItemRecord[],
): Promise<InventoryRecord> {
  const progress = calculateInventoryProgress(items);
  return inventoryRepository.update(inventory.id, {
    total_previsto: progress.total,
    total_verificado: progress.verificados,
    encontrados: progress.encontrados,
    nao_localizados: progress.naoLocalizados,
    localizacao_incorrecta: progress.localizacaoIncorrecta,
    dados_incompletos: progress.dadosIncompletos,
  });
}

export async function completeInventory(
  inventory: InventoryRecord,
  items: InventoryItemRecord[],
): Promise<InventoryRecord> {
  const progress = calculateInventoryProgress(items);
  if (progress.restantes) {
    throw new Error(`Ainda existem ${progress.restantes} exemplares por verificar.`);
  }
  await saveInventoryProgress(inventory, items);
  return inventoryRepository.update(inventory.id, {
    estado: "Concluído",
    concluido_em: new Date().toISOString(),
  });
}

export async function cancelInventory(inventory: InventoryRecord): Promise<InventoryRecord> {
  if (inventory.estado === "Concluído") {
    throw new Error("Uma sessão concluída não pode ser cancelada.");
  }
  return inventoryRepository.update(inventory.id, {
    estado: "Cancelado",
    concluido_em: new Date().toISOString(),
  });
}
