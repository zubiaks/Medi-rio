/**
 * Mediário
 * Caminho: src/domain/search/searchDetails.ts
 * Versão: 1.0.0
 * Domínio: Pesquisa e descoberta
 * Finalidade: Carregar detalhes e relações conhecidas do resultado selecionado.
 */
import { pb } from "@/infrastructure/pocketbase/client";
import type { GlobalSearchItem } from "./globalSearch";

export interface SearchDetailRelation {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  url?: string;
}

export interface SearchItemDetails {
  item: GlobalSearchItem;
  facts: Array<{ label: string; value: string }>;
  relations: SearchDetailRelation[];
}

function text(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

function fact(label: string, value: unknown): { label: string; value: string } | null {
  const normalized = text(value);
  return normalized === "—" ? null : { label, value: normalized };
}

function baseFacts(item: GlobalSearchItem): Array<{ label: string; value: string }> {
  const record = item.record as Record<string, unknown>;
  const candidates: Array<{ label: string; value: unknown }> = [
    { label: "Tipo", value: item.entity },
    { label: "Ano", value: item.year },
    { label: "Provider", value: item.provider },
    { label: "Título original", value: record.titulo_original },
    { label: "Estado", value: record.estado },
    { label: "Favorito", value: record.favorito },
    { label: "IMDb ID", value: record.imdb_id },
    { label: "TMDB ID", value: record.tmdb_id },
    { label: "Rating IMDb", value: record.imdb_rating },
    { label: "Metascore", value: record.metascore },
    { label: "Classificação etária", value: record.classificacao_etaria },
    { label: "Duração", value: record.duracao_min ? `${record.duracao_min} min` : "" },
    { label: "País", value: record.pais },
    { label: "Idioma", value: record.idioma },
    { label: "Departamento", value: record.departamento },
    { label: "Data", value: record.data_exibicao || record.data_estreia || record.publicado_em },
    { label: "Última sincronização", value: record.ultima_sincronizacao },
  ];
  return candidates.map((item) => fact(item.label, item.value)).filter((value): value is { label: string; value: string } => Boolean(value));
}

async function titleRelations(titleId: string): Promise<SearchDetailRelation[]> {
  const [sources, aliases, seasons, credits] = await Promise.all([
    pb.collection("fontes_externas").getList(1, 50, {
      filter: `titulo = "${titleId}"`,
      sort: "provider,external_id",
      requestKey: `search-detail-sources-${titleId}`,
    }),
    pb.collection("titulos_alternativos").getList(1, 50, {
      filter: `titulo = "${titleId}"`,
      sort: "pais,nome",
      requestKey: `search-detail-aliases-${titleId}`,
    }),
    pb.collection("temporadas").getList(1, 100, {
      filter: `titulo = "${titleId}"`,
      sort: "numero",
      requestKey: `search-detail-seasons-${titleId}`,
    }),
    pb.collection("creditos").getList(1, 100, {
      filter: `titulo = "${titleId}"`,
      sort: "ordem",
      expand: "pessoa,funcao",
      requestKey: `search-detail-credits-${titleId}`,
    }),
  ]);

  return [
    ...sources.items.map((record: any) => ({
      id: record.id,
      kind: "Fonte externa",
      title: `${record.provider}: ${record.external_id}`,
      subtitle: record.tipo_externo || "",
      url: record.external_url || undefined,
    })),
    ...aliases.items.map((record: any) => ({
      id: record.id,
      kind: "Alias",
      title: record.nome,
      subtitle: [record.pais, record.idioma, record.tipo].filter(Boolean).join(" · "),
    })),
    ...seasons.items.map((record: any) => ({
      id: record.id,
      kind: "Temporada",
      title: record.nome || `Temporada ${record.numero}`,
      subtitle: `${record.n_episodios || 0} episódios`,
    })),
    ...credits.items.map((record: any) => ({
      id: record.id,
      kind: "Crédito",
      title: record.expand?.pessoa?.nome || record.personagem_nome || "Pessoa",
      subtitle: [record.expand?.funcao?.nome, record.personagem_nome].filter(Boolean).join(" · "),
    })),
  ];
}

async function personRelations(personId: string): Promise<SearchDetailRelation[]> {
  const credits = await pb.collection("creditos").getList(1, 100, {
    filter: `pessoa = "${personId}"`,
    sort: "-created",
    expand: "titulo,funcao",
    requestKey: `search-detail-person-credits-${personId}`,
  });
  return credits.items.map((record: any) => ({
    id: record.id,
    kind: "Crédito",
    title: record.expand?.titulo?.titulo || "Título",
    subtitle: [record.expand?.funcao?.nome, record.personagem_nome].filter(Boolean).join(" · "),
  }));
}

export async function loadSearchItemDetails(
  item: GlobalSearchItem,
): Promise<SearchItemDetails> {
  let relations: SearchDetailRelation[] = [];
  if (item.entity === "titles") relations = await titleRelations(item.id);
  if (item.entity === "people") relations = await personRelations(item.id);
  return {
    item,
    facts: baseFacts(item),
    relations,
  };
}
