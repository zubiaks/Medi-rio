<!--
  Ficheiro: src/components/iptv/StreamSourcesSummary.vue
  Tipo: Componente Vue.
  Função: Explica o stream principal e abre a gestão das alternativas.
-->
<script setup lang="ts">
import type { ChannelRecord,StreamLinkRecord } from "@/types/records";
defineProps<{channel:ChannelRecord;links:StreamLinkRecord[];loading?:boolean}>();const emit=defineEmits<{manage:[]}>();
</script>
<template><section class="source-summary" aria-labelledby="source-summary-title"><div><p class="eyebrow">Reprodução</p><h3 id="source-summary-title">Stream principal e alternativas</h3></div><div class="source-main"><strong>Principal</strong><code>{{channel.url_stream}}</code></div><div class="source-summary-footer"><p><strong>{{loading?'…':links.length}}</strong> {{links.length===1?'fonte alternativa configurada':'fontes alternativas configuradas'}}</p><button class="button button-secondary" type="button" @click="emit('manage')">Gerir fontes alternativas</button></div></section></template>
