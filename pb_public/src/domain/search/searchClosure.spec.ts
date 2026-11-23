/** Mediário | Teste estrutural de encerramento da Pesquisa 9.0. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

function source(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");
}

describe("encerramento da pesquisa 9.0", () => {
  it("mantém a pesquisa sem dependência de providers externos", () => {
    const search = source("./globalSearch.ts");
    expect(search).not.toContain("api.themoviedb.org");
    expect(search).not.toContain("omdbapi.com");
  });

  it("mantém atalhos, URL e detalhe contextual", () => {
    const providers = source("../../views/ProvidersView.vue");
    const dialog = source("../../components/search/GlobalSearchDialog.vue");
    expect(providers).toContain("isGlobalSearchShortcut");
    expect(dialog).toContain("replaceSearchUrl");
    expect(dialog).toContain("GlobalSearchDetailDialog");
  });

  it("não coloca credenciais nos módulos de pesquisa", () => {
    const dialog = source("../../components/search/GlobalSearchDialog.vue");
    expect(dialog).not.toContain("api_key");
    expect(dialog).not.toContain("apikey");
  });
});
