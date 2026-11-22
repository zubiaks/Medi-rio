import { describe, expect, it } from "vitest";
import { titleWasModified } from "./protectedSync";

describe("proteção de sincronização", () => {
  it("deteta alterações posteriores à pré-visualização", () => {
    expect(titleWasModified(
      { updated: "2026-11-22T10:00:00Z" } as any,
      { updated: "2026-11-22T10:01:00Z" } as any,
    )).toBe(true);
  });

  it("aceita o mesmo estado do título", () => {
    expect(titleWasModified(
      { updated: "2026-11-22T10:00:00Z" } as any,
      { updated: "2026-11-22T10:00:00Z" } as any,
    )).toBe(false);
  });
});
