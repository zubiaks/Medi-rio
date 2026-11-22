/**
 * Projeto: Mediário
 * Ficheiro: src/router/index.ts
 * Versão do ficheiro: 1.2.0
 * Tipo: Router Vue
 *
 * Regista a rota real `/diario`, substituindo a área provisória.
 */
import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
    { path: "/catalogo", name: "catalog", component: () => import("@/views/CatalogView.vue") },
    { path: "/catalogo/novo", name: "catalog-create", component: () => import("@/views/TitleCreateView.vue") },
    { path: "/catalogo/:id/editar", name: "catalog-edit", component: () => import("@/views/TitleEditView.vue") },
    { path: "/catalogo/:id", name: "catalog-detail", component: () => import("@/views/TitleDetailView.vue") },
    { path: "/lixeira", name: "trash", component: () => import("@/views/TrashView.vue") },
    { path: "/vod/novo", name: "vod-create", component: () => import("@/views/VodCreateView.vue") },
    { path: "/vod/:id/editar", name: "vod-edit", component: () => import("@/views/VodEditView.vue") },
    { path: "/vod", name: "vod", component: () => import("@/views/VodView.vue") },
    { path: "/podcasts", name: "podcasts", component: () => import("@/views/PodcastsView.vue") },
    { path: "/iptv", name: "iptv", component: () => import("@/views/IptvView.vue") },
    { path: "/tv", redirect: { name: "iptv" } },
    { path: "/biblioteca", name: "library", component: () => import("@/views/LibraryView.vue") },
    { path: "/diario", name: "diary", component: () => import("@/views/DiaryView.vue") },
    ...["colecoes", "descobrir", "reviews", "providers", "manutencao", "definicoes"].map((path) => ({ path: `/${path}`, name: path, component: () => import("@/views/PlaceholderView.vue"), props: { title: path[0]?.toUpperCase() + path.slice(1), description: "Área preparada para migração incremental." } })),
    { path: "/dev", name: "dev", component: () => import("@/views/DevView.vue") },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue") },
  ],
});

router.afterEach(() => {
  document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
});

export default router;
