<!--
  Ficheiro: src/components/iptv/ChannelCard.vue
  Tipo: Componente Vue.
  Função: Mostra um canal nas vistas Grelha, Logos, Lista ou Compacta.
-->
<script setup lang="ts">
import { computed } from "vue";import { pb } from "@/infrastructure/pocketbase/client";import type { ChannelRecord } from "@/types/records";import { qualityLabel } from "@/domain/iptv/format";
const props=defineProps<{channel:ChannelRecord;view:"grid"|"logos"|"list"|"compact"}>();const emit=defineEmits<{open:[ChannelRecord];edit:[ChannelRecord]}>();const logo=computed(()=>props.channel.logo?pb.files.getURL(props.channel,props.channel.logo,{thumb:"256x256"}):props.channel.tvg_logo_url||"");const initials=computed(()=>props.channel.nome.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toLocaleUpperCase("pt-PT")).join("")||"TV");const hue=computed(()=>[...props.channel.nome].reduce((n,c)=>n+c.charCodeAt(0),0)%360);
</script>
<template>
  <button v-if="view==='logos'" class="logo-only-card" type="button" :aria-label="`Abrir ${channel.nome}`" :title="channel.nome" @click="emit('open',channel)">
    <span class="logo-only-image" :style="{'--logo-hue':hue}"><img v-if="logo" :src="logo" alt="" loading="lazy"/><span v-else class="generic-logo" aria-hidden="true">{{initials}}</span></span>
    <span class="logo-only-name">{{channel.nome}}</span><span class="logo-only-meta">{{channel.expand?.pais?.nome||qualityLabel(channel.qualidade)}}</span>
  </button>
  <article v-else class="live-card" :class="`is-${view}`"><div class="live-logo" :style="{'--logo-hue':hue}"><img v-if="logo" :src="logo" :alt="`Logótipo de ${channel.nome}`" loading="lazy"/><span v-else class="generic-logo" aria-hidden="true">{{initials}}</span></div><div class="live-card-body"><div class="live-card-title"><div><p class="eyebrow">{{channel.expand?.categoria?.nome||qualityLabel(channel.qualidade)}}</p><h3>{{channel.nome}}</h3></div><span v-if="channel.favorito" class="live-favorite" aria-label="Favorito">★</span></div><p class="live-meta"><span>{{channel.expand?.pais?.nome||"País desconhecido"}}</span><span>{{channel.ativo===false?"Inativo":"Ativo"}}</span><span>{{qualityLabel(channel.qualidade)}}</span></p><div class="live-actions"><button class="button button-primary" type="button" @click="emit('open',channel)">Abrir canal</button><button class="button button-secondary" type="button" @click="emit('edit',channel)">Editar</button></div></div></article>
</template>
<style scoped>
.logo-only-card{display:grid;grid-template-rows:minmax(90px,1fr) auto auto;gap:.55rem;min-width:0;min-height:150px;padding:.8rem;color:var(--text);text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:1rem;cursor:pointer;transition:transform .15s,border-color .15s}.logo-only-card:hover{border-color:var(--primary);transform:translateY(-2px)}.logo-only-card:focus-visible{outline:3px solid var(--primary);outline-offset:3px}.logo-only-image{display:grid;min-height:90px;place-items:center;overflow:hidden;border-radius:.8rem;background:var(--surface-2)}.logo-only-image img{display:block;width:100%;height:100%;max-height:120px;object-fit:contain;padding:.45rem}.generic-logo{display:grid;width:72px;height:72px;place-items:center;border-radius:22%;color:#fff;background:linear-gradient(135deg,hsl(var(--logo-hue) 62% 42%),hsl(calc(var(--logo-hue) + 45) 72% 54%));font-size:1.35rem;font-weight:900;letter-spacing:.06em;box-shadow:0 8px 22px rgba(0,0,0,.2)}.logo-only-name{overflow:hidden;font-weight:800;text-overflow:ellipsis;white-space:nowrap}.logo-only-meta{overflow:hidden;color:var(--muted);font-size:.72rem;text-overflow:ellipsis;white-space:nowrap}.live-logo .generic-logo{width:64px;height:64px}
</style>
