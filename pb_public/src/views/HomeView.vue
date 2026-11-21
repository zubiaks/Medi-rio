<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseMetricCard from "@/components/base/BaseMetricCard.vue";
import { channelRepository, exemplarRepository, streamRepository, titleRepository } from "@/domain/repositories";

const stats = ref({ titles: 0, podcasts: 0, channels: 0, copies: 0 });
onMounted(async () => {
  const [titles, podcasts, channels, copies] = await Promise.allSettled([
    titleRepository.count("apagado=false"), streamRepository.count('tipo="podcast" && cemiterio=false'), channelRepository.count("cemiterio=false"), exemplarRepository.count(),
  ]);
  stats.value = { titles: titles.status === "fulfilled" ? titles.value : 0, podcasts: podcasts.status === "fulfilled" ? podcasts.value : 0, channels: channels.status === "fulfilled" ? channels.value : 0, copies: copies.status === "fulfilled" ? copies.value : 0 };
});
</script>

<template>
  <section class="hero"><div class="hero-content"><p class="eyebrow">A tua coleção, com contexto</p><h1>Tudo o que vês, lês, jogas e ouves, num só lugar.</h1><p class="hero-copy">Nova arquitetura Vue 3 e TypeScript, ligada à base PocketBase atual.</p><div class="hero-actions"><RouterLink class="button button-primary large" to="/catalogo/novo">Adicionar conteúdo</RouterLink><RouterLink class="button button-secondary large" to="/catalogo">Abrir catálogo</RouterLink></div></div><div class="hero-visual"><div class="orb orb-one"/><div class="orb orb-two"/><article class="floating-card floating-main"><span class="card-kicker">Nova arquitetura</span><strong>Vue 3 + TypeScript</strong><div class="progress"><span style="width:42%"/></div><small>migração progressiva</small></article></div></section>
  <section class="section"><div class="section-heading"><div><p class="eyebrow">Estado da coleção</p><h2>Visão geral</h2></div></div><div class="stats-grid"><BaseMetricCard icon="◫" label="Títulos" :value="stats.titles" detail="no catálogo"/><BaseMetricCard icon="◉" label="Podcasts" :value="stats.podcasts" detail="feeds ativos" tone="pink"/><BaseMetricCard icon="▣" label="IPTV" :value="stats.channels" detail="canais configurados" tone="cyan"/><BaseMetricCard icon="▤" label="Exemplares" :value="stats.copies" detail="na biblioteca" tone="amber"/></div></section>
</template>

