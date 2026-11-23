<!-- Mediário | Adicionar resultado da pesquisa a uma lista manual. -->
<script setup lang="ts">
import { ref } from "vue";
import type { GlobalSearchItem } from "@/domain/search/globalSearch";
import { addItemToPersonalList, loadPersonalLists, type PersonalList } from "@/domain/lists/personalLists";
const props = defineProps<{ item: GlobalSearchItem }>();
const lists = ref<PersonalList[]>(loadPersonalLists().filter((list) => list.kind === "manual"));
const selectedId = ref(lists.value[0]?.id || "");
const message = ref("");
function add(): void {
  if (!selectedId.value) return;
  addItemToPersonalList(selectedId.value, props.item);
  message.value = "Adicionado à lista.";
  lists.value = loadPersonalLists().filter((list) => list.kind === "manual");
}
</script>
<template><section class="add-to-list-panel"><label class="form-field"><span>Adicionar à lista</span><select v-model="selectedId"><option value="">Selecionar</option><option v-for="list in lists" :key="list.id" :value="list.id">{{ list.name }}</option></select></label><button class="button button-secondary" type="button" :disabled="!selectedId" @click="add">Adicionar</button><span v-if="message" role="status">{{ message }}</span></section></template>
