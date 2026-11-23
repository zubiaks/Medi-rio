/**
 * Mediário
 * Caminho: src/domain/search/globalSearch.ts
 * Versão: 1.0.0
 * Domínio: Pesquisa e descoberta
 * Finalidade: Pesquisa transversal paginada nas coleções principais.
 */
import { pb } from "@/infrastructure/pocketbase/client";

export type SearchEntity =
  | "titles"
  | "people"
  | "collections"
  | "episodes"
  | "streams"
  | "aliases"
  | "sources";

export interface GlobalSearchFilters {
  entities: SearchEntity[];
  mediaId?: string;
  yearFrom?: number | null;
  yearTo?: number | null;
  provider?: string;
  includeDeleted?: boolean;
}

export interface GlobalSearchItem {
  id: string;
  entity: SearchEntity;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  year: number | null;
  provider: string;
  record: Record<string, unknown>;
}

export interface GlobalSearchResult {
  query: string;
  total: number;
  items: GlobalSearchItem[];
  counts: Partial<Record<SearchEntity, number>>;
}

function escapeFilter(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function titleItem(record: any): GlobalSearchItem {
  return {
    id: record.id,
    entity: "titles",
    title: record.titulo || "Sem título",
    subtitle: [record.titulo_original, record.ano].filter(Boolean).join(" · "),
    description: record.sinopse || "",
    imageUrl: record.poster_url || "",
    year: record.ano || null,
    provider: record.fonte_principal || "",
    record,
  };
}

const adapters: Record<SearchEntity, (record: any) => GlobalSearchItem> = {
  titles: titleItem,
  people: (record) => ({ id: record.id, entity: "people", title: record.nome || "Sem nome", subtitle: record.departamento || "Pessoa", description: record.biografia || "", imageUrl: record.foto_url || "", year: null, provider: record.tmdb_id ? "tmdb" : "", record }),
  collections: (record) => ({ id: record.id, entity: "collections", title: record.nome || "Sem nome", subtitle: record.tipo || "Coleção", description: record.descricao || "", imageUrl: "", year: null, provider: "", record }),
  episodes: (record) => ({ id: record.id, entity: "episodes", title: record.titulo || `Episódio ${record.numero || ""}`, subtitle: `Episódio ${record.numero || "—"}`, description: record.sinopse || "", imageUrl: "", year: null, provider: record.tmdb_id ? "tmdb" : "", record }),
  streams: (record) => ({ id: record.id, entity: "streams", title: record.nome || "Sem nome", subtitle: record.tipo || "Stream", description: record.notas || "", imageUrl: record.logo_url || "", year: null, provider: "", record }),
  aliases: (record) => ({ id: record.id, entity: "aliases", title: record.nome || "Sem nome", subtitle: [record.pais, record.idioma, record.tipo].filter(Boolean).join(" · "), description: "Título alternativo", imageUrl: "", year: null, provider: record.fonte || "", record }),
  sources: (record) => ({ id: record.id, entity: "sources", title: record.expand?.titulo?.titulo || record.external_id, subtitle: [record.provider, record.tipo_externo].filter(Boolean).join(" · "), description: record.external_url || "", imageUrl: "", year: null, provider: record.provider || "", record }),
};

const definitions: Record<SearchEntity, { collection: string; filter: (query: string) => string; expand?: string }> = {
  titles: { collection: "titulos", filter: (q) => `(titulo ~ "${q}" || titulo_original ~ "${q}" || sinopse ~ "${q}")` },
  people: { collection: "pessoas", filter: (q) => `(nome ~ "${q}" || aliases ~ "${q}" || biografia ~ "${q}")` },
  collections: { collection: "colecoes", filter: (q) => `(nome ~ "${q}" || descricao ~ "${q}")` },
  episodes: { collection: "episodios", filter: (q) => `(titulo ~ "${q}" || sinopse ~ "${q}")` },
  streams: { collection: "streams", filter: (q) => `(nome ~ "${q}" || notas ~ "${q}")` },
  aliases: { collection: "titulos_alternativos", filter: (q) => `(nome ~ "${q}" || nome_normalizado ~ "${q}")` },
  sources: { collection: "fontes_externas", filter: (q) => `(external_id ~ "${q}" || provider ~ "${q}")`, expand: "titulo" },
};

export async function globalSearch(
  query: string,
  filters: GlobalSearchFilters,
  perEntity = 25,
): Promise<GlobalSearchResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) throw new Error("A pesquisa deve ter pelo menos dois caracteres.");
  const escaped = escapeFilter(trimmed);
  const entities = filters.entities.length ? filters.entities : Object.keys(definitions) as SearchEntity[];

  const results = await Promise.all(entities.map(async (entity) => {
    const definition = definitions[entity];
    const extra: string[] = [];
    if (entity === "titles") {
      if (!filters.includeDeleted) extra.push("apagado = false");
      if (filters.mediaId) extra.push(`midia = "${escapeFilter(filters.mediaId)}"`);
      if (filters.yearFrom) extra.push(`ano >= ${filters.yearFrom}`);
      if (filters.yearTo) extra.push(`ano <= ${filters.yearTo}`);
    }
    if (entity === "sources" && filters.provider) {
      extra.push(`provider = "${escapeFilter(filters.provider)}"`);
    }
    const filter = [definition.filter(escaped), ...extra].join(" && ");
    const page = await pb.collection(definition.collection).getList(1, perEntity, {
      filter,
      sort: entity === "titles" ? "titulo" : entity === "people" ? "nome" : "-updated",
      expand: definition.expand,
      requestKey: `global-search-${entity}`,
    });
    return {
      entity,
      total: page.totalItems,
      items: page.items.map(adapters[entity]),
    };
  }));

  const counts: Partial<Record<SearchEntity, number>> = {};
  for (const result of results) counts[result.entity] = result.total;
  const items = results.flatMap((result) => result.items)
    .sort((a, b) => Number(b.entity === "titles") - Number(a.entity === "titles") || a.title.localeCompare(b.title, "pt-PT"));
  return {
    query: trimmed,
    total: results.reduce((sum, result) => sum + result.total, 0),
    items,
    counts,
  };
}
