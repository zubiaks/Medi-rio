import { describe, expect, it } from "vitest";
import { buildProviderSettingStatuses } from "./settings";

describe("configurações seguras dos providers", () => {
  it("indica apenas se a chave está configurada", () => {
    const result = buildProviderSettingStatuses([
      { chave: "tmdb_api_key_v3", valor: "segredo" },
    ] as any);
    expect(result.find((item) => item.key === "tmdb_api_key_v3")).toMatchObject({
      configured: true,
    });
    expect(JSON.stringify(result)).not.toContain("segredo");
  });
});
