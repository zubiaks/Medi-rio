/** Mediário | Tipos de autenticação e autorização. */
export type UserRole = "admin" | "editor" | "utilizador" | "leitor";
export type UserState = "ativo" | "pendente" | "bloqueado";

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  estado: UserState;
  avatar: string;
  ultimo_acesso: string;
  verified: boolean;
  created: string;
  updated: string;
}

export type Permission =
  | "catalog.read"
  | "catalog.write"
  | "providers.use"
  | "providers.credentials"
  | "maintenance.use"
  | "audit.read"
  | "users.manage"
  | "diary.use"
  | "lists.use";
