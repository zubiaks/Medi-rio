<script setup lang="ts">
withDefaults(defineProps<{ eyebrow?: string; title: string; description?: string }>(), { eyebrow: "Media Vault", description: "" });
</script>

<template>
  <header class="page-header">
    <div><p class="eyebrow">{{ eyebrow }}</p><h1>{{ title }}</h1><p v-if="description">{{ description }}</p></div>
    <div v-if="$slots.actions" class="page-actions"><slot name="actions" /></div>
  </header>
</template>
