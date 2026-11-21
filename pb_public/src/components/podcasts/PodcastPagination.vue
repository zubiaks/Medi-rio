<!-- Mediario - Copyright (c) 2026 Zubiaks. See LICENSE.md. -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  page: number;
  pages: number;
  label?: string;
}>();

const emit = defineEmits<{
  change: [page: number];
}>();

const jumpPage = ref(props.page);

watch(
  () => props.page,
  (value) => {
    jumpPage.value = value;
  },
);

const visiblePages = computed(() => {
  const total = Math.max(1, props.pages);
  const current = Math.min(Math.max(1, props.page), total);
  const values = new Set<number>([1, total]);

  for (let value = current - 2; value <= current + 2; value += 1) {
    if (value >= 1 && value <= total) values.add(value);
  }

  return [...values].sort((a, b) => a - b);
});

function go(page: number): void {
  const target = Math.min(Math.max(1, Math.trunc(page)), Math.max(1, props.pages));
  if (target !== props.page) emit("change", target);
}

function submitJump(): void {
  const value = Number(jumpPage.value);
  if (!Number.isFinite(value)) {
    jumpPage.value = props.page;
    return;
  }
  go(value);
}
</script>

<template>
  <nav
    v-if="pages > 1"
    class="podcast-pagination"
    :aria-label="label || 'Paginação'"
  >
    <div class="podcast-pagination-main">
      <button
        class="button button-secondary"
        type="button"
        :disabled="page <= 1"
        @click="go(page - 1)"
      >
        ← Anterior
      </button>

      <div class="podcast-page-numbers" aria-label="Páginas disponíveis">
        <template v-for="(value, index) in visiblePages" :key="value">
          <span
            v-if="index > 0 && value - visiblePages[index - 1] > 1"
            class="podcast-page-gap"
            aria-hidden="true"
          >
            …
          </span>

          <button
            class="podcast-page-button"
            :class="{ 'is-current': value === page }"
            type="button"
            :aria-label="`Ir para a página ${value}`"
            :aria-current="value === page ? 'page' : undefined"
            @click="go(value)"
          >
            {{ value }}
          </button>
        </template>
      </div>

      <button
        class="button button-secondary"
        type="button"
        :disabled="page >= pages"
        @click="go(page + 1)"
      >
        Seguinte →
      </button>
    </div>

    <form class="podcast-page-jump" @submit.prevent="submitJump">
      <label :for="`page-jump-${label || 'items'}`">
        Ir para
      </label>
      <input
        :id="`page-jump-${label || 'items'}`"
        v-model.number="jumpPage"
        type="number"
        min="1"
        :max="pages"
        inputmode="numeric"
        aria-label="Número da página"
      />
      <span>de {{ pages }}</span>
      <button class="button button-secondary" type="submit">
        Ir
      </button>
    </form>
  </nav>
</template>
