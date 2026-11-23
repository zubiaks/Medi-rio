/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/tmdbWorkspace.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Serviço de domínio TypeScript
 * Domínio: Providers / espaço de trabalho TMDB
 * Finalidade: Centralizar separadores, disponibilidade e navegação por teclado.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
export const TMDB_WORKSPACE_TABS = [
  { id: "metadata", label: "Metadados" },
  { id: "relations", label: "Relações" },
  { id: "credits", label: "Créditos" },
  { id: "seasons", label: "Temporadas" },
  { id: "aliases", label: "Aliases" },
  { id: "images", label: "Imagens" },
  { id: "history", label: "Histórico" },
  { id: "health", label: "Diagnóstico" },
] as const;

export type TmdbWorkspaceTab = typeof TMDB_WORKSPACE_TABS[number]["id"];

export function availableTmdbWorkspaceTabs(
  mediaType: string,
): ReadonlyArray<typeof TMDB_WORKSPACE_TABS[number]> {
  return TMDB_WORKSPACE_TABS.filter((tab) =>
    tab.id !== "seasons" || mediaType === "tv",
  );
}

export function nextTmdbWorkspaceTab(
  current: TmdbWorkspaceTab,
  mediaType: string,
  direction: 1 | -1,
): TmdbWorkspaceTab {
  const list = availableTmdbWorkspaceTabs(mediaType);
  const index = Math.max(0, list.findIndex((tab) => tab.id === current));
  return list[(index + direction + list.length) % list.length].id;
}
