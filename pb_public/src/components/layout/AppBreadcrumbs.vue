<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { routeBreadcrumbs } from "@/domain/navigation/breadcrumbs";
const route = useRoute();
const items = computed(() => routeBreadcrumbs(route));
</script>
<template>
  <nav v-if="items.length" class="app-breadcrumbs" aria-label="Navegação estrutural">
    <ol><li v-for="item in items" :key="`${item.label}-${item.to || ''}`"><RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink><span v-else aria-current="page">{{ item.label }}</span></li></ol>
  </nav>
</template>
