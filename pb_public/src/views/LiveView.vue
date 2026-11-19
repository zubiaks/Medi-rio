<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseMetricCard from "@/components/base/BaseMetricCard.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import type { ChannelRecord } from "@/types/records";
import { channelRepository, streamRepository } from "@/domain/repositories";
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
const linkRepository = new PocketBaseRepository("stream_links");
const channels = ref<ChannelRecord[]>([]); const totals = ref({ channels: 0, streams: 0, links: 0 });
onMounted(async () => { const [page, streams, links] = await Promise.all([channelRepository.list({ perPage: 30, filter: "cemiterio=false", sort: "ordem,nome" }).catch(() => null), streamRepository.count("cemiterio=false").catch(() => 0), linkRepository.count("ativo=true").catch(() => 0)]); if (page) { channels.value = page.items; totals.value.channels = page.totalItems; } totals.value.streams = streams; totals.value.links = links; });
</script>
<template><BasePageHeader eyebrow="Em direto" title="TV e streams" description="IPTV, rádios, webcams, podcasts e links técnicos."><template #actions><button class="button button-primary">⇩ Importar M3U</button></template></BasePageHeader><section class="stats-grid compact-stats"><BaseMetricCard icon="▣" label="Canais TV" :value="totals.channels" detail="ativos e arquivo"/><BaseMetricCard icon="◉" label="Streams" :value="totals.streams" detail="rádio, webcam e podcast" tone="cyan"/><BaseMetricCard icon="⌁" label="Links" :value="totals.links" detail="alternativas técnicas" tone="pink"/><BaseMetricCard icon="✓" label="Último teste" value="—" detail="monitorização futura" tone="amber"/></section><div v-if="channels.length" class="channel-grid"><article v-for="item in channels" :key="item.id" class="channel-card"><div class="channel-logo">▣</div><div><span>{{ item.qualidade || 'TV' }}</span><h3>{{ item.nome }}</h3><small>{{ item.ativo ? 'Ativo' : 'Inativo' }}</small></div><button class="icon-button">▶</button></article></div><BaseEmptyState v-else icon="▣" title="Sem canais importados" description="Importa uma playlist M3U ou adiciona canais manualmente."/></template>
