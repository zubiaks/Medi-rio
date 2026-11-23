/** Mediário | Estado transitório da revisão OMDb preparada em Manutenção. */
import type { OmdbDetails } from "./omdbClient";

export interface OmdbPreparedReview {
  titleId: string;
  titleName: string;
  details: OmdbDetails;
  jobId: string;
}

const KEY = "mediario-omdb-prepared-review";

export function saveOmdbPreparedReview(value: OmdbPreparedReview): void {
  sessionStorage.setItem(KEY, JSON.stringify(value));
}

export function loadOmdbPreparedReview(): OmdbPreparedReview | null {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "null") as OmdbPreparedReview | null;
  } catch {
    return null;
  }
}

export function clearOmdbPreparedReview(): void {
  sessionStorage.removeItem(KEY);
}
