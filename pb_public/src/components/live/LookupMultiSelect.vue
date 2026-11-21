<!--
  Ficheiro: src/components/live/LookupMultiSelect.vue
  Tipo: Multisseleção Vue acessível.
  Função: Seleciona várias opções por clique normal, sem Ctrl.
-->
<script setup lang="ts">
import { computed,ref } from "vue";import type { NamedRecord } from "@/types/records";
const model=defineModel<string[]>({required:true});const props=withDefaults(defineProps<{id:string;label:string;options:NamedRecord[];max?:number}>(),{max:10});const query=ref("");const filtered=computed(()=>{const q=query.value.trim().toLocaleLowerCase("pt-PT");return props.options.filter(x=>!q||[x.nome,x.codigo,x.slug].some(v=>v?.toLocaleLowerCase("pt-PT").includes(q)))});const selected=computed(()=>model.value.map(id=>props.options.find(x=>x.id===id)).filter((x):x is NamedRecord=>Boolean(x)));function toggle(id:string){model.value=model.value.includes(id)?model.value.filter(x=>x!==id):model.value.length<props.max?[...model.value,id]:model.value}
</script>
<template>
  <fieldset class="multi"><legend>{{label}} (máx. {{max}})</legend><div v-if="selected.length" class="chips"><button v-for="item in selected" :key="item.id" type="button" class="chip" :aria-label="`Remover ${item.nome}`" @click="toggle(item.id)">{{item.nome}} ×</button></div><label class="sr-only" :for="`${id}-search`">Pesquisar {{label}}</label><input :id="`${id}-search`" v-model.trim="query" type="search" :placeholder="`Pesquisar ${label.toLocaleLowerCase('pt-PT')}`"/><div class="meta"><small aria-live="polite">{{model.length}} de {{max}} selecionados</small><button type="button" class="clear" :disabled="!model.length" @click="model=[]">Limpar</button></div><div class="options" role="group" :aria-label="label"><label v-for="item in filtered" :key="item.id" class="option"><input type="checkbox" :checked="model.includes(item.id)" :disabled="!model.includes(item.id)&&model.length>=max" @change="toggle(item.id)"/><span>{{item.nome}}</span><small v-if="item.codigo">{{item.codigo}}</small></label><p v-if="!filtered.length" class="empty">Sem resultados.</p></div>
  </fieldset>
</template>
<style scoped>
.multi{min-width:0;padding:.85rem;border:1px solid var(--line);border-radius:1rem}.multi legend{padding:0 .35rem;font-weight:700}.chips{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.55rem}.chip{padding:.3rem .55rem;border:1px solid var(--line);border-radius:999px;color:inherit;background:var(--surface-2);cursor:pointer}.meta{display:flex;align-items:center;justify-content:space-between;margin:.45rem 0}.clear{padding:.2rem .4rem;border:0;color:var(--muted);background:transparent;text-decoration:underline;cursor:pointer}.options{display:grid;max-height:14rem;overflow:auto;border:1px solid var(--line);border-radius:.7rem}.option{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:.55rem;align-items:center;padding:.52rem .65rem;border-bottom:1px solid var(--line);cursor:pointer}.option:last-child{border:0}.option:has(input:checked){background:color-mix(in srgb,var(--primary),transparent 86%)}.option small,.empty{color:var(--muted)}
</style>
