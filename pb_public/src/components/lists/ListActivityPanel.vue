<!-- Mediário | Fase 10.3: histórico e restauro das listas. -->
<script setup lang="ts">
import { ref } from "vue";
import {
  clearListActivity,
  loadListActivity,
  restoreListActivity,
  type ListActivityEntry,
} from "@/domain/lists/listActivity";

const emit = defineEmits<{ restored: [string] }>();
const entries = ref<ListActivityEntry[]>(loadListActivity());
const error = ref("");
const message = ref("");

function clear(): void {
  if (!window.confirm("Limpar todo o histórico local das listas?")) return;
  clearListActivity();
  entries.value = [];
}

function restore(entry: ListActivityEntry): void {
  if (!entry.before || !window.confirm(`Restaurar o estado anterior de “${entry.listName}”?`)) return;
  try {
    restoreListActivity(entry.id);
    entries.value = loadListActivity();
    message.value = "Estado anterior restaurado.";
    emit("restored", entry.listId);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

function label(type: ListActivityEntry["type"]): string {
  return {
    created: "Criada",
    updated: "Atualizada",
    duplicated: "Duplicada",
    deleted: "Eliminada",
    refreshed: "Lista inteligente atualizada",
    converted: "Convertida",
    imported: "Importada",
    restored: "Restaurada",
  }[type];
}
</script>

<template>
  <section class="list-activity" aria-labelledby="list-activity-title">
    <div class="global-search-summary">
      <div><p class="eyebrow">Histórico local</p><h3 id="list-activity-title">Atividade das listas</h3></div>
      <button class="button button-secondary" type="button" :disabled="!entries.length" @click="clear">Limpar histórico</button>
    </div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
    <p v-if="!entries.length">Ainda não existe atividade registada.</p>
    <ol v-else>
      <li v-for="entry in entries" :key="entry.id">
        <div><small>{{ label(entry.type) }} · {{ new Date(entry.createdAt).toLocaleString("pt-PT") }}</small><strong>{{ entry.listName }}</strong><span>{{ entry.message }}</span></div>
        <button v-if="entry.before" class="button button-secondary" type="button" @click="restore(entry)">Restaurar</button>
      </li>
    </ol>
  </section>
</template>
