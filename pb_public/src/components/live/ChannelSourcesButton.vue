<!--
  Ficheiro: src/components/live/ChannelSourcesButton.vue
  Tipo: Componente Vue autónomo.
  Função: Botão visível para abrir a gestão de streams alternativos.
-->
<script setup lang="ts">
import { ref } from "vue";import type { ChannelRecord } from "@/types/records";import ChannelSourcesDialog from "./ChannelSourcesDialog.vue";
const props=defineProps<{channel:ChannelRecord}>();const emit=defineEmits<{channelChanged:[ChannelRecord]}>();const open=ref(false);
</script>
<template><button class="button button-secondary" type="button" @click="open=true">Gerir streams alternativos</button><ChannelSourcesDialog :channel="props.channel" :open="open" @close="open=false" @channel-changed="emit('channelChanged',$event)"/></template>
