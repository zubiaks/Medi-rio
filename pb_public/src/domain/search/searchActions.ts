/** Mediário | Ações contextuais por entidade da pesquisa. */
import type { GlobalSearchItem } from "./globalSearch";

export interface SearchAction {
  id: "copy-id" | "copy-title" | "open-source" | "copy-external-id";
  label: string;
  externalUrl?: string;
}

export function actionsForSearchItem(item: GlobalSearchItem): SearchAction[] {
  const actions: SearchAction[] = [
    { id: "copy-id", label: "Copiar ID interno" },
    { id: "copy-title", label: "Copiar nome" },
  ];
  if (item.entity === "sources") {
    const record = item.record as Record<string, unknown>;
    if (record.external_id) {
      actions.push({ id: "copy-external-id", label: "Copiar identificador externo" });
    }
    if (record.external_url) {
      actions.push({
        id: "open-source",
        label: "Abrir fonte externa",
        externalUrl: String(record.external_url),
      });
    }
  }
  return actions;
}

export async function executeSearchAction(
  action: SearchAction,
  item: GlobalSearchItem,
): Promise<void> {
  if (action.id === "open-source" && action.externalUrl) {
    window.open(action.externalUrl, "_blank", "noopener,noreferrer");
    return;
  }
  const record = item.record as Record<string, unknown>;
  const value = action.id === "copy-id"
    ? item.id
    : action.id === "copy-external-id"
      ? String(record.external_id || "")
      : item.title;
  await navigator.clipboard.writeText(value);
}
