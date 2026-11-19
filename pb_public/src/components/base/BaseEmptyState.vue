<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title: string; description: string }>(), { icon: "◇" });
</script>

<template>
  <div class="empty-state">
    <span>{{ icon }}</span><strong>{{ title }}</strong><p>{{ description }}</p><slot />
  </div>
</template>
