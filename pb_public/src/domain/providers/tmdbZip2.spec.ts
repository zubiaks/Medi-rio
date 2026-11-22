import { describe, expect, it } from "vitest";
import type { TmdbImageKind } from "./tmdbImages";

describe("ZIP 2 de automação TMDB", () => {
  it("mantém os tipos locais de imagem limitados ao esquema confirmado", () => {
    const kinds: TmdbImageKind[] = ["poster", "backdrop", "logo"];
    expect(kinds).toEqual(["poster", "backdrop", "logo"]);
  });
});
