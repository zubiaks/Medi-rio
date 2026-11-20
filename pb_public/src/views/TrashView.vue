<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { onMounted,ref } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import TitlePermanentDeleteDialog from "@/components/catalog/TitlePermanentDeleteDialog.vue";
import { permanentlyDeleteTitle,restoreTitle } from "@/domain/catalog/trash";
import { titleRepository } from "@/domain/repositories";
import type { TitleRecord } from "@/types/records";
const items=ref<TitleRecord[]>([]),loading=ref(true),error=ref(""),busyId=ref(""),deleteTarget=ref<TitleRecord|null>(null);
async function load(){loading.value=true;error.value="";try{const page=await titleRepository.list({perPage:100,filter:"apagado = true",sort:"-apagado_em,-updated"});items.value=page.items}catch(e){error.value=e instanceof Error?e.message:String(e)}finally{loading.value=false}}
async function restore(item:TitleRecord){busyId.value=item.id;try{await restoreTitle(item.id);items.value=items.value.filter(x=>x.id!==item.id)}catch(e){error.value=e instanceof Error?e.message:String(e)}finally{busyId.value=""}}
async function remove(){if(!deleteTarget.value)return;busyId.value=deleteTarget.value.id;try{await permanentlyDeleteTitle(deleteTarget.value.id);items.value=items.value.filter(x=>x.id!==deleteTarget.value?.id);deleteTarget.value=null}catch(e){error.value=e instanceof Error?e.message:String(e)}finally{busyId.value=""}}
const date=(value?:string)=>value?new Intl.DateTimeFormat("pt-PT",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"Data desconhecida";
onMounted(()=>void load());
</script>
<template><BasePageHeader eyebrow="Catálogo" title="Lixeira" description="Restaura títulos arquivados ou elimina-os definitivamente."><template #actions><RouterLink class="button button-secondary" to="/catalogo">← Catálogo</RouterLink></template></BasePageHeader><div v-if="error" class="form-alert form-alert-error">{{error}}</div><section v-if="loading" class="page-loading"><span class="loader"/></section><div v-else-if="items.length" class="trash-list"><article v-for="item in items" :key="item.id" class="panel trash-item"><div><h2>{{item.titulo}}</h2><p>Eliminado em {{date(item.apagado_em)}}</p><small v-if="item.motivo_eliminacao">{{item.motivo_eliminacao}}</small></div><div class="trash-actions"><button class="button button-secondary" :disabled="busyId===item.id" @click="restore(item)">Restaurar</button><button class="button button-danger" :disabled="busyId===item.id" @click="deleteTarget=item">Eliminar definitivamente</button></div></article></div><BaseEmptyState v-else icon="♲" title="A lixeira está vazia" description="Os títulos enviados para a lixeira aparecerão aqui."/><TitlePermanentDeleteDialog :open="Boolean(deleteTarget)" :title="deleteTarget?.titulo||''" :saving="busyId===deleteTarget?.id" @close="deleteTarget=null" @confirm="remove"/></template>
