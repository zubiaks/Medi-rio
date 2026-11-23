/** Mediário | Teste estrutural do ZIP 11B. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

function source(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");
}

describe("segurança do ZIP 11B", () => {
  it("protege providers e reserva credenciais ao administrador", () => {
    const tmdb = source("../../../../pb_hooks/40_provider_tmdb.pb.js");
    const omdb = source("../../../../pb_hooks/50_provider_omdb.pb.js");
    const admin = source("../../../../pb_hooks/60_provider_admin.pb.js");
    expect(tmdb).toContain("requireTmdbUser(e)");
    expect(omdb).toContain("requireOmdbUser(e)");
    expect(admin).toContain('role !== "admin"');
  });

  it("fecha escrita direta de configurações e auditoria", () => {
    const migration = source("../../../../pb_migrations/1763866600_security_rules.js");
    expect(migration).toContain('apply("app_settings"');
    expect(migration).toContain('apply("audit_log"');
    expect(migration).toContain("createRule: null");
  });
});
