/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */

import { availabilityRepository } from "@/domain/repositories";
import type { AvailabilityRecord } from "@/types/records";
import type { VodFormData } from "./models";
import {
  duplicateCandidateFilter,
  findMatchingDuplicate,
} from "./duplicate";

export async function findVodDuplicate(
  form: VodFormData,
  currentId = "",
): Promise<AvailabilityRecord | null> {
  if (!form.tituloId || !form.providerNome.trim() || !form.tipo) {
    return null;
  }

  const result = await availabilityRepository.list({
    page: 1,
    perPage: 200,
    filter: duplicateCandidateFilter(form, currentId),
  });

  return findMatchingDuplicate(result.items, form);
}
