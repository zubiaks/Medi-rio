<!-- Gestor das sessões de inventário físico. -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { inventoryRepository } from "@/domain/library/inventoryRepository";
import type { InventoryRecord } from "@/domain/library/inventoryRecords";
import InventoryCreateDialog from "./InventoryCreateDialog.vue";
import InventorySessionDialog from "./InventorySessionDialog.vue";

const inventories = ref<InventoryRecord[]>([]);
const loading = ref(true);
const error = ref("");
const createOpen = ref(false);
const selected = ref<InventoryRecord | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try { inventories.value = (await inventoryRepository.list({ page: 1, perPage: 100, sort: "-created" })).items; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

function created(inventory: InventoryRecord): void { createOpen.value = false; inventories.value = [inventory, ...inventories.value]; selected.value = inventory; }
onMounted(load);
</script>
<template><section class="panel inventory-manager" aria-labelledby="inventory-manager-title"><div class="section-heading"><div><p class="eyebrow">Controlo físico</p><h2 id="inventory-manager-title">Sessões de inventário</h2></div><button class="button button-primary" type="button" @click="createOpen=true">Nova sessão</button></div><div v-if="error" class="form-alert form-alert-error" role="alert">{{error}}</div><p v-if="loading" aria-live="polite">A carregar sessões…</p><p v-else-if="!inventories.length">Ainda não existem sessões de inventário.</p><div v-else class="table-wrap"><table><thead><tr><th>Nome</th><th>Estado</th><th>Progresso</th><th>Criado</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody><tr v-for="inventory in inventories" :key="inventory.id"><td>{{inventory.nome}}</td><td>{{inventory.estado}}</td><td>{{inventory.total_verificado||0}} / {{inventory.total_previsto||0}}</td><td>{{new Date(inventory.created).toLocaleDateString("pt-PT")}}</td><td><button class="button button-secondary" type="button" @click="selected=inventory">Abrir</button></td></tr></tbody></table></div><InventoryCreateDialog :open="createOpen" @close="createOpen=false" @created="created"/><InventorySessionDialog :inventory="selected" @close="selected=null" @changed="load"/></section></template>
