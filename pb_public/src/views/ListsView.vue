<script setup lang="ts">
import { ref } from "vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import ListsDashboardDialog from "@/components/lists/ListsDashboardDialog.vue";
import PersonalListsDialog from "@/components/lists/PersonalListsDialog.vue";
import RemoteListsPanel from "@/components/lists/RemoteListsPanel.vue";
const dashboardOpen=ref(false); const managerOpen=ref(false); const requestedId=ref("");
function manage(id:string){requestedId.value=id;dashboardOpen.value=false;managerOpen.value=true;}
</script>
<template><BasePageHeader eyebrow="Organização" title="Coleções e listas" description="Listas locais, inteligentes e sincronizadas com a conta."><template #actions><button class="button button-primary" type="button" @click="dashboardOpen=true">Abrir dashboard</button></template></BasePageHeader><section class="panel lists-route-intro"><h2>O teu espaço de listas</h2><p>Consulta as listas sincronizadas e gere regras inteligentes.</p><div class="route-action-grid"><button class="button button-primary" type="button" @click="dashboardOpen=true">Dashboard de listas</button><button class="button button-secondary" type="button" @click="managerOpen=true">Gerir listas locais</button><RouterLink class="button button-secondary" :to="{name:'search'}">Pesquisar para adicionar</RouterLink></div></section><RemoteListsPanel/><ListsDashboardDialog :open="dashboardOpen" @close="dashboardOpen=false" @manage="manage"/><PersonalListsDialog :open="managerOpen" :initial-list-id="requestedId" @close="managerOpen=false"/></template>
