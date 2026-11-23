import { describe, expect, it } from "vitest";
import {
  canCloseTmdbDialog,
  shouldConfirmTmdbClose,
} from "./tmdbSafeClose";

describe("fecho seguro TMDB", () => {
  it("bloqueia o fecho durante uma escrita", () => {
    expect(canCloseTmdbDialog(true)).toBe(false);
  });

  it("pede confirmação quando existe revisão pendente", () => {
    expect(shouldConfirmTmdbClose(false, true)).toBe(true);
    expect(shouldConfirmTmdbClose(false, false)).toBe(false);
  });
});
