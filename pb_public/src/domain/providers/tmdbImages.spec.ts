import { describe, expect, it } from "vitest";
import { selectTmdbImagePayload } from "./tmdbImages";

describe("imagens TMDB", () => {
  it("mapeia cada tipo para o campo URL correspondente", () => {
    const image = { url: "https://image.tmdb.org/t/p/original/x.jpg" } as any;
    expect(selectTmdbImagePayload("poster", image)).toEqual({ poster_url: image.url });
    expect(selectTmdbImagePayload("backdrop", image)).toEqual({ backdrop_url: image.url });
    expect(selectTmdbImagePayload("logo", image)).toEqual({ logo_url: image.url });
  });
});
