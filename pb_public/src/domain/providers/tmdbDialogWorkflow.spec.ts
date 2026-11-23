import { describe, expect, it } from "vitest";
import {
  completedTmdbDialogSteps,
  currentTmdbDialogStep,
} from "./tmdbDialogWorkflow";

describe("fluxo do diálogo TMDB", () => {
  it("começa na pesquisa", () => {
    expect(currentTmdbDialogStep({
      hasResults: false,
      hasSelectedResult: false,
      hasSelectedTitle: false,
      hasDetails: false,
    })).toBe("search");
  });

  it("avança até à revisão apenas depois de carregar o detalhe", () => {
    const input = {
      hasResults: true,
      hasSelectedResult: true,
      hasSelectedTitle: true,
      hasDetails: true,
    };
    expect(currentTmdbDialogStep(input)).toBe("review");
    expect(completedTmdbDialogSteps(input)).toEqual([
      "search",
      "result",
      "catalogue",
    ]);
  });
});
