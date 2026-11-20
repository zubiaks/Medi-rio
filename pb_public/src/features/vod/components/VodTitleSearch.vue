<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { titleRepository } from "@/domain/repositories";
import type { TitleRecord } from "@/types/records";

const model = defineModel<string>({ required: true });
const props = withDefaults(defineProps<{ error?: string }>(), { error: "" });

const query = ref("");
const results = ref<TitleRecord[]>([]);
const selected = ref<TitleRecord | null>(null);
const loading = ref(false);
const open = ref(false);
const requestNumber = ref(0);
let timer: ReturnType<typeof setTimeout> | undefined;

const selectedLabel = computed(() => {
  if (!selected.value) return "";
  return `${selected.value.titulo}${selected.value.ano ? ` (${selected.value.ano})` : ""}`;
});

function escapeFilter(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

async function loadSelected(id: string): Promise<void> {
  if (!id) {
    selected.value = null;
    return;
  }
  if (selected.value?.id === id) return;
  try {
    selected.value = await titleRepository.get(id);
    query.value = selectedLabel.value;
  } catch {
    selected.value = null;
  }
}

async function searchTitles(term: string): Promise<void> {
  const normalized = term.trim();
  if (normalized.length < 2) {
    results.value = [];
    loading.value = false;
    return;
  }

  const currentRequest = ++requestNumber.value;
  loading.value = true;
  try {
    const escaped = escapeFilter(normalized);
    const numericYear = /^\d{4}$/.test(normalized) ? Number(normalized) : null;
    const titleFilter = `titulo ~ "${escaped}" || titulo_original ~ "${escaped}"`;
    const filter = numericYear
      ? `apagado = false && (${titleFilter} || ano = ${numericYear})`
      : `apagado = false && (${titleFilter})`;

    const page = await titleRepository.list({
      page: 1,
      perPage: 20,
      filter,
      sort: "titulo",
      fields: "id,titulo,titulo_original,ano",
    });

    if (currentRequest === requestNumber.value) {
      results.value = page.items;
      open.value = true;
    }
  } finally {
    if (currentRequest === requestNumber.value) loading.value = false;
  }
}

function scheduleSearch(): void {
  selected.value = null;
  model.value = "";
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void searchTitles(query.value), 300);
}

function choose(title: TitleRecord): void {
  selected.value = title;
  model.value = title.id;
  query.value = `${title.titulo}${title.ano ? ` (${title.ano})` : ""}`;
  open.value = false;
  results.value = [];
}

function clear(): void {
  selected.value = null;
  model.value = "";
  query.value = "";
  results.value = [];
  open.value = false;
}

function closeLater(): void {
  setTimeout(() => { open.value = false; }, 150);
}

watch(model, (id) => void loadSelected(id), { immediate: true });
onBeforeUnmount(() => { if (timer) clearTimeout(timer); });
</script>

<template>
  <div class="form-field field-wide vod-title-search">
    <label for="vod-title-search">Título *</label>
    <div class="vod-title-search-input">
      <input
        id="vod-title-search"
        v-model="query"
        name="titulo_pesquisa"
        type="search"
        autocomplete="off"
        placeholder="Escreve pelo menos 2 caracteres…"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        aria-controls="vod-title-results"
        @input="scheduleSearch"
        @focus="results.length && (open = true)"
        @blur="closeLater"
      />
      <button v-if="model" class="button button-secondary" type="button" aria-label="Limpar título selecionado" @click="clear">×</button>
    </div>
    <small v-if="model" class="field-hint">Selecionado: {{ selectedLabel }}</small>
    <small v-else-if="loading" class="field-hint">A pesquisar…</small>
    <small v-else-if="query.trim().length === 1" class="field-hint">Escreve mais um carácter.</small>
    <small v-if="props.error" class="field-error">{{ props.error }}</small>

    <ul v-if="open" id="vod-title-results" class="vod-title-results" role="listbox">
      <li v-for="title in results" :key="title.id">
        <button type="button" role="option" @mousedown.prevent="choose(title)">
          <strong>{{ title.titulo }}</strong>
          <span>{{ title.ano || "Ano desconhecido" }}<template v-if="title.titulo_original"> · {{ title.titulo_original }}</template></span>
        </button>
      </li>
      <li v-if="!loading && !results.length" class="vod-title-no-results">Nenhum título encontrado.</li>
    </ul>
  </div>
</template>
