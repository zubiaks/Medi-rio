import { describe, expect, it } from "vitest";
import {
  createExternalSourceForm,
  findExternalSourceDuplicate,
  validateExternalSource,
} from "./validation";

describe("fontes externas", () => {
  it("exige título, provider e identificador", () => {
    expect(validateExternalSource(createExternalSourceForm())).toMatchObject({
      titulo: expect.any(String),
      provider: expect.any(String),
      external_id: expect.any(String),
    });
  });

  it("detecta a chave única confirmada no PocketBase", () => {
    const form = createExternalSourceForm();
    Object.assign(form, {
      titulo: "t1",
      provider: "tmdb",
      external_id: "123",
      tipo_externo: "movie",
    });
    const duplicate = findExternalSourceDuplicate(
      form,
      [{ id: "f1", provider: "tmdb", external_id: "123", tipo_externo: "movie" }] as any,
    );
    expect(duplicate?.id).toBe("f1");
  });
});
