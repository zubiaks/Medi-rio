/** Mediário | Breadcrumbs por rota e contexto. */
import type { RouteLocationNormalizedLoaded } from "vue-router";

export interface BreadcrumbItem { label: string; to?: string }

const labels: Record<string, string> = {
  home: "Início",
  catalog: "Catálogo",
  "catalog-create": "Novo título",
  "catalog-edit": "Editar título",
  "catalog-detail": "Detalhe do título",
  trash: "Lixeira",
  vod: "VOD",
  podcasts: "Podcasts",
  iptv: "IPTV",
  library: "Biblioteca",
  diary: "Diário",
  search: "Pesquisa",
  lists: "Listas",
  providers: "Providers",
  maintenance: "Manutenção",
  profile: "Perfil",
  administration: "Administração",
};

export function routeBreadcrumbs(route: RouteLocationNormalizedLoaded): BreadcrumbItem[] {
  if (route.name === "home") return [];
  const items: BreadcrumbItem[] = [{ label: "Início", to: "/" }];
  if (String(route.name).startsWith("catalog-") && route.name !== "catalog") {
    items.push({ label: "Catálogo", to: "/catalogo" });
  }
  items.push({
    label: labels[String(route.name)] || String(route.meta.title || route.name || "Página"),
  });
  return items;
}
