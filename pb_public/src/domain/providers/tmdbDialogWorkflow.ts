/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbDialogWorkflow.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / fluxo TMDB
 * Finalidade: Determinar a etapa atual e as ações disponíveis no diálogo TMDB.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
export const TMDB_DIALOG_STEPS = [
  { id: "search", label: "Pesquisar" },
  { id: "result", label: "Resultado" },
  { id: "catalogue", label: "Catálogo" },
  { id: "review", label: "Rever" },
] as const;

export type TmdbDialogStep = typeof TMDB_DIALOG_STEPS[number]["id"];

export interface TmdbDialogWorkflowInput {
  hasResults: boolean;
  hasSelectedResult: boolean;
  hasSelectedTitle: boolean;
  hasDetails: boolean;
}

export function currentTmdbDialogStep(
  input: TmdbDialogWorkflowInput,
): TmdbDialogStep {
  if (input.hasDetails && input.hasSelectedTitle) return "review";
  if (input.hasSelectedTitle) return "catalogue";
  if (input.hasSelectedResult) return "catalogue";
  if (input.hasResults) return "result";
  return "search";
}

export function completedTmdbDialogSteps(
  input: TmdbDialogWorkflowInput,
): TmdbDialogStep[] {
  const completed: TmdbDialogStep[] = [];
  if (input.hasResults || input.hasSelectedResult) completed.push("search");
  if (input.hasSelectedResult) completed.push("result");
  if (input.hasSelectedTitle && input.hasDetails) completed.push("catalogue");
  return completed;
}
