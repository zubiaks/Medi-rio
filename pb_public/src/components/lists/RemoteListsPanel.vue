<!-- Mediário | ZIP 12B: listas sincronizadas entre browsers. -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  deleteRemotePersonalList,
  loadRemotePersonalLists,
  saveRemotePersonalList,
} from "@/domain/lists/remoteListSync";
import type { PersonalList } from "@/domain/lists/personalLists";

const lists = ref<PersonalList[]>([]);
const selected = ref<PersonalList | null>(null);
const baselineUpdated = ref("");
const loading = ref(false);
const error = ref("");
const message = ref("");

async function load(): Promise<void> {
  loading.value = true; error.value = "";
  try {
    lists.value = await loadRemotePersonalLists();
    if (selected.value) {
      selected.value = lists.value.find((list) => list.id === selected.value?.id) || null;
      baselineUpdated.value = selected.value?.updatedAt || "";
    }
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

function choose(list: PersonalList): void {
  selected.value = JSON.parse(JSON.stringify(list)) as PersonalList;
  baselineUpdated.value = list.updatedAt;
  error.value = ""; message.value = "";
}

async function save(): Promise<void> {
  if (!selected.value) return;
  loading.value = true; error.value = ""; message.value = "";
  try {
    selected.value = await saveRemotePersonalList(selected.value, baselineUpdated.value);
    baselineUpdated.value = selected.value.updatedAt;
    message.value = "Lista sincronizada com o PocketBase.";
    await load();
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function remove(): Promise<void> {
  if (!selected.value || !window.confirm(`Eliminar a lista remota “${selected.value.name}”?`)) return;
  loading.value = true;
  try {
    await deleteRemotePersonalList(selected.value.id);
    selected.value = null;
    await load();
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

onMounted(load);
</script>

<template>
  <section class="remote-lists-panel" aria-labelledby="remote-lists-title">
    <div class="global-search-summary"><div><p class="eyebrow">Sincronização</p><h3 id="remote-lists-title">Listas da conta</h3></div><button class="button button-secondary" type="button" :disabled="loading" @click="load">Atualizar</button></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div><div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
    <div class="remote-lists-layout">
      <ul><li v-for="list in lists" :key="list.id"><button type="button" :class="{ 'is-active': selected?.id === list.id }" @click="choose(list)"><strong>{{ list.name }}</strong><small>{{ list.kind }} · {{ list.items.length }} itens</small></button></li></ul>
      <div v-if="selected" class="remote-list-editor"><label class="form-field"><span>Nome</span><input v-model.trim="selected.name" maxlength="120" /></label><label class="form-field"><span>Descrição</span><textarea v-model.trim="selected.description" maxlength="500" /></label><label class="check-field"><input v-model="selected.pinned" type="checkbox" /> Fixada</label><p>{{ selected.items.length }} itens · atualizada {{ new Date(selected.updatedAt).toLocaleString('pt-PT') }}</p><div class="form-actions"><button class="button button-primary" type="button" :disabled="loading" @click="save">Guardar e sincronizar</button><button class="button button-danger" type="button" :disabled="loading" @click="remove">Eliminar remota</button></div></div>
      <p v-else class="form-alert">Seleciona uma lista remota. Se ainda não existirem listas, usa primeiro a migração do ZIP 12A.</p>
    </div>
  </section>
</template>
