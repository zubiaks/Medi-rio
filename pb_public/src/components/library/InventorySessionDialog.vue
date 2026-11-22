<!-- Execução de uma sessão de inventário. -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { inventoryItemRepository } from "@/domain/library/inventoryRepository";
import { calculateInventoryProgress, completeInventory, startInventory, updateInventoryItem } from "@/domain/library/inventoryWorkflow";
import type { InventoryItemRecord, InventoryItemState, InventoryRecord } from "@/domain/library/inventoryRecords";
import InventoryReportDialog from "./InventoryReportDialog.vue";

const props = defineProps<{ inventory: InventoryRecord | null }>();
const emit = defineEmits<{ close: []; changed: [] }>();
const items = ref<InventoryItemRecord[]>([]);
const current = ref<InventoryRecord | null>(null);
const query = ref("");
const error = ref("");
const reportOpen = ref(false);
const progress = computed(() => calculateInventoryProgress(items.value));
const filtered = computed(() => { const q=query.value.toLocaleLowerCase("pt-PT"); return items.value.filter(item=>!q||`${item.expand?.exemplar?.codigo_interno||""} ${item.expand?.exemplar?.codigo_barras||""} ${item.expand?.exemplar?.expand?.titulo?.titulo||""}`.toLocaleLowerCase("pt-PT").includes(q)); });

watch(() => props.inventory, async inventory => { current.value=inventory;items.value=[];if(!inventory)return;items.value=(await inventoryItemRepository.list({page:1,perPage:500,filter:`inventario = "${inventory.id}"`,sort:"estado,created",expand:"exemplar,exemplar.titulo"})).items; }, { immediate:true });

async function begin(){if(current.value)current.value=await startInventory(current.value)}
async function mark(item:InventoryItemRecord,state:InventoryItemState){const saved=await updateInventoryItem(item,state,item.localizacao_encontrada||item.localizacao_esperada||"");items.value=items.value.map(x=>x.id===saved.id?saved:x)}
async function finish(){if(!current.value)return;try{current.value=await completeInventory(current.value,items.value);emit("changed");reportOpen.value=true}catch(cause){error.value=cause instanceof Error?cause.message:String(cause)}}
</script>
<template><Teleport to="body"><div v-if="inventory&& current" class="dialog-backdrop" @click.self="emit('close')"><section class="dialog-panel inventory-session-dialog" role="dialog" aria-modal="true" aria-labelledby="inventory-session-title"><div class="dialog-header"><div><p class="eyebrow">{{current.estado}}</p><h2 id="inventory-session-title">{{current.nome}}</h2></div><button class="icon-button" type="button" aria-label="Fechar" @click="emit('close')">×</button></div><div v-if="error" class="form-alert form-alert-error" role="alert">{{error}}</div><p>{{progress.verificados}} de {{progress.total}} verificados · {{progress.percentagem}}%</p><div class="progress"><span :style="{width:`${progress.percentagem}%`}"/></div><div class="inventory-toolbar"><label class="form-field"><span>Pesquisar exemplar</span><input v-model.trim="query" type="search" placeholder="Título, código interno ou código de barras"/></label><button v-if="current.estado==='Preparação'" class="button button-primary" type="button" @click="begin">Iniciar inventário</button><button v-if="current.estado==='Em curso'" class="button button-primary" type="button" @click="finish">Concluir inventário</button></div><div class="inventory-items"><article v-for="item in filtered" :key="item.id" class="inventory-item"><div><strong>{{item.expand?.exemplar?.expand?.titulo?.titulo||item.exemplar}}</strong><small>{{item.expand?.exemplar?.codigo_interno||item.expand?.exemplar?.codigo_barras||'Sem código'}}</small><small>Esperada: {{item.localizacao_esperada||'—'}}</small></div><div class="library-row-actions"><button type="button" class="button button-secondary" @click="mark(item,'Encontrado')">Encontrado</button><button type="button" class="button button-secondary" @click="mark(item,'Localização incorrecta')">Localização incorrecta</button><button type="button" class="button button-secondary" @click="mark(item,'Dados incompletos')">Dados incompletos</button><button type="button" class="button button-danger" @click="mark(item,'Não localizado')">Não localizado</button></div></article></div><InventoryReportDialog :open="reportOpen" :inventory="current" :items="items" @close="reportOpen=false"/></section></div></Teleport></template>
