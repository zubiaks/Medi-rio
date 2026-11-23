/** Mediário | Cliente seguro da configuração frontend de providers. */
import { pb } from "@/infrastructure/pocketbase/client";

export type ManagedProvider = "tmdb" | "omdb";
export interface ProviderAdminSettings {
  provider: ManagedProvider;
  label: string;
  enabled: boolean;
  credential_configured: boolean;
  credential_masked: string;
  language: string;
  fallback_language: string;
  timeout_seconds: number;
  requests_per_minute: number;
  retries: number;
}

export async function loadProviderAdminSettings(): Promise<ProviderAdminSettings[]> {
  return (await pb.send("/api/mediario/providers/admin/settings", { method: "GET" })).providers;
}

export async function saveProviderAdminSettings(
  value: ProviderAdminSettings,
): Promise<ProviderAdminSettings> {
  return pb.send(`/api/mediario/providers/admin/settings/${value.provider}`, {
    method: "PUT",
    body: {
      enabled: value.enabled,
      language: value.language,
      fallback_language: value.fallback_language,
      timeout_seconds: value.timeout_seconds,
      requests_per_minute: value.requests_per_minute,
      retries: value.retries,
    },
  });
}

export async function replaceProviderCredential(
  provider: ManagedProvider,
  credential: string,
): Promise<ProviderAdminSettings> {
  return pb.send(`/api/mediario/providers/admin/settings/${provider}/credential`, {
    method: "POST",
    body: { credential },
  });
}

export async function removeProviderCredential(
  provider: ManagedProvider,
): Promise<ProviderAdminSettings> {
  return pb.send(`/api/mediario/providers/admin/settings/${provider}/credential`, {
    method: "DELETE",
  });
}

export async function testProviderConnection(
  provider: ManagedProvider,
): Promise<{ ok: boolean; provider: string; message: string }> {
  return pb.send(`/api/mediario/providers/admin/settings/${provider}/test`, {
    method: "POST",
  });
}
