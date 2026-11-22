<!-- Diálogo acessível para criar uma sessão de inventário. -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { createInventory } from "@/domain/library/inventoryWorkflow";
import type { InventoryRecord } from "@/domain/library/inventoryRecords";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; created: [InventoryRecord] }>();
const name = ref("");
const notes = ref("");
const saving = ref(false);
const error = ref("");

watch(() => props.open, (open) => { if (open) { name.value = `Inventário ${new Date().toLocaleDateString("pt-PT")}`; notes.value = ""; error.value = ""; } });

async function save(): Promise<void> {
  saving.value = true;
  error.value = "";
  try { emit("created", await createInventory({ nome: name.value, notas: notes.value })); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { saving.value = false; }
}
</script>
<template><Teleport to="body"><div v-if="open" class="dialog-backdrop" @click.self="!saving && emit('close')"><section class="dialog-panel inventory-create-dialog" role="dialog" aria-modal="true" aria-labelledby="inventory-create-title"><form @submit.prevent="save"><div class="dialog-header"><div><p class="eyebrow">Biblioteca física</p><h2 id="inventory-create-title">Nova sessão de inventário</h2></div><button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="emit('close')">×</button></div><div v-if="error" class="form-alert form-alert-error" role="alert">{{error}}</div><label class="form-field"><span>Nome da sessão *</span><input v-model.trim="name" required maxlength="200"/></label><label class="form-field"><span>Notas</span><textarea v-model="notes" rows="4" maxlength="5000"/></label><p class="field-hint">Será criado um item para cada exemplar existente. Nenhum exemplar será alterado.</p><div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button><button class="button button-primary" type="submit" :disabled="saving">{{saving?"A criar…":"Criar sessão"}}</button></div></form></section></div></Teleport></template>
