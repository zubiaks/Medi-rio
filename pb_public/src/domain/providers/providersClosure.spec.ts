/**
 * Projeto: Mediário
 * Caminho: src/domain/providers/providersClosure.spec.ts
 * Versão do ficheiro: 1.0.0
 * Tipo: Teste estrutural de encerramento
 * Domínio: Providers e Manutenção
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

function source(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");
}

describe("encerramento do marco Providers", () => {
  it("mantém apenas um CSS consolidado de Providers", () => {
    const main = source("../../main.ts");
    expect(main.match(/styles\/providers[^\"]*\.css/g) || [])
      .toEqual(["styles/providers.css"]);
  });

  it("não contém marcação HTML contaminada nos ficheiros Providers", () => {
    const files = readdirSync(
      fileURLToPath(new URL(".", import.meta.url)),
    ).filter((name) => /\.(ts|vue|css)$/.test(name));
    for (const file of files) {
      const content = source(`./${file}`);
      expect(content).not.toContain("<a href=");
      expect(content).not.toContain("&lt;");
      expect(content).not.toContain("=&gt;");
    }
  });

  it("mantém o workspace separado das operações globais", () => {
    const dialog = source("../../components/providers/TmdbSearchDialog.vue");
    const maintenance = source(
      "../../components/maintenance/TmdbOperationsWorkspace.vue",
    );
    expect(dialog).toContain("TmdbWorkspaceTabs");
    expect(dialog).not.toContain("TmdbBatchExecutorPanel");
    expect(maintenance).toContain("TmdbBatchExecutorPanel");
    expect(maintenance).toContain("TmdbOperationsReportPanel");
  });
});
