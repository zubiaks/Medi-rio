/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import{availabilityRepository}from"@/domain/repositories";import type{AvailabilityRecord}from"@/types/records";import type{VodFormData}from"./models";import{duplicateFilter,sameProvider}from"./duplicate";
export async function findVodDuplicate(form:VodFormData,currentId=""):Promise<AvailabilityRecord|null>{const result=await availabilityRepository.list({perPage:100,filter:duplicateFilter(form,currentId)});return sameProvider(result.items,form)||null}
