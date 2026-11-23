/** Mediário | Estado reativo central da autenticação. */
import { computed, readonly, ref } from "vue";
import { pb } from "@/infrastructure/pocketbase/client";
import type { AuthUser } from "./types";

const user = ref<AuthUser | null>(pb.authStore.record as unknown as AuthUser | null);
const ready = ref(false);
const busy = ref(false);
const error = ref("");
let unsubscribe: (() => void) | undefined;

function normalizeMessage(cause: unknown): string {
  const status = (cause as { status?: number })?.status;
  if (status === 400) return "Email ou palavra-passe inválidos.";
  if (status === 403) return "A conta não está autorizada a entrar.";
  return cause instanceof Error ? cause.message : String(cause);
}

export async function initializeAuth(): Promise<void> {
  if (!unsubscribe) {
    unsubscribe = pb.authStore.onChange((_token, record) => {
      user.value = record as unknown as AuthUser | null;
    }, true);
  }
  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
      user.value = pb.authStore.record as unknown as AuthUser | null;
    }
  } catch {
    pb.authStore.clear();
    user.value = null;
  } finally {
    ready.value = true;
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  busy.value = true;
  error.value = "";
  try {
    const result = await pb.collection("users").authWithPassword(email.trim(), password);
    const signed = result.record as unknown as AuthUser;
    if (signed.estado !== "ativo") {
      pb.authStore.clear();
      throw new Error(
        signed.estado === "bloqueado"
          ? "A conta está bloqueada."
          : "A conta ainda aguarda ativação.",
      );
    }
    user.value = signed;
    try {
      await pb.collection("users").update(signed.id, {
        ultimo_acesso: new Date().toISOString(),
      });
    } catch {
      // O acesso não falha se a regra não permitir atualizar este campo.
    }
    return signed;
  } catch (cause) {
    error.value = normalizeMessage(cause);
    throw new Error(error.value);
  } finally {
    busy.value = false;
  }
}

export function logout(): void {
  pb.authStore.clear();
  user.value = null;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await pb.collection("users").requestPasswordReset(email.trim());
}

export async function confirmPasswordReset(
  token: string,
  password: string,
  passwordConfirm: string,
): Promise<void> {
  await pb.collection("users").confirmPasswordReset(
    token,
    password,
    passwordConfirm,
  );
}

export async function updateProfile(data: FormData | Record<string, unknown>): Promise<AuthUser> {
  if (!user.value) throw new Error("Não existe uma sessão ativa.");
  const result = await pb.collection("users").update(user.value.id, data);
  user.value = result as unknown as AuthUser;
  return user.value;
}

export async function changePassword(
  oldPassword: string,
  password: string,
  passwordConfirm: string,
): Promise<void> {
  if (!user.value) throw new Error("Não existe uma sessão ativa.");
  await pb.collection("users").update(user.value.id, {
    oldPassword,
    password,
    passwordConfirm,
  });
  await pb.collection("users").authRefresh();
}

export const authState = {
  user: readonly(user),
  ready: readonly(ready),
  busy: readonly(busy),
  error: readonly(error),
  authenticated: computed(() => Boolean(user.value && pb.authStore.isValid)),
};
