/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
    },

    // Catálogo
    {
      path: "/catalogo",
      name: "catalog",
      component: () => import("@/views/CatalogView.vue"),
    },
    {
      path: "/catalogo/novo",
      name: "catalog-create",
      component: () => import("@/views/TitleCreateView.vue"),
    },
    {
      path: "/catalogo/:id/editar",
      name: "catalog-edit",
      component: () => import("@/views/TitleEditView.vue"),
    },
    {
      path: "/catalogo/:id",
      name: "catalog-detail",
      component: () => import("@/views/TitleDetailView.vue"),
    },
    {
      path: "/lixeira",
      name: "trash",
      component: () => import("@/views/TrashView.vue"),
    },

    // VOD
    // As rotas específicas devem ficar antes de /vod e de eventuais rotas dinâmicas.
    {
      path: "/vod/novo",
      name: "vod-create",
      component: () => import("@/views/VodCreateView.vue"),
    },
    {
      path: "/vod/:id/editar",
      name: "vod-edit",
      component: () => import("@/views/VodEditView.vue"),
    },
    {
      path: "/vod",
      name: "vod",
      component: () => import("@/views/VodView.vue"),
    },

    // Podcasts, IPTV e biblioteca
    {
      path: "/podcasts",
      name: "podcasts",
      component: () => import("@/views/PodcastsView.vue"),
    },
    {
      path: "/iptv",
      name: "iptv",
      component: () => import("@/views/IptvView.vue"),
    },
    {
      path: "/tv",
      redirect: "/iptv",
    },
    {
      path: "/biblioteca",
      name: "library",
      component: () => import("@/views/LibraryView.vue"),
    },

    // Áreas preparadas para migração incremental
    ...[
      "colecoes",
      "descobrir",
      "diario",
      "reviews",
      "providers",
      "manutencao",
      "definicoes",
    ].map((path) => ({
      path: `/${path}`,
      name: path,
      component: () => import("@/views/PlaceholderView.vue"),
      props: {
        title: path[0]?.toUpperCase() + path.slice(1),
        description: "Área preparada para migração incremental.",
      },
    })),

    // Diagnóstico
    {
      path: "/dev",
      name: "dev",
      component: () => import("@/views/DevView.vue"),
    },

    // Deve ser sempre a última rota.
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

router.afterEach(() => {
  document
    .querySelector<HTMLElement>("#main-content")
    ?.focus({ preventScroll: true });
});

export default router;
