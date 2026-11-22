import { describe, expect, it } from "vitest";
import {
  normalizeTmdbOperationalSettings,
  TMDB_OPERATIONAL_DEFAULTS,
} from "./tmdbOperationalSettings";

describe("configuração operacional TMDB", () => {
  it("aplica os valores recomendados por omissão", () => {
    expect(normalizeTmdbOperationalSettings()).toEqual(TMDB_OPERATIONAL_DEFAULTS);
  });

  it("limita valores perigosos", () => {
    expect(normalizeTmdbOperationalSettings({
      stuckMinutes: 1,
      batchMax: 500,
      imagesLimit: 500,
      castLimit: 500,
    })).toMatchObject({
      stuckMinutes: 5,
      batchMax: 50,
      imagesLimit: 100,
      castLimit: 200,
    });
  });
});
