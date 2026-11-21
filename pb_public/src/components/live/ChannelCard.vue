<!--
  Ficheiro: src/components/live/ChannelCard.vue
  Tipo: Componente Vue.
  Função: Mostra um canal nas vistas Grelha, Lista ou Compacta.
-->
<script setup lang="ts">
import { pb } from "@/infrastructure/pocketbase/client";import type { ChannelRecord } from "@/types/records";import { qualityLabel } from "@/domain/live/format";
const props=defineProps<{channel:ChannelRecord;view:"grid"|"list"|"compact"}>();const emit=defineEmits<{open:[ChannelRecord];edit:[ChannelRecord]}>();function logo(){return props.channel.logo?pb.files.getURL(props.channel,props.channel.logo,{thumb:"256x256"}):props.channel.tvg_logo_url||""}
</script>
<template><article class="live-card" :class="`is-${view}`"><div class="live-logo"><img v-if="logo()" :src="logo()" :alt="`Logótipo de ${channel.nome}`" loading="lazy"/><span v-else aria-hidden="true">▣</span></div><div class="live-card-body"><div class="live-card-title"><div><p class="eyebrow">{{channel.expand?.categoria?.nome||qualityLabel(channel.qualidade)}}</p><h3>{{channel.nome}}</h3></div><span v-if="channel.favorito" class="live-favorite" aria-label="Favorito">★</span></div><p class="live-meta"><span>{{channel.expand?.pais?.nome||"País desconhecido"}}</span><span>{{channel.ativo===false?"Inativo":"Ativo"}}</span><span>{{qualityLabel(channel.qualidade)}}</span></p><div class="live-actions"><button class="button button-primary" type="button" @click="emit('open',channel)">Abrir canal</button><button class="button button-secondary" type="button" @click="emit('edit',channel)">Editar</button></div></div></article></template>
