import { describe, expect, it } from "vitest";
import { sanitizeAuditDetails } from "./audit";

describe("auditoria segura", () => {
  it("oculta chaves e tokens em estruturas aninhadas", () => {
    const result = sanitizeAuditDetails({
      api_key: "segredo",
      nested: { token: "outro-segredo", total: 3 },
    });
    expect(result).toEqual({
      api_key: "[ocultado]",
      nested: { token: "[ocultado]", total: 3 },
    });
  });
});
