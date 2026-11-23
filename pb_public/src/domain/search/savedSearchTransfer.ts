/** Mediário | Exportação e importação segura de pesquisas guardadas. */
import type { SavedSearch } from "./savedSearches";

export interface SavedSearchArchive {
  format: "mediario-saved-searches";
  version: 1;
  exportedAt: string;
  items: SavedSearch[];
}

export function exportSavedSearches(items: SavedSearch[]): string {
  const archive: SavedSearchArchive = {
    format: "mediario-saved-searches",
    version: 1,
    exportedAt: new Date().toISOString(),
    items: items.slice(0, 20),
  };
  return JSON.stringify(archive, null, 2);
}

export function importSavedSearches(content: string): SavedSearch[] {
  const archive = JSON.parse(content) as Partial<SavedSearchArchive>;
  if (
    archive.format !== "mediario-saved-searches" ||
    archive.version !== 1 ||
    !Array.isArray(archive.items)
  ) {
    throw new Error("O ficheiro não é uma exportação válida de pesquisas do Mediário.");
  }
  return archive.items.slice(0, 20).map((item) => {
    if (!item.id || !item.name || !item.query || !Array.isArray(item.filters?.entities)) {
      throw new Error("A exportação contém uma pesquisa inválida.");
    }
    return {
      id: String(item.id),
      name: String(item.name).slice(0, 120),
      query: String(item.query).slice(0, 300),
      filters: {
        entities: item.filters.entities,
        provider: item.filters.provider || "",
        yearFrom: item.filters.yearFrom || null,
        yearTo: item.filters.yearTo || null,
        includeDeleted: Boolean(item.filters.includeDeleted),
      },
      createdAt: String(item.createdAt || new Date().toISOString()),
    };
  });
}
