/**
 * MediÃ¡rio
 * Copyright Â© 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
import { readonly, ref, type Ref } from "vue";

export function useAsyncState<T>(initialValue: T) {
  const data = ref<T>(initialValue) as Ref<T>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function execute(task: () => Promise<T>): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      data.value = await task();
      return data.value;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error(String(cause));
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    execute,
  };
}
