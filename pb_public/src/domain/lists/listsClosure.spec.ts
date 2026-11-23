/** Mediário | Encerramento estrutural do marco 10.0. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

function source(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");
}

describe("encerramento de coleções e listas", () => {
  it("mantém persistência local explicitamente versionada", () => {
    expect(source("./personalLists.ts")).toContain("mediario-personal-lists-v1");
    expect(source("./listActivity.ts")).toContain("mediario-list-activity-v1");
  });

  it("liga dashboard, gestor e pesquisa global", () => {
    const view = source("../../views/ProvidersView.vue");
    const detail = source("../../components/search/GlobalSearchDetailDialog.vue");
    expect(view).toContain("ListsDashboardDialog");
    expect(view).toContain("PersonalListsDialog");
    expect(detail).toContain("AddToListPanel");
  });

  it("não introduz credenciais nos módulos de listas", () => {
    const smart = source("./smartLists.ts");
    expect(smart).not.toContain("api_key");
    expect(smart).not.toContain("apikey");
  });
});
