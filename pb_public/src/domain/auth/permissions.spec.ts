import { describe, expect, it } from "vitest";
import { roleCan } from "./permissions";

describe("permissões", () => {
  it("reserva credenciais e utilizadores ao administrador", () => {
    expect(roleCan("admin", "providers.credentials")).toBe(true);
    expect(roleCan("editor", "providers.credentials")).toBe(false);
    expect(roleCan("utilizador", "users.manage")).toBe(false);
  });

  it("permite consulta do catálogo a todas as funções", () => {
    for (const role of ["admin", "editor", "utilizador", "leitor"] as const) {
      expect(roleCan(role, "catalog.read")).toBe(true);
    }
  });
});
