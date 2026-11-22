<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbEnrichmentPreview.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / enriquecimento TMDB
  Finalidade: Pré-visualizar diferenças e selecionar campos a aplicar.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TitleRecord } from "@/types/records";
import type { TmdbDetails } from "@/domain/providers/tmdbClient";
import {
  buildTmdbDifferences,
  selectEmptyTmdbFields,
  type TmdbEnrichmentField,
} from "@/domain/providers/tmdbEnrichment";

const props = defineProps<{
  title: TitleRecord;
  details: TmdbDetails;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  apply: [TmdbEnrichmentField[]];
}>();

const differences = computed(() => buildTmdbDifferences(props.title, props.details));
const selected = ref<TmdbEnrichmentField[]>([]);

watch(
  differences,
  (value) => {
    selected.value = selectEmptyTmdbFields(value);
  },
  { immediate: true },
);

function display(value: string | number | null): string {
  if (value === null || value === "") return "Sem valor";
  return String(value);
}

function selectEmpty(): void {
  selected.value = selectEmptyTmdbFields(differences.value);
}
</script>

<template>
  <section class="tmdb-enrichment" aria-labelledby="tmdb-enrichment-title">
    <header class="tmdb-enrichment-header">
      <div>
        <p class="eyebrow">Pré-visualização</p>
        <h3 id="tmdb-enrichment-title">Enriquecimento controlado</h3>
      </div>
      <button class="button button-secondary" type="button" @click="selectEmpty">
        Selecionar campos vazios
      </button>
    </header>

    <p v-if="!differences.length" class="form-alert">
      O título já contém os mesmos metadados disponíveis no TMDB.
    </p>

    <div v-else class="tmdb-difference-list">
      <label v-for="item in differences" :key="item.field" class="tmdb-difference-row">
        <input v-model="selected" type="checkbox" :value="item.field" />
        <span class="tmdb-difference-label">
          <strong>{{ item.label }}</strong>
          <small>{{ item.empty ? "Campo vazio" : "Valor manual preenchido" }}</small>
        </span>
        <span><small>Atual</small>{{ display(item.currentValue) }}</span>
        <span><small>TMDB</small>{{ display(item.proposedValue) }}</span>
      </label>
    </div>

    <div class="form-actions">
      <button
        class="button button-primary"
        type="button"
        :disabled="disabled || selected.length === 0"
        @click="emit('apply', selected)"
      >
        Aplicar {{ selected.length }} campo{{ selected.length === 1 ? "" : "s" }}
      </button>
    </div>
  </section>
</template>
