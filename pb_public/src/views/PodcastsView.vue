<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import type { StreamRecord } from "@/types/records";
import { streamRepository } from "@/domain/repositories";
const items = ref<StreamRecord[]>([]);
onMounted(async () => { const page = await streamRepository.list({ perPage: 50, filter: 'tipo="podcast" && cemiterio=false', sort: "ordem,nome" }).catch(() => null); if (page) items.value = page.items; });
</script>
<template><BasePageHeader eyebrow="Áudio" title="Podcasts" description="Feeds RSS, episódios, imagens, reprodução e progresso."><template #actions><button class="button button-primary">＋ Adicionar feed</button></template></BasePageHeader><div v-if="items.length" class="podcast-grid"><article v-for="item in items" :key="item.id" class="podcast-card"><div class="podcast-art"><img v-if="item.logo_url" :src="item.logo_url" alt=""><span v-else>◉</span></div><div><span>Podcast</span><h3>{{ item.nome }}</h3><p>{{ item.rss_url || 'Feed RSS' }}</p></div></article></div><BaseEmptyState v-else icon="◉" title="Sem podcasts" description="Adiciona um feed RSS para começar."/></template>
