/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import type {
  TitleFormData,
  TitleValidationErrors,
} from "./models";
import { isSafeImageUrl } from "./images";

const MIB = 1024 * 1024;
const imageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const logoTypes = ["image/png", "image/webp", "image/avif"];

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function fileError(
  file: File | null,
  maxBytes: number,
  allowedTypes: string[],
  label: string,
): string | undefined {
  if (!file) return undefined;

  if (!allowedTypes.includes(file.type)) {
    return `${label}: formato não permitido.`;
  }

  if (file.size > maxBytes) {
    return `${label}: excede ${Math.round(maxBytes / MIB)} MiB.`;
  }

  return undefined;
}

export function validateTitleForm(
  form: TitleFormData,
): TitleValidationErrors {
  const errors: TitleValidationErrors = {};

  const year = optionalNumber(form.ano);
  const rating = optionalNumber(form.rating);
  const tmdbId = optionalNumber(form.tmdbId);

  if (!form.titulo.trim()) {
    errors.titulo = "O título é obrigatório.";
  }

  if (!form.midiaId) {
    errors.midiaId = "Seleciona uma mídia.";
  }

  if (
    year !== null &&
    (!Number.isInteger(year) || year < 1800 || year > 2100)
  ) {
    errors.ano = "Indica um ano entre 1800 e 2100.";
  }

  if (rating !== null && (rating < 0 || rating > 10)) {
    errors.rating = "A avaliação deve ficar entre 0 e 10.";
  }

  if (
    tmdbId !== null &&
    (!Number.isInteger(tmdbId) || tmdbId < 1)
  ) {
    errors.tmdbId = "O ID TMDB deve ser um número inteiro positivo.";
  }

  if (form.imdbId.trim() && !/^tt[0-9]+$/.test(form.imdbId.trim())) {
    errors.imdbId = "Usa o formato tt1234567.";
  }

  const posterError = fileError(
    form.posterFile,
    5 * MIB,
    imageTypes,
    "Poster",
  );
  if (posterError) errors.posterFile = posterError;

  const backdropError = fileError(
    form.backdropFile,
    5 * MIB,
    imageTypes,
    "Backdrop",
  );
  if (backdropError) errors.backdropFile = backdropError;

  const logoError = fileError(
    form.logoFile,
    2 * MIB,
    logoTypes,
    "Logo",
  );
  if (logoError) errors.logoFile = logoError;

  if (!isSafeImageUrl(form.posterUrl)) {
    errors.posterUrl = "Usa uma URL HTTP ou HTTPS válida.";
  }

  if (!isSafeImageUrl(form.backdropUrl)) {
    errors.backdropUrl = "Usa uma URL HTTP ou HTTPS válida.";
  }

  if (!isSafeImageUrl(form.logoUrl)) {
    errors.logoUrl = "Usa uma URL HTTP ou HTTPS válida.";
  }

  return errors;
}
