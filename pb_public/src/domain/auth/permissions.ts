/** Mediário | Matriz central de permissões. */
import type { Permission, UserRole } from "./types";

const matrix: Record<UserRole, Permission[]> = {
  admin: [
    "catalog.read", "catalog.write", "providers.use", "providers.credentials",
    "maintenance.use", "audit.read", "users.manage", "diary.use", "lists.use",
  ],
  editor: [
    "catalog.read", "catalog.write", "providers.use", "maintenance.use",
    "diary.use", "lists.use",
  ],
  utilizador: ["catalog.read", "diary.use", "lists.use"],
  leitor: ["catalog.read"],
};

export function rolePermissions(role: UserRole): Permission[] {
  return matrix[role] || [];
}

export function roleCan(role: UserRole | undefined, permission: Permission): boolean {
  return role ? rolePermissions(role).includes(permission) : false;
}
