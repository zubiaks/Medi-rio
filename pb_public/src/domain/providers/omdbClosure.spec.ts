/** Mediário | Encerramento estrutural do marco OMDb 0.8.0. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

function source(relative: string): string {
  return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");
}

describe("encerramento OMDb 0.8.0", () => {
  it("mantém a credencial apenas no backend", () => {
    const client = source("./providerAdminClient.ts");
    const panel = source("../../components/maintenance/ProviderAdminPanel.vue");
    expect(client).not.toContain("omdb_api_key");
    expect(panel).not.toContain("omdb_api_key");
  });

  it("mantém aplicação e execução dependentes de revisão", () => {
    const dialog = source("../../components/providers/OmdbSearchDialog.vue");
    const executor = source("./omdbJobExecutor.ts");
    expect(dialog).toContain("prepareProtectedSync");
    expect(executor).toContain("loadOmdbDetails");
    expect(executor).not.toContain("titleRepository.update");
  });

  it("separa filas TMDB e OMDb em Manutenção", () => {
    const workspace = source(
      "../../components/maintenance/TmdbOperationsWorkspace.vue",
    );
    expect(workspace).toContain("Fila TMDB");
    expect(workspace).toContain("Fila OMDb");
    expect(workspace).toContain("ProviderOperationsDashboard");
  });
});
