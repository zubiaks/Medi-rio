import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
describe("estilos consolidados de Providers", () => {
  it("mantém um único import de CSS de Providers", () => {
    const source = readFileSync(fileURLToPath(new URL("../../main.ts", import.meta.url)), "utf8");
    expect(source.match(/styles\/providers[^\"]*\.css/g) || []).toEqual(["styles/providers.css"]);
  });
});
