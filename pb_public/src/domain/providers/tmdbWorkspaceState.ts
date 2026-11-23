/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbWorkspaceState.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Utilitário TypeScript
 * Domínio: Providers / workspace TMDB
 * Finalidade: Preservar localmente o último separador usado, sem guardar dados do título.
 */
import type { TmdbWorkspaceTab } from "./tmdbWorkspace";
import { TMDB_WORKSPACE_TABS } from "./tmdbWorkspace";

const KEY = "mediario-tmdb-workspace-tab";

export function loadTmdbWorkspaceTab(): TmdbWorkspaceTab {
  const value = sessionStorage.getItem(KEY);
  return TMDB_WORKSPACE_TABS.some((item) => item.id === value)
    ? value as TmdbWorkspaceTab
    : "metadata";
}

export function saveTmdbWorkspaceTab(value: TmdbWorkspaceTab): void {
  sessionStorage.setItem(KEY, value);
}

export function clearTmdbWorkspaceTab(): void {
  sessionStorage.removeItem(KEY);
}
