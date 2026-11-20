<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import{computed,ref}from"vue";import type{LookupOption}from"@/types/lookups";
const model=defineModel<string[]>({required:true});const props=withDefaults(defineProps<{label:string;options:LookupOption[];name?:string}>(),{name:""});const query=ref("");const fieldName=computed(()=>props.name||`lookup-${props.label.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-")}`);const filtered=computed(()=>{const q=query.value.trim().toLocaleLowerCase("pt-PT");return q?props.options.filter(o=>o.label.toLocaleLowerCase("pt-PT").includes(q)):props.options});const selected=computed(()=>{const s=new Set(model.value);return props.options.filter(o=>s.has(o.id))});const has=(id:string)=>model.value.includes(id);function toggle(id:string){model.value=has(id)?model.value.filter(x=>x!==id):[...model.value,id]}function remove(id:string){model.value=model.value.filter(x=>x!==id)}
</script><template><fieldset class="lookup-multi-select"><legend>{{label}}</legend><div v-if="selected.length" class="lookup-selected"><button v-for="o in selected" :key="o.id" class="lookup-chip" type="button" @click="remove(o.id)">{{o.label}} ×</button><button class="lookup-clear" type="button" @click="model=[]">Limpar</button></div><label class="form-field"><span class="sr-only">Pesquisar em {{label}}</span><input v-model.trim="query" :name="`${fieldName}-search`" type="search" :placeholder="`Pesquisar ${label.toLocaleLowerCase('pt-PT')}…`" autocomplete="off"></label><div class="lookup-options"><label v-for="o in filtered" :key="o.id" class="lookup-option" :class="{'is-selected':has(o.id)}"><input :name="fieldName" type="checkbox" :value="o.id" :checked="has(o.id)" @change="toggle(o.id)"><span>{{o.label}}</span></label><p v-if="!filtered.length" class="lookup-empty">Nenhum resultado.</p></div><small class="lookup-count">{{selected.length}} selecionado{{selected.length===1?'':'s'}}</small></fieldset></template>
