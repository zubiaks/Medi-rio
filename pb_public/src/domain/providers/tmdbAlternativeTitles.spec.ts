import { describe, expect, it } from "vitest";
import { buildAlternativeTitlePreview, normalizeAlternativeTitle } from "./tmdbAlternativeTitles";

describe("títulos alternativos TMDB", () => {
  it("normaliza títulos com acentos e pontuação", () => {
    expect(normalizeAlternativeTitle("O 8.º Passageiro")).toBe("o 8 passageiro");
  });
  it("remove duplicados do mesmo país", () => {
    const result = buildAlternativeTitlePreview({ alternative_titles: [
      { name: "Alien", country: "US", type: "" },
      { name: "Alien", country: "US", type: "" },
      { name: "Alien", country: "PT", type: "" },
    ] } as any);
    expect(result).toHaveLength(2);
  });
});
