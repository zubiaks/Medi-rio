/**
 * Projeto: Mediário
 * Ficheiro: src/domain/library/csvInventory.ts
 * Tipo: Parser e exportador CSV TypeScript puro.
 * Domínio: Biblioteca física.
 *
 * Finalidade:
 * Lê um inventário CSV, valida cada linha e exporta exemplares existentes.
 * Os campos de relação usam os identificadores PocketBase.
 */
import type { LibraryCopyRecord } from "./records";

export interface CsvCopyRow {
  linha: number;
  titulo: string;
  formato: string;
  tipo_edicao: string;
  numero_copia: number;
  codigo_interno: string;
  codigo_barras: string;
  estado_fisico: string;
  regiao: string;
  localizacao: string;
  selado: boolean;
  steelbook: boolean;
  notas: string;
  erros: string[];
}

export const LIBRARY_CSV_HEADERS = [
  "titulo",
  "formato",
  "tipo_edicao",
  "numero_copia",
  "codigo_interno",
  "codigo_barras",
  "estado_fisico",
  "regiao",
  "localizacao",
  "selado",
  "steelbook",
  "notas",
] as const;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

function isTrue(value: string): boolean {
  return ["1", "true", "sim"].includes(value.trim().toLocaleLowerCase("pt-PT"));
}

export function parseLibraryCsv(text: string): CsvCopyRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map((value) => value.trim());

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const get = (name: string) => cells[headers.indexOf(name)]?.trim() || "";
    const copyNumber = Number(get("numero_copia") || 1);
    const errors: string[] = [];

    if (!get("titulo")) errors.push("Título em falta.");
    if (!Number.isInteger(copyNumber) || copyNumber < 1) {
      errors.push("Número da cópia inválido.");
    }

    return {
      linha: index + 2,
      titulo: get("titulo"),
      formato: get("formato"),
      tipo_edicao: get("tipo_edicao"),
      numero_copia: copyNumber,
      codigo_interno: get("codigo_interno"),
      codigo_barras: get("codigo_barras"),
      estado_fisico: get("estado_fisico"),
      regiao: get("regiao"),
      localizacao: get("localizacao"),
      selado: isTrue(get("selado")),
      steelbook: isTrue(get("steelbook")),
      notas: get("notas"),
      erros: errors,
    };
  });
}

function quoteCsv(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function exportLibraryCsv(items: LibraryCopyRecord[]): string {
  const rows = items.map((item) =>
    [
      item.titulo,
      item.formato,
      item.tipo_edicao,
      item.numero_copia,
      item.codigo_interno,
      item.codigo_barras,
      item.estado_fisico,
      item.regiao,
      item.localizacao,
      item.selado,
      item.steelbook,
      item.notas,
    ].map(quoteCsv).join(","),
  );

  return [LIBRARY_CSV_HEADERS.join(","), ...rows].join("\n");
}

export function downloadLibraryCsv(items: LibraryCopyRecord[]): void {
  const content = `\uFEFF${exportLibraryCsv(items)}`;
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "biblioteca-fisica.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
