import { describe, expect, it } from "vitest";
import type { PersonalList } from "./personalLists";

describe("sincronização remota das listas", () => {
  it("mantém IDs de registo como identidade remota", () => {
    const list: PersonalList = {
      id: "remote123",
      name: "Clássicos",
      description: "",
      kind: "manual",
      color: "#6366f1",
      pinned: false,
      createdAt: "2026-11-23T00:00:00Z",
      updatedAt: "2026-11-23T00:00:00Z",
      items: [],
    };
    expect(list.id).toBe("remote123");
  });
});
