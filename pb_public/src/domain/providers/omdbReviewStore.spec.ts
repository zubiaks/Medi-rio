import { beforeEach, describe, expect, it } from "vitest";
import {
  clearOmdbPreparedReview,
  loadOmdbPreparedReview,
  saveOmdbPreparedReview,
} from "./omdbReviewStore";

describe("revisão OMDb preparada", () => {
  beforeEach(() => sessionStorage.clear());

  it("guarda e limpa uma revisão transitória", () => {
    saveOmdbPreparedReview({
      titleId: "t1",
      titleName: "Alien",
      jobId: "j1",
      details: { imdb_id: "tt0078748" } as any,
    });
    expect(loadOmdbPreparedReview()).toMatchObject({
      titleId: "t1",
      jobId: "j1",
    });
    clearOmdbPreparedReview();
    expect(loadOmdbPreparedReview()).toBeNull();
  });
});
