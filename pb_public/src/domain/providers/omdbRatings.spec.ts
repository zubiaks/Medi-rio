import { describe, expect, it } from "vitest";
import { buildOmdbHealth, normalizeOmdbRatings } from "./omdbRatings";

describe("ratings OMDb", () => {
  it("normaliza IMDb, Rotten Tomatoes e Metacritic", () => {
    expect(normalizeOmdbRatings([
      { Source: "Internet Movie Database", Value: "8.5/10" },
      { Source: "Rotten Tomatoes", Value: "93%" },
      { Source: "Metacritic", Value: "89/100" },
    ])).toEqual({ imdb: 8.5, rottenTomatoes: 93, metacritic: 89 });
  });

  it("deteta IMDb ID incoerente", () => {
    const report = buildOmdbHealth(
      { imdb_id: "tt0000001" } as any,
      { imdb_id: "tt0000002", ratings: [] } as any,
    );
    expect(report.items.find((item) => item.key === "identity")?.ok).toBe(false);
  });
});
