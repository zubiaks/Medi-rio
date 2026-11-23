/** Router principal do Mediário. */
import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    if (to.fullPath !== from.fullPath) return { top: 0 };
    return false;
  },
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue"), meta: { title: "Início" } },
    { path: "/catalogo", name: "catalog", component: () => import("@/views/CatalogView.vue"), meta: { title: "Catálogo" } },
    { path: "/catalogo/novo", name: "catalog-create", component: () => import("@/views/TitleCreateView.vue"), meta: { permission: "catalog.write" } },
    { path: "/catalogo/:id/editar", name: "catalog-edit", component: () => import("@/views/TitleEditView.vue"), meta: { permission: "catalog.write" } },
    { path: "/catalogo/:id", name: "catalog-detail", component: () => import("@/views/TitleDetailView.vue") },
    { path: "/lixeira", name: "trash", component: () => import("@/views/TrashView.vue"), meta: { permission: "catalog.write" } },
    { path: "/vod/novo", name: "vod-create", component: () => import("@/views/VodCreateView.vue"), meta: { permission: "catalog.write" } },
    { path: "/vod/:id/editar", name: "vod-edit", component: () => import("@/views/VodEditView.vue"), meta: { permission: "catalog.write" } },
    { path: "/vod", name: "vod", component: () => import("@/views/VodView.vue") },
    { path: "/podcasts", name: "podcasts", component: () => import("@/views/PodcastsView.vue") },
    { path: "/iptv", name: "iptv", component: () => import("@/views/IptvView.vue") },
    { path: "/tv", redirect: { name: "iptv" } },
    { path: "/biblioteca", name: "library", component: () => import("@/views/LibraryView.vue") },
    { path: "/diario", name: "diary", component: () => import("@/views/DiaryView.vue"), meta: { permission: "diary.use" } },
    { path: "/pesquisa", name: "search", component: () => import("@/views/SearchView.vue"), meta: { title: "Pesquisa" } },
    { path: "/listas", name: "lists", component: () => import("@/views/ListsView.vue"), meta: { title: "Listas", permission: "lists.use" } },
    { path: "/providers", name: "providers", component: () => import("@/views/ProvidersView.vue"), meta: { title: "Providers", permission: "providers.use" } },
    { path: "/manutencao", name: "maintenance", component: () => import("@/views/MaintenanceView.vue"), meta: { title: "Manutenção", permission: "maintenance.use" } },
    { path: "/perfil", name: "profile", component: () => import("@/views/ProfileView.vue"), meta: { title: "Perfil" } },
    { path: "/administracao", name: "administration", component: () => import("@/views/AdministrationView.vue"), meta: { title: "Administração", permission: "users.manage" } },
    { path: "/login", name: "login", component: () => import("@/views/LoginView.vue"), meta: { public: true } },
    { path: "/reset-password", name: "reset-password", component: () => import("@/views/ResetPasswordView.vue"), meta: { public: true } },
    { path: "/403", name: "forbidden", component: () => import("@/views/ForbiddenView.vue") },
    ...["colecoes", "descobrir", "reviews", "definicoes"].map((path) => ({
      path: `/${path}`,
      name: path,
      component: () => import("@/views/PlaceholderView.vue"),
      props: {
        title: path[0]?.toUpperCase() + path.slice(1),
        description: "Área preparada para migração incremental.",
      },
    })),
    { path: "/dev", name: "dev", component: () => import("@/views/DevView.vue"), meta: { permission: "users.manage" } },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue") },
  ],
});

router.afterEach(() => {
  document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
});

export default router;
