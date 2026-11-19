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
