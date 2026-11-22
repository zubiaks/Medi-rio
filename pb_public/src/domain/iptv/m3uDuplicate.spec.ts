import { describe, expect, it } from "vitest";
import { findInternalM3uDuplicates, findM3uDuplicate } from "./m3uDuplicate";
import type { M3uItem } from "./m3u";

const item = (name: string, url: string, tvgId = ""): M3uItem => ({
  name, url, tvgId, tvgName: name, tvgLogo: "", groupTitle: "",
  language: "", country: "", adult: false, selected: true, errors: [],
});

describe("m3uDuplicate", () => {
  it("deteta TVG-ID existente", () => {
    const result = findM3uDuplicate(item("Novo", "https://x/novo", "rtp1"), [
      { id: "1", created: "", updated: "", nome: "RTP 1", url_stream: "https://x/1", tvg_id: "rtp1" },
    ] as any);
    expect(result.kind).toBe("tvg_id");
  });

  it("deteta URL e TVG-ID repetidos dentro da playlist", () => {
    const result = findInternalM3uDuplicates([
      item("A", "https://x/a", "a"),
      item("A duplicado", "https://x/a", "b"),
      item("B", "https://x/b", "a"),
      item("C", "https://x/c", "c"),
    ]);
    expect([...result]).toEqual([1, 2]);
  });
});
