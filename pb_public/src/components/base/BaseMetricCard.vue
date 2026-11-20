<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  icon: string;
  label: string;
  value: string | number;
  detail: string;
  tone?: "violet" | "cyan" | "pink" | "amber";
}>(), { tone: "violet" });
</script>

<template>
  <article class="stat-card">
    <span class="stat-icon" :class="tone">{{ icon }}</span>
    <div><small>{{ label }}</small><strong>{{ value }}</strong><span>{{ detail }}</span></div>
  </article>
</template>
