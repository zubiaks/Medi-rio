<!-- Mediário | Fase 9.2: comparação de até quatro títulos. -->
<script setup lang="ts">
import { computed } from "vue";
import type { GlobalSearchItem } from "@/domain/search/globalSearch";
import { compareSearchItems } from "@/domain/search/searchComparator";

const props = defineProps<{ items: GlobalSearchItem[] }>();
const emit = defineEmits<{ remove: [string]; clear: [] }>();
const titles = computed(() => props.items.slice(0, 4));
const rows = computed(() => compareSearchItems(titles.value));
</script>

<template>
  <section v-if="titles.length" class="search-comparison" aria-labelledby="search-comparison-title">
    <div class="global-search-summary"><div><p class="eyebrow">Comparação</p><h3 id="search-comparison-title">Comparar títulos</h3></div><button class="button button-secondary" type="button" @click="emit('clear')">Limpar</button></div>
    <p v-if="titles.length < 2">Adiciona pelo menos mais um título para comparar.</p>
    <div v-else class="comparison-table-wrap"><table><thead><tr><th>Campo</th><th v-for="item in titles" :key="item.id"><div>{{ item.title }}<button class="icon-button" type="button" :aria-label="`Remover ${item.title}`" @click="emit('remove', item.id)">×</button></div></th></tr></thead><tbody><tr v-for="row in rows" :key="row.label"><th>{{ row.label }}</th><td v-for="(value, index) in row.values" :key="`${row.label}-${titles[index]?.id}`">{{ value }}</td></tr></tbody></table></div>
  </section>
</template>
