/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import type { RecordModel } from "pocketbase";
import { createEmptyTitleForm, type TitleFormData } from "./models";
import { applyTitleImages } from "./images";

type TitleSource = RecordModel & Record<string, unknown>;

const textFields = [
  ["titulo_original", "tituloOriginal"],
  ["classificacao_etaria", "classificacaoEtaria"],
  ["sinopse", "sinopse"],
  ["tagline", "tagline"],
  ["notas_pessoais", "notasPessoais"],
  ["tipo_tmdb", "tipoTmdb"],
  ["imdb_id", "imdbId"],
] as const;

const relationFields = [
  ["categoria_fonte", "categoriaFonteIds"],
  ["pais_origem", "paisIds"],
  ["idiomas", "idiomaIds"],
  ["generos", "generoIds"],
  ["tags", "tagIds"],
  ["plataformas", "plataformaIds"],
  ["companhias", "companhiaIds"],
] as const;

const numberFields = [
  ["ano", "ano"],
  ["duracao_min", "duracaoMin"],
  ["paginas", "paginas"],
  ["horas_jogadas", "horasJogadas"],
  ["rating", "rating"],
] as const;

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function relationList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" && value ? [value] : [];
}

/**
 * Converte datas PocketBase, por exemplo
 * "2026-11-20 00:00:00.000Z", no formato exigido por input[type=date].
 */
function dateInputValue(value: unknown): string {
  const raw = stringValue(value).trim();
  if (!raw) return "";

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? "";
}

function cleanText(value: string): string {
  return value.trim();
}

export function mapTitleRecordToForm(record: TitleSource): TitleFormData {
  const form = createEmptyTitleForm();

  form.titulo = stringValue(record.titulo);
  form.midiaId = stringValue(record.midia);
  form.tipoId = stringValue(record.tipo);
  form.estadoId = stringValue(record.estado);
  form.dataLancamento = dateInputValue(record.data_lancamento);
  form.posterUrl = stringValue(record.poster_url);
  form.backdropUrl = stringValue(record.backdrop_url);
  form.logoUrl = stringValue(record.logo_url);
  form.adulto = record.adulto === true;
  form.canonico = record.canonico === true;

  for (const [recordKey, formKey] of textFields) {
    const value = stringValue(record[recordKey]);

    if (formKey === "tipoTmdb") {
      form.tipoTmdb = value === "movie" || value === "tv" ? value : "";
    } else {
      form[formKey] = value;
    }
  }

  for (const [recordKey, formKey] of relationFields) {
    form[formKey] = relationList(record[recordKey]);
  }

  for (const [recordKey, formKey] of numberFields) {
    form[formKey] = numberValue(record[recordKey]);
  }

  const tmdbId = numberValue(record.tmdb_id);
  form.tmdbId = tmdbId !== null && tmdbId > 0 ? tmdbId : null;

  return form;
}

function basePayload(form: TitleFormData): Record<string, unknown> {
  return {
    titulo: cleanText(form.titulo),
    midia: form.midiaId,
    data_lancamento: form.dataLancamento || "",
    adulto: form.adulto,
    canonico: form.canonico,
  };
}

export function mapTitleFormToCreatePayload(form: TitleFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...basePayload(form),
    apagado: false,
  };

  for (const [recordKey, formKey] of textFields) {
    const value = cleanText(String(form[formKey] ?? ""));
    if (value) payload[recordKey] = value;
  }

  if (form.tipoId) payload.tipo = form.tipoId;
  if (form.estadoId) payload.estado = form.estadoId;

  for (const [recordKey, formKey] of relationFields) {
    if (form[formKey].length) payload[recordKey] = [...form[formKey]];
  }

  for (const [recordKey, formKey] of numberFields) {
    if (form[formKey] !== null) payload[recordKey] = form[formKey];
  }

  if (form.tmdbId !== null && form.tmdbId > 0) {
    payload.tmdb_id = form.tmdbId;
  }

  return applyTitleImages(payload, form, "create");
}

export function mapTitleFormToUpdatePayload(form: TitleFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...basePayload(form),
    tipo: form.tipoId,
    estado: form.estadoId,
  };

  for (const [recordKey, formKey] of textFields) {
    payload[recordKey] = cleanText(String(form[formKey] ?? ""));
  }

  for (const [recordKey, formKey] of relationFields) {
    payload[recordKey] = [...form[formKey]];
  }

  for (const [recordKey, formKey] of numberFields) {
    payload[recordKey] = form[formKey];
  }

  payload.tmdb_id =
    form.tmdbId !== null && form.tmdbId > 0 ? form.tmdbId : null;

  return applyTitleImages(payload, form, "update");
}

export const mapTitleFormToPocketBase = mapTitleFormToCreatePayload;
