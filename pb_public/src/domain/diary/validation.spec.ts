import { describe, expect, it } from "vitest";
import {
  calculatePercentage,
  createDiaryEntryForm,
  createReviewForm,
  validateDiaryEntry,
  validateReview,
} from "./validation";

describe("validação do Diário", () => {
  it("limita a percentagem entre 0 e 100", () => {
    expect(calculatePercentage(120, 100, false)).toBe(100);
    expect(calculatePercentage(20, 100, false)).toBe(20);
  });

  it("recusa uma conclusão anterior ao início", () => {
    const form = createDiaryEntryForm();
    form.titulo = "t1";
    form.iniciado_em = "2026-11-22T20:00";
    form.terminado_em = "2026-11-22T19:00";
    expect(validateDiaryEntry(form).terminado_em).toBeTruthy();
  });
});

describe("validação das avaliações", () => {
  it("limita a classificação a 10", () => {
    const form = createReviewForm();
    form.titulo = "t1";
    form.rating = 11;
    expect(validateReview(form).rating).toBeTruthy();
  });

  it("exige texto antes de publicar", () => {
    const form = createReviewForm();
    form.titulo = "t1";
    form.estado_publicacao = "Publicado";
    expect(validateReview(form).texto).toBeTruthy();
  });
});
