/** Mediário | Regras puras do fecho seguro do diálogo TMDB. */
export function shouldConfirmTmdbClose(
  saving: boolean,
  hasPendingReview: boolean,
): boolean {
  return !saving && hasPendingReview;
}

export function canCloseTmdbDialog(saving: boolean): boolean {
  return !saving;
}
