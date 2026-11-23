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
import {
  convertSmartListToManual,
  normalizeSmartListRule,
  previewSmartList,
  refreshSmartList,
  type ExtendedSmartListRule,
} from "@/domain/lists/smartLists";
import type { GlobalSearchItem, SearchEntity } from "@/domain/search/globalSearch";
import { compareSmartListSnapshot } from "@/domain/lists/smartListDiff";
import { duplicatePersonalList, filterPersonalListItems } from "@/domain/lists/listDashboard";

const props = defineProps<{ open: boolean; initialListId?: string }>();
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
const smartRule = ref<ExtendedSmartListRule>(normalizeSmartListRule());
const preview = ref<GlobalSearchItem[]>([]);
const itemQuery = ref("");
const smartDifference = computed(() =>
  selected.value?.kind === "smart"
    ? compareSmartListSnapshot(selected.value.items, preview.value)
    : null,
);
const visibleItems = computed(() =>
  selected.value ? filterPersonalListItems(selected.value.items, itemQuery.value) : [],
);
const smartLoading = ref(false);
const entityOptions: Array<{ id: SearchEntity; label: string }> = [
  { id: "titles", label: "Títulos" },
  { id: "people", label: "Pessoas" },
  { id: "collections", label: "Coleções" },
  { id: "episodes", label: "Episódios" },
  { id: "streams", label: "Streams" },
  { id: "aliases", label: "Aliases" },
  { id: "sources", label: "Fontes" },
];

watch(selected, (list) => {
  smartRule.value = normalizeSmartListRule(
    list?.kind === "smart"
      ? list.rule as ExtendedSmartListRule | undefined
      : undefined,
  );
  preview.value = [];
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) return;
  lists.value = loadPersonalLists();
  selectedId.value = props.initialListId && lists.value.some((item) => item.id === props.initialListId)
    ? props.initialListId
    : lists.value[0]?.id || "";
  error.value = "";
  message.value = "";
});

function create(): void {
  error.value = "";
  try {
    lists.value = createPersonalList(
      name.value,
      description.value,
      kind.value,
      kind.value === "smart" ? normalizeSmartListRule() : undefined,
    );
    selectedId.value = lists.value[0]?.id || "";
    name.value = "";
    description.value = "";
    kind.value = "manual";
    message.value = "Lista criada.";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
}

function duplicateList(list: PersonalList): void {
  try {
    lists.value = duplicatePersonalList(list.id);
    selectedId.value = lists.value[0]?.id || "";
    message.value = "Lista duplicada.";
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
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

async function previewRule(): Promise<void> {
  smartLoading.value = true;
  error.value = "";
  try {
    preview.value = await previewSmartList(smartRule.value);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    smartLoading.value = false;
  }
}

function saveRule(): void {
  if (!selected.value || selected.value.kind !== "smart") return;
  lists.value = updatePersonalList(selected.value.id, {
    rule: normalizeSmartListRule(smartRule.value),
  });
  message.value = "Regra inteligente guardada.";
}

async function refreshRule(): Promise<void> {
  if (!selected.value) return;
  saveRule();
  smartLoading.value = true;
  error.value = "";
  try {
    lists.value = await refreshSmartList(selected.value.id);
    preview.value = [];
    message.value = "Lista inteligente atualizada.";
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    smartLoading.value = false;
  }
}

function convertToManual(): void {
  if (!selected.value || !window.confirm("Converter esta lista inteligente numa lista manual? A regra será removida.")) return;
  lists.value = convertSmartListToManual(selected.value.id);
  message.value = "Lista convertida em manual.";
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
        <header><div><p class="eyebrow">{{ selected.kind === 'manual' ? 'Lista manual' : 'Lista inteligente' }}</p><h3>{{ selected.name }}</h3><p>{{ selected.description || 'Sem descrição.' }}</p></div><div class="form-actions"><button class="button button-secondary" type="button" @click="togglePinned(selected)">{{ selected.pinned ? 'Desafixar' : 'Fixar' }}</button><button class="button button-secondary" type="button" @click="duplicateList(selected)">Duplicar</button><button class="button button-danger" type="button" @click="removeList(selected)">Eliminar</button></div></header>
        <section v-if="selected.kind === 'smart'" class="smart-list-editor" aria-labelledby="smart-rule-title">
          <div><p class="eyebrow">Regra automática</p><h4 id="smart-rule-title">Configurar lista inteligente</h4></div>
          <label class="form-field field-wide"><span>Termo de pesquisa *</span><input v-model.trim="smartRule.query" type="search" minlength="2" maxlength="300" /></label>
          <fieldset><legend>Entidades</legend><label v-for="item in entityOptions" :key="item.id" class="check-field"><input v-model="smartRule.filters.entities" type="checkbox" :value="item.id" /> {{ item.label }}</label></fieldset>
          <div class="smart-list-filter-grid">
            <label class="form-field"><span>Provider</span><select v-model="smartRule.filters.provider"><option value="">Todos</option><option value="tmdb">TMDB</option><option value="omdb">OMDb</option></select></label>
            <label class="form-field"><span>Ano mínimo</span><input v-model.number="smartRule.filters.yearFrom" type="number" min="1800" max="2200" /></label>
            <label class="form-field"><span>Ano máximo</span><input v-model.number="smartRule.filters.yearTo" type="number" min="1800" max="2200" /></label>
            <label class="form-field"><span>Ordenação</span><select v-model="smartRule.sort"><option value="relevance">Relevância</option><option value="title">Título</option><option value="year-desc">Ano mais recente</option><option value="year-asc">Ano mais antigo</option><option value="rating-desc">Melhor rating</option></select></label>
            <label class="form-field"><span>Máximo de resultados</span><input v-model.number="smartRule.limit" type="number" min="1" max="100" /></label>
            <label class="check-field"><input v-model="smartRule.filters.includeDeleted" type="checkbox" /> Incluir títulos apagados</label>
          </div>
          <div class="form-actions"><button class="button button-secondary" type="button" :disabled="smartLoading" @click="previewRule">Pré-visualizar</button><button class="button button-secondary" type="button" :disabled="smartLoading" @click="saveRule">Guardar regra</button><button class="button button-primary" type="button" :disabled="smartLoading" @click="refreshRule">{{ smartLoading ? "A atualizar…" : "Atualizar lista" }}</button><button class="button button-secondary" type="button" :disabled="smartLoading" @click="convertToManual">Converter em manual</button></div>
          <div v-if="preview.length" class="smart-list-preview"><h5>Pré-visualização ({{ preview.length }})</h5><div><article v-for="item in preview" :key="`${item.entity}-${item.id}`"><img v-if="item.imageUrl" :src="item.imageUrl" :alt="" loading="lazy" /><span v-else class="global-search-fallback" aria-hidden="true">◇</span><strong>{{ item.title }}</strong><small>{{ item.subtitle || item.entity }}</small></article></div></div>
          <dl v-if="preview.length && smartDifference" class="smart-list-diff"><div><dt>Novos</dt><dd>{{ smartDifference.added.length }}</dd></div><div><dt>Removidos</dt><dd>{{ smartDifference.removed.length }}</dd></div><div><dt>Inalterados</dt><dd>{{ smartDifference.unchanged }}</dd></div></dl>
        </section>
        <p v-if="selected.kind === 'manual' && !selected.items.length">Adiciona itens a partir do detalhe da Pesquisa global.</p>
        <label v-if="selected.items.length" class="form-field"><span>Pesquisar dentro da lista</span><input v-model.trim="itemQuery" type="search" placeholder="Título, subtítulo ou entidade" /></label>
        <ol v-if="visibleItems.length" class="personal-list-items"><li v-for="(item, index) in visibleItems" :key="`${item.entity}-${item.id}`"><img v-if="item.imageUrl" :src="item.imageUrl" :alt="" loading="lazy" /><span v-else class="global-search-fallback" aria-hidden="true">◇</span><div><strong>{{ item.title }}</strong><small>{{ item.subtitle || item.entity }}</small></div><div class="personal-list-order"><button class="icon-button" type="button" aria-label="Subir" :disabled="index === 0" @click="move(selected.items.findIndex((value) => value.id === item.id && value.entity === item.entity), -1)">↑</button><button class="icon-button" type="button" aria-label="Descer" :disabled="index === selected.items.length - 1" @click="move(selected.items.findIndex((value) => value.id === item.id && value.entity === item.entity), 1)">↓</button><button class="icon-button" type="button" aria-label="Remover" @click="removeItem(item.entity, item.id)">×</button></div></li></ol>
      </main>
      <p v-else class="form-alert">Cria ou seleciona uma lista.</p>
    </div>
    <div class="form-actions"><button class="button button-secondary" type="button" @click="emit('close')">Fechar</button></div>
  </section></div></Teleport>
</template>
