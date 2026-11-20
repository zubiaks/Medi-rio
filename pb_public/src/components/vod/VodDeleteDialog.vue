<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    provider: string;
    title: string;
    deleting?: boolean;
  }>(),
  {
    deleting: false,
  },
);

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const confirmation = ref("");
const input = ref<HTMLInputElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const canConfirm = computed(
  () => confirmation.value === props.provider && !props.deleting,
);

function requestClose(): void {
  if (props.deleting) return;
  emit("close");
}

function confirm(): void {
  if (!canConfirm.value) return;
  emit("confirm");
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return;

  if (event.key === "Escape") {
    event.preventDefault();
    requestClose();
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      confirmation.value = "";
      document.addEventListener("keydown", onKeydown);
      await nextTick();
      input.value?.focus();
      return;
    }

    document.removeEventListener("keydown", onKeydown);
    confirmation.value = "";
    previouslyFocused?.focus();
    previouslyFocused = null;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open"
      class="dialog-backdrop"
      @click.self="requestClose"
    >
      <section
        class="dialog-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="vod-delete-title"
        aria-describedby="vod-delete-description"
      >
        <h2 id="vod-delete-title">Eliminar disponibilidade</h2>

        <p id="vod-delete-description">
          Esta ação elimina definitivamente a oferta de
          <strong>{{ props.provider }}</strong>
          para
          <strong>{{ props.title }}</strong>.
          Não será possível restaurá-la.
        </p>

        <label class="form-field" for="vod-delete-confirmation">
          <span>
            Para confirmar, escreve exatamente:
            <strong>{{ props.provider }}</strong>
          </span>
          <input
            id="vod-delete-confirmation"
            ref="input"
            v-model="confirmation"
            name="vod_delete_confirmation"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :disabled="props.deleting"
            @keydown.enter.prevent="confirm"
          />
        </label>

        <div class="form-actions">
          <button
            class="button button-secondary"
            type="button"
            :disabled="props.deleting"
            @click="requestClose"
          >
            Cancelar
          </button>
          <button
            class="button button-danger"
            type="button"
            :disabled="!canConfirm"
            @click="confirm"
          >
            {{ props.deleting ? "A eliminar…" : "Eliminar definitivamente" }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
