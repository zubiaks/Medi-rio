import { describe, expect, it } from "vitest";
import { buildCreditPreview } from "./tmdbCredits";

describe("créditos TMDB", () => {
  it("separa elenco, realização e argumento", () => {
    const result = buildCreditPreview({ credits: { cast: [{ name: "Pessoa A", character: "Personagem" }], crew: [{ name: "Pessoa B", job: "Director" }, { name: "Pessoa C", job: "Writer" }] } } as any);
    expect(result.map((item) => item.group)).toEqual(["cast", "directors", "writers"]);
  });
});
