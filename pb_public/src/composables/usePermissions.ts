/** Mediário | Composable de autorização por função. */
import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { useAuth } from "./useAuth";
import { roleCan } from "@/domain/auth/permissions";
import type { Permission } from "@/domain/auth/types";

export function usePermissions(permission?: MaybeRefOrGetter<Permission>) {
  const auth = useAuth();
  const can = (value: Permission) => roleCan(auth.user.value?.role, value);
  return {
    can,
    allowed: computed(() => permission ? can(toValue(permission)) : false),
    isAdmin: computed(() => auth.user.value?.role === "admin"),
    isEditor: computed(() => auth.user.value?.role === "editor"),
  };
}
