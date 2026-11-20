/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */

import type { AvailabilityRecord } from "@/types/records";
import type { VodFormData } from "./models";

function escapePocketBase(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function normalizeText(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
}

/**
 * O filtro do servidor procura apenas candidatos do mesmo título e modalidade.
 * Provider e país são comparados no cliente para tratar corretamente relações
 * vazias, que o PocketBase pode devolver como "", null ou campo ausente.
 */
export function duplicateCandidateFilter(
  form: VodFormData,
  currentId = "",
): string {
  const filters = [
    `titulo = "${escapePocketBase(form.tituloId)}"`,
    `tipo = "${escapePocketBase(form.tipo)}"`,
  ];

  if (currentId) {
    filters.push(`id != "${escapePocketBase(currentId)}"`);
  }

  return filters.join(" && ");
}

export function findMatchingDuplicate(
  items: AvailabilityRecord[],
  form: VodFormData,
): AvailabilityRecord | null {
  const expectedProvider = normalizeText(form.providerNome);
  const expectedCountry = form.paisId || "";

  return (
    items.find((item) => {
      const sameProvider =
        normalizeText(item.provider_nome) === expectedProvider;
      const sameCountry = (item.pais || "") === expectedCountry;

      return sameProvider && sameCountry;
    }) ?? null
  );
}
