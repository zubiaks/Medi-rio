<!--
  Ficheiro: src/components/live/StreamLinkList.vue
  Tipo: Componente Vue.
  Função: Lista links técnicos e destaca a fonte principal.
-->
<script setup lang="ts">
import type { ChannelRecord,StreamLinkRecord } from "@/types/records";import { formatTestDate,protocolLabel,qualityLabel,requiresBackend,streamStateLabel } from "@/domain/live/format";import { selectPrimaryLink } from "@/domain/live/selectPrimaryLink";import { computed } from "vue";
const props=defineProps<{channel:ChannelRecord;links:StreamLinkRecord[]}>();const selection=computed(()=>selectPrimaryLink(props.channel,props.links));
</script>
<template><div class="stream-link-list"><p v-if="!selection.selected" class="field-hint">Este canal não tem fontes disponíveis.</p><article v-for="link in links" :key="link.id" class="stream-link-row"><div><strong>{{link.rotulo||protocolLabel(link.tipo)}}</strong><small>{{qualityLabel(link.qualidade)}} · prioridade {{link.prioridade??1000}}</small></div><div><span class="detail-badge">{{streamStateLabel(link.ultimo_estado)}}</span><small>{{formatTestDate(link.ultimo_teste_em)}}</small></div><span v-if="requiresBackend(link)" class="field-warning">Requer backend</span><a class="button button-secondary" :href="link.url" target="_blank" rel="noopener noreferrer">Abrir URL</a></article></div></template>
