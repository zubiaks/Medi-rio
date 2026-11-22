import { describe, expect, it } from "vitest";
import { createLibraryCopyForm, validateLibraryCopyForm } from "./validation";
describe("library validation", () => {
  it("exige apenas o título no formulário mínimo", () => {
    const errors = validateLibraryCopyForm(createLibraryCopyForm());
    expect(errors.titulo).toBeTruthy();
    expect(errors.formato).toBeUndefined();
  });
  it("exige pessoa quando emprestado", () => {
    const value = createLibraryCopyForm({ titulo: "t", emprestado: true });
    expect(validateLibraryCopyForm(value).emprestado_a).toBeTruthy();
  });
  it("valida a ordem das datas", () => {
    const value = createLibraryCopyForm({ titulo: "t", emprestado: true, emprestado_a: "p", data_emprestimo: "2026-11-22", data_prevista: "2026-11-21" });
    expect(validateLibraryCopyForm(value).data_prevista).toBeTruthy();
  });
});
