<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from "vue";
import { createEmptyTitleForm, type TitleFormData, type TitleValidationErrors } from "@/domain/catalog/models";
import { validateTitleForm } from "@/domain/catalog/validation";
import { loadCatalogLookups } from "@/features/lookups/catalogLookups";
import type { CatalogLookups } from "@/types/lookups";
import LookupMultiSelect from "./LookupMultiSelect.vue";

const emit = defineEmits<{ submit: [TitleFormData] }>();
const props = withDefaults(defineProps<{ saving?: boolean }>(), { saving: false });
const form = ref(createEmptyTitleForm());
const errors = ref<TitleValidationErrors>({});
const lookups = ref<CatalogLookups | null>(null);
const loadError = ref("");
const types = computed(() => lookups.value?.tipos.filter((item) => !form.value.midiaId || item.parentId === form.value.midiaId) || []);

onMounted(async () => {
  try { lookups.value = await loadCatalogLookups(); }
  catch (error) { loadError.value = error instanceof Error ? error.message : String(error); }
});

function copyForm(value: TitleFormData): TitleFormData {
  const raw = toRaw(value);
  return {
    ...raw,
    paisIds: [...raw.paisIds],
    idiomaIds: [...raw.idiomaIds],
    generoIds: [...raw.generoIds],
    tagIds: [...raw.tagIds],
    plataformaIds: [...raw.plataformaIds],
    companhiaIds: [...raw.companhiaIds],
    categoriaFonteIds: [...raw.categoriaFonteIds],
  };
}

function submit(): void {
  errors.value = validateTitleForm(form.value);
  if (Object.keys(errors.value).length) return;
  emit("submit", copyForm(form.value));
}
</script>

<template>
  <section v-if="!lookups && !loadError" class="page-loading"><span class="loader" /><p>A carregar campos…</p></section>
  <div v-else-if="loadError" class="empty-state"><strong>Erro ao carregar lookups</strong><p>{{ loadError }}</p></div>
  <form v-else-if="lookups" class="title-form" novalidate @submit.prevent="submit">
    <fieldset><legend>Identificação</legend><div class="form-grid">
      <label class="form-field field-wide"><span>Título *</span><input v-model.trim="form.titulo"><small v-if="errors.titulo" class="field-error">{{ errors.titulo }}</small></label>
      <label class="form-field"><span>Título original</span><input v-model.trim="form.tituloOriginal"></label>
      <label class="form-field"><span>Ano</span><input v-model.number="form.ano" type="number" min="1800" max="2100"><small v-if="errors.ano" class="field-error">{{ errors.ano }}</small></label>
      <label class="form-field"><span>Mídia *</span><select v-model="form.midiaId"><option value="">Selecionar…</option><option v-for="item in lookups.midias" :key="item.id" :value="item.id">{{ item.label }}</option></select><small v-if="errors.midiaId" class="field-error">{{ errors.midiaId }}</small></label>
      <label class="form-field"><span>Tipo</span><select v-model="form.tipoId"><option value="">Selecionar…</option><option v-for="item in types" :key="item.id" :value="item.id">{{ item.label }}</option></select></label>
      <label class="form-field"><span>Estado</span><select v-model="form.estadoId"><option value="">Selecionar…</option><option v-for="item in lookups.estados" :key="item.id" :value="item.id">{{ item.label }}</option></select></label>
      <label class="form-field"><span>Data de lançamento</span><input v-model="form.dataLancamento" type="date"></label>
      <label class="form-field"><span>Classificação etária</span><input v-model.trim="form.classificacaoEtaria"></label>
    </div></fieldset>
    <fieldset><legend>Descrição</legend><div class="form-grid"><label class="form-field field-wide"><span>Tagline</span><input v-model="form.tagline"></label><label class="form-field field-wide"><span>Sinopse</span><textarea v-model="form.sinopse" rows="7" /></label><label class="form-field field-wide"><span>Notas pessoais</span><textarea v-model="form.notasPessoais" rows="4" /></label></div></fieldset>
    <fieldset><legend>Relações</legend><div class="form-grid"><LookupMultiSelect v-model="form.generoIds" label="Géneros" :options="lookups.generos" /><LookupMultiSelect v-model="form.tagIds" label="Tags" :options="lookups.tags" /><LookupMultiSelect v-model="form.idiomaIds" label="Idiomas" :options="lookups.idiomas" /><LookupMultiSelect v-model="form.paisIds" label="Países" :options="lookups.paises" /><LookupMultiSelect v-model="form.plataformaIds" label="Plataformas" :options="lookups.plataformas" /><LookupMultiSelect v-model="form.companhiaIds" label="Companhias" :options="lookups.companhias" /></div></fieldset>
    <fieldset><legend>Métricas e IDs</legend><div class="form-grid"><label class="form-field"><span>Avaliação</span><input v-model.number="form.rating" type="number" min="0" max="10" step=".1"></label><label class="form-field"><span>Duração (min)</span><input v-model.number="form.duracaoMin" type="number" min="0"></label><label class="form-field"><span>Páginas</span><input v-model.number="form.paginas" type="number" min="0"></label><label class="form-field"><span>Horas jogadas</span><input v-model.number="form.horasJogadas" type="number" min="0" step=".1"></label><label class="form-field"><span>TMDB ID</span><input v-model.number="form.tmdbId" type="number" min="1"></label><label class="form-field"><span>IMDb ID</span><input v-model="form.imdbId" placeholder="tt1234567"></label><label class="check-field"><input v-model="form.adulto" type="checkbox"> Conteúdo adulto</label><label class="check-field"><input v-model="form.canonico" type="checkbox"> Entrada canónica</label></div></fieldset>
    <div class="form-actions"><RouterLink class="button button-secondary" to="/catalogo">Cancelar</RouterLink><button class="button button-primary" :disabled="props.saving">{{ props.saving ? "A guardar…" : "Guardar título" }}</button></div>
  </form>
</template>
