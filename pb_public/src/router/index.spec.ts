import { describe, expect, it } from "vitest";
import router from "./index";

describe("rotas principais", () => {
  it.each([
    ["/iptv", "iptv"],
    ["/biblioteca", "library"],
    ["/diario", "diary"],
    ["/providers", "providers"],
    ["/manutencao", "maintenance"],
  ])("expõe %s", (path, name) => {
    expect(router.resolve(path).name).toBe(name);
  });

  it("mantém /tv como redirect nomeado", () => {
    const route = router.getRoutes().find((item) => item.path === "/tv");
    expect(route?.redirect).toEqual({ name: "iptv" });
  });
});
