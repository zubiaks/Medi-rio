<!--
  Ficheiro: src/components/base/BasePagination.vue
  Tipo: Componente Vue reutilizável.
  Função: Paginação acessível com números, reticências e salto direto.
-->
<script setup lang="ts">
import { computed,ref,watch } from "vue";
const props=defineProps<{page:number;pages:number;label?:string}>();const emit=defineEmits<{change:[number]}>();const jump=ref(props.page);watch(()=>props.page,v=>jump.value=v);const visible=computed(()=>{const s=new Set([1,Math.max(1,props.pages)]);for(let i=props.page-2;i<=props.page+2;i++)if(i>=1&&i<=props.pages)s.add(i);return[...s].sort((a,b)=>a-b)});function go(p:number){const v=Math.min(Math.max(1,Math.trunc(p)),Math.max(1,props.pages));if(v!==props.page)emit("change",v)};
</script>
<template><nav v-if="pages>1" class="base-pagination" :aria-label="label||'Paginação'"><div class="base-pagination-main"><button class="button button-secondary" type="button" :disabled="page<=1" @click="go(page-1)">← Anterior</button><div class="base-page-numbers"><template v-for="(value,index) in visible" :key="value"><span v-if="index&&value-visible[index-1]>1" aria-hidden="true">…</span><button class="base-page-button" :class="{'is-current':value===page}" type="button" :aria-current="value===page?'page':undefined" :aria-label="`Ir para a página ${value}`" @click="go(value)">{{value}}</button></template></div><button class="button button-secondary" type="button" :disabled="page>=pages" @click="go(page+1)">Seguinte →</button></div><form class="base-page-jump" @submit.prevent="go(Number(jump))"><label>Ir para <input v-model.number="jump" type="number" min="1" :max="pages" inputmode="numeric" /></label><span>de {{pages}}</span><button class="button button-secondary" type="submit">Ir</button></form></nav></template>
