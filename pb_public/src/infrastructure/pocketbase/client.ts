/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import PocketBase from "pocketbase";

const baseUrl = import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";

export const pb = new PocketBase(baseUrl);
pb.autoCancellation(false);

export const pocketBaseUrl = baseUrl;

export async function checkPocketBase(): Promise<boolean> {
  try {
    await pb.health.check();
    return true;
  } catch {
    return false;
  }
}
