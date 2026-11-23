/** Mediário | Regras do atalho global da pesquisa. */
export function isGlobalSearchShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  const editable = target?.matches("input, textarea, select, [contenteditable='true']");
  if (editable) return false;
  return event.key === "/" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k");
}
