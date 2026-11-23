/** Mediário | Ponto de entrada da aplicação. */
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { installAuthGuards } from "@/domain/auth/routerGuard";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "@/styles/catalog-trash.css";
import "@/styles/catalog-media.css";
import "@/styles/catalog-detail-media.css";
import "@/styles/vod.css";
import "@/styles/vod-management.css";
import "@/styles/vod-delete-dialog.css";
import "@/styles/podcasts.css";
import "@/styles/iptv-all.css";
import "@/styles/library.css";
import "@/styles/diary.css";
import "@/styles/providers.css";
import "@/styles/auth.css";
if (!router.hasRoute("login")) {
  router.addRoute({
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { public: true },
  });
}
if (!router.hasRoute("reset-password")) {
  router.addRoute({
    path: "/reset-password",
    name: "reset-password",
    component: () => import("@/views/ResetPasswordView.vue"),
    meta: { public: true },
  });
}
if (!router.hasRoute("profile")) {
  router.addRoute({
    path: "/perfil",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
  });
}
if (!router.hasRoute("forbidden")) {
  router.addRoute({
    path: "/403",
    name: "forbidden",
    component: () => import("@/views/ForbiddenView.vue"),
  });
}
installAuthGuards(router);
createApp(App).use(router).mount("#app");
