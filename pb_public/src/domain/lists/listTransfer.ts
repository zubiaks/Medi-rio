/** Mediário | Portabilidade versionada das listas pessoais. */
import type { PersonalList } from "./personalLists";

export interface PersonalListArchive {
  format: "mediario-personal-lists";
  version: 1;
  exportedAt: string;
  lists: PersonalList[];
}

export function exportPersonalLists(lists: PersonalList[]): string {
  return JSON.stringify({
    format: "mediario-personal-lists",
    version: 1,
    exportedAt: new Date().toISOString(),
    lists: lists.slice(0, 50),
  } satisfies PersonalListArchive, null, 2);
}

export function importPersonalLists(content: string): PersonalList[] {
  const archive = JSON.parse(content) as Partial<PersonalListArchive>;
  if (archive.format !== "mediario-personal-lists" || archive.version !== 1 || !Array.isArray(archive.lists)) {
    throw new Error("O ficheiro não é uma exportação válida de listas do Mediário.");
  }
  return archive.lists.slice(0, 50).map((list) => {
    if (!list.id || !list.name || !["manual", "smart"].includes(list.kind)) {
      throw new Error("A exportação contém uma lista inválida.");
    }
    return {
      ...list,
      name: String(list.name).slice(0, 120),
      description: String(list.description || "").slice(0, 500),
      items: Array.isArray(list.items) ? list.items.slice(0, 500) : [],
    };
  });
}
