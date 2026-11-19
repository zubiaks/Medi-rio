<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import type { TitleRecord } from "@/types/records";
import { titleRepository } from "@/domain/repositories";

const route = useRoute(); const router = useRouter();
const items = ref<TitleRecord[]>([]); const total = ref(0); const loading = ref(false); const query = ref(String(route.query.pesquisa || ""));
const safeQuery = computed(() => query.value.replaceAll('"', '\\"'));
async function load() { loading.value = true; try { const filter = `apagado=false${safeQuery.value ? ` && titulo~"${safeQuery.value}"` : ""}`; const page = await titleRepository.list({ perPage: 36, filter, sort: "-updated" }); items.value = page.items; total.value = page.totalItems; } finally { loading.value = false; } }
function search() { router.replace({ name: "catalog", query: query.value ? { pesquisa: query.value } : {} }); }
watch(() => route.query.pesquisa, () => { query.value = String(route.query.pesquisa || ""); load(); });
onMounted(load);
</script>

<template><BasePageHeader eyebrow="Biblioteca digital" title="Catálogo" :description="`${total} títulos encontrados`"><template #actions><RouterLink class="button button-primary" to="/catalogo/novo">＋ Novo título</RouterLink></template></BasePageHeader><form class="filter-bar" @submit.prevent="search"><input v-model="query" placeholder="Pesquisar no catálogo…"><button class="button button-secondary">Pesquisar</button></form><section v-if="loading" class="page-loading"><span class="loader"/></section><div v-else-if="items.length" class="media-grid"><RouterLink v-for="item in items" :key="item.id" class="media-card" :to="`/catalogo/${item.id}`"><div class="poster-placeholder">▶</div><div class="media-info"><span>{{ item.ano || 'Ano desconhecido' }}</span><strong>{{ item.titulo }}</strong><small>{{ item.tagline || 'Sem descrição' }}</small></div></RouterLink></div><BaseEmptyState v-else icon="◫" title="Nenhum título encontrado" description="Adiciona o primeiro conteúdo ao catálogo."/></template>
