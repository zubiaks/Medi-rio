<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}>(), {
  variant: "primary",
  type: "button",
  disabled: false,
});
</script>

<template>
  <button class="button" :class="`button-${variant}`" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>
