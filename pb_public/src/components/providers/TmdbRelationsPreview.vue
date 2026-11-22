<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbRelationsPreview.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / relações TMDB
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TmdbDetails } from "@/domain/providers/tmdbClient";
import {
  buildTmdbRelationPreview,
  type RelationMode,
  type TmdbRelationField,
} from "@/domain/providers/tmdbRelations";

const props = defineProps<{ details: TmdbDetails; disabled?: boolean }>();
const emit = defineEmits<{ apply: [TmdbRelationField[], RelationMode] }>();
const preview = computed(() => buildTmdbRelationPreview(props.details));
const selected = ref<TmdbRelationField[]>([]);
const mode = ref<RelationMode>("append");
watch(preview, (value) => { selected.value = value.map((item) => item.field); }, { immediate: true });
</script>

<template>
  <section class="tmdb-relations" aria-labelledby="tmdb-relations-title">
    <div class="tmdb-enrichment-header">
      <div><p class="eyebrow">Relações estruturais</p><h3 id="tmdb-relations-title">Géneros, países, idiomas e entidades</h3></div>
      <label class="form-field tmdb-relation-mode"><span>Modo de aplicação</span><select v-model="mode"><option value="append">Acrescentar às relações existentes</option><option value="replace">Substituir pelas relações TMDB</option></select></label>
    </div>
    <p v-if="mode === 'replace'" class="form-alert form-alert-warning" role="alert">O modo Substituir remove das relações selecionadas os valores que não estejam no TMDB.</p>
    <div class="tmdb-relation-list">
      <label v-for="item in preview" :key="item.field" class="tmdb-relation-row">
        <input v-model="selected" type="checkbox" :value="item.field" />
        <span><strong>{{ item.label }}</strong><small>{{ item.values.join(" · ") }}</small></span>
      </label>
    </div>
    <div class="form-actions"><button class="button button-primary" type="button" :disabled="disabled || !selected.length" @click="emit('apply', selected, mode)">Aplicar relações selecionadas</button></div>
  </section>
</template>
