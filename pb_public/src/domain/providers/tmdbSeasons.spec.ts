import { describe, expect, it } from "vitest";
import type { TmdbSeason } from "./tmdbSeasons";

describe("temporadas TMDB", () => {
  it("representa especiais como temporada zero", () => {
    const season: TmdbSeason = { id: 1, season_number: 0, name: "Especiais", overview: "", air_date: "", poster_url: "", episodes: [] };
    expect(season.season_number).toBe(0);
  });
});
