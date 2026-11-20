<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title: string; description: string }>(), { icon: "◇" });
</script>

<template>
  <div class="empty-state">
    <span>{{ icon }}</span><strong>{{ title }}</strong><p>{{ description }}</p><slot />
  </div>
</template>
