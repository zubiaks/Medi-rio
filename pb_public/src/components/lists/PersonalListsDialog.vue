<!-- Mediário | Fase 10.0: gestão de listas pessoais. -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  createPersonalList,
  deletePersonalList,
  loadPersonalLists,
  movePersonalListItem,
  removeItemFromPersonalList,
  replacePersonalLists,
  updatePersonalList,
  type PersonalList,
  type PersonalListKind,
} from "@/domain/lists/personalLists";
import { exportPersonalLists, importPersonalLists } from "@/domain/lists/listTransfer";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const lists = ref<PersonalList[]>([]);
const selectedId = ref("");
const name = ref("");
const description = ref("");
const kind = ref<PersonalListKind>("manual");
const error = ref("");
const message = ref("");
const importInput = ref<HTMLInputElement | null>(null);
const selected = computed(() => lists.value.find((list) => list.id === selectedId.value) || null);

watch(() => props.open, (open) => {
  if (!open) return;
  lists.value = loadPersonalLists();
  selectedId.value = lists.value[0]?.id || "";
  error.value = "";
  message.value = "";
});

function create(): void {
  error.value = "";
  try {
    lists.value = createPersonalList(name.value, description.value, kind.value);
    selectedId.value = lists.value[0]?.id || "";
    name.value = "";
    description.value = "";
    kind.value = "manual";
    message.value = "Lista criada.";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
}

function removeList(list: PersonalList): void {
  if (!window.confirm(`Eliminar a lista “${list.name}”?`)) return;
  lists.value = deletePersonalList(list.id);
  selectedId.value = lists.value[0]?.id || "";
}

function togglePinned(list: PersonalList): void {
  lists.value = updatePersonalList(list.id, { pinned: !list.pinned });
}

function removeItem(entity: PersonalList["items"][number]["entity"], id: string): void {
  if (!selected.value) return;
  lists.value = removeItemFromPersonalList(selected.value.id, entity, id);
}

function move(from: number, direction: -1 | 1): void {
  if (!selected.value) return;
  const to = from + direction;
  lists.value = movePersonalListItem(selected.value.id, from, to);
}

function download(): void {
  const blob = new Blob([exportPersonalLists(lists.value)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mediario-listas-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    lists.value = replacePersonalLists(importPersonalLists(await file.text()));
    selectedId.value = lists.value[0]?.id || "";
    message.value = `${lists.value.length} lista(s) importada(s).`;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { input.value = ""; }
}
</script>

<template>
  <Teleport to="body"><div v-if="open" class="dialog-backdrop" @click.self="emit('close')"><section class="dialog-panel personal-lists-dialog" role="dialog" aria-modal="true" aria-labelledby="personal-lists-title">
    <div class="dialog-header"><div><p class="eyebrow">Fase 10.0</p><h2 id="personal-lists-title">Coleções e listas</h2></div><button class="icon-button" type="button" aria-label="Fechar" @click="emit('close')">×</button></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div><div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
    <div class="personal-lists-layout">
      <aside class="personal-lists-sidebar">
        <form class="personal-list-create" @submit.prevent="create"><label class="form-field"><span>Nome</span><input v-model.trim="name" required maxlength="120" /></label><label class="form-field"><span>Descrição</span><textarea v-model.trim="description" maxlength="500" /></label><label class="form-field"><span>Tipo</span><select v-model="kind"><option value="manual">Manual</option><option value="smart">Inteligente</option></select></label><button class="button button-primary" type="submit">Criar lista</button></form>
        <ul class="personal-list-nav"><li v-for="list in lists" :key="list.id"><button type="button" :class="{ 'is-active': selectedId === list.id }" @click="selectedId = list.id"><span :style="{ background: list.color }" /><strong>{{ list.name }}</strong><small>{{ list.kind === 'manual' ? `${list.items.length} itens` : 'Inteligente' }}</small></button></li></ul>
        <div class="form-actions"><button class="button button-secondary" type="button" :disabled="!lists.length" @click="download">Exportar</button><button class="button button-secondary" type="button" @click="importInput?.click()">Importar</button><input ref="importInput" class="sr-only" type="file" accept="application/json,.json" @change="importFile" /></div>
      </aside>
      <main v-if="selected" class="personal-list-detail">
        <header><div><p class="eyebrow">{{ selected.kind === 'manual' ? 'Lista manual' : 'Lista inteligente' }}</p><h3>{{ selected.name }}</h3><p>{{ selected.description || 'Sem descrição.' }}</p></div><div class="form-actions"><button class="button button-secondary" type="button" @click="togglePinned(selected)">{{ selected.pinned ? 'Desafixar' : 'Fixar' }}</button><button class="button button-danger" type="button" @click="removeList(selected)">Eliminar</button></div></header>
        <p v-if="selected.kind === 'smart'" class="form-alert">As regras inteligentes serão ligadas ao motor de pesquisa na Fase 10.1. Esta lista já está preparada para guardar a regra.</p>
        <p v-if="selected.kind === 'manual' && !selected.items.length">Adiciona itens a partir do detalhe da Pesquisa global.</p>
        <ol v-if="selected.items.length" class="personal-list-items"><li v-for="(item, index) in selected.items" :key="`${item.entity}-${item.id}`"><img v-if="item.imageUrl" :src="item.imageUrl" :alt="" loading="lazy" /><span v-else class="global-search-fallback" aria-hidden="true">◇</span><div><strong>{{ item.title }}</strong><small>{{ item.subtitle || item.entity }}</small></div><div class="personal-list-order"><button class="icon-button" type="button" aria-label="Subir" :disabled="index === 0" @click="move(index, -1)">↑</button><button class="icon-button" type="button" aria-label="Descer" :disabled="index === selected.items.length - 1" @click="move(index, 1)">↓</button><button class="icon-button" type="button" aria-label="Remover" @click="removeItem(item.entity, item.id)">×</button></div></li></ol>
      </main>
      <p v-else class="form-alert">Cria ou seleciona uma lista.</p>
    </div>
    <div class="form-actions"><button class="button button-secondary" type="button" @click="emit('close')">Fechar</button></div>
  </section></div></Teleport>
</template>
