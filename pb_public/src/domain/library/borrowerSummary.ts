/**
 * Projeto: Mediário
 * Ficheiro: src/domain/library/borrowerSummary.ts
 * Tipo: Regra de domínio TypeScript pura.
 * Domínio: Biblioteca física.
 *
 * Finalidade:
 * Agrupa o histórico de empréstimos por destinatário e calcula os totais
 * activos, atrasados, históricos e a próxima data prevista de devolução.
 *
 * Regras:
 * - Apenas os estados Emprestado e Atrasado são considerados activos.
 * - Um empréstimo Emprestado com data prevista vencida conta como atrasado.
 * - Não consulta directamente o PocketBase.
 */
import type { LoanHistoryRecord } from "./records";

export interface BorrowerSummary {
  personId: string;
  name: string;
  active: number;
  overdue: number;
  nextDue?: string;
  total: number;
  items: LoanHistoryRecord[];
}

export function buildBorrowerSummaries(
  items: LoanHistoryRecord[],
  today = new Date().toISOString().slice(0, 10),
): BorrowerSummary[] {
  const summaries = new Map<string, BorrowerSummary>();

  for (const item of items) {
    const personId = item.pessoa;
    const current = summaries.get(personId) ?? {
      personId,
      name: item.expand?.pessoa?.nome || "Pessoa sem nome",
      active: 0,
      overdue: 0,
      total: 0,
      items: [],
    };

    current.total += 1;
    current.items.push(item);

    if (["Emprestado", "Atrasado"].includes(item.estado)) {
      current.active += 1;

      const isOverdue =
        item.estado === "Atrasado" ||
        Boolean(item.data_prevista?.slice(0, 10) < today);

      if (isOverdue) current.overdue += 1;

      if (
        item.data_prevista &&
        (!current.nextDue || item.data_prevista < current.nextDue)
      ) {
        current.nextDue = item.data_prevista;
      }
    }

    summaries.set(personId, current);
  }

  return [...summaries.values()].sort(
    (a, b) =>
      b.overdue - a.overdue ||
      b.active - a.active ||
      a.name.localeCompare(b.name, "pt-PT"),
  );
}
