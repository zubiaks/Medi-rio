/** Mediário | Guards do Vue Router para sessão e permissões. */
import type { Router } from "vue-router";
import { authState, initializeAuth } from "./authStore";
import { roleCan } from "./permissions";
import type { Permission } from "./types";

export function installAuthGuards(router: Router): void {
  router.beforeEach(async (to) => {
    if (!authState.ready.value) await initializeAuth();
    const publicRoute = to.meta.public === true;
    if (!publicRoute && !authState.authenticated.value) {
      return {
        name: "login",
        query: { redirect: to.fullPath },
      };
    }
    if (to.name === "login" && authState.authenticated.value) {
      return { path: "/" };
    }
    const permission = to.meta.permission as Permission | undefined;
    if (permission && !roleCan(authState.user.value?.role, permission)) {
      return { name: "forbidden" };
    }
    return true;
  });
}
