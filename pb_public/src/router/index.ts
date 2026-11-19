import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
    { path: "/catalogo", name: "catalog", component: () => import("@/views/CatalogView.vue") },
    { path: "/catalogo/novo", name: "catalog-create", component: () => import("@/views/TitleCreateView.vue") },
    { path: "/catalogo/:id/editar", name: "catalog-edit", component: () => import("@/views/PlaceholderView.vue"), props: { title: "Editar tÃ­tulo", description: "A ediÃ§Ã£o serÃ¡ o prÃ³ximo incremento do catÃ¡logo." } },
    { path: "/catalogo/:id", name: "catalog-detail", component: () => import("@/views/TitleDetailView.vue") },
    { path: "/vod", name: "vod", component: () => import("@/views/VodView.vue") },
    { path: "/podcasts", name: "podcasts", component: () => import("@/views/PodcastsView.vue") },
    { path: "/tv", name: "live", component: () => import("@/views/LiveView.vue") },
    { path: "/biblioteca", name: "library", component: () => import("@/views/LibraryView.vue") },
    ...["colecoes", "descobrir", "diario", "reviews", "providers", "manutencao", "definicoes"].map((path) => ({ path: `/${path}`, name: path, component: () => import("@/views/PlaceholderView.vue"), props: { title: path[0]?.toUpperCase() + path.slice(1), description: "Área preparada para migração incremental." } })),
    { path: "/dev", name: "dev", component: () => import("@/views/DevView.vue") },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue") },
  ],
});

router.afterEach(() => document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true }));
export default router;

