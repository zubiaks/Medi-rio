<!-- Diálogo de criação e edição de avaliações. -->
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { titleRepository, tagRepository } from "@/domain/repositories";
import { reviewRepository } from "@/domain/diary/repository";
import { createReviewForm, hasErrors, validateReview, type ReviewErrors } from "@/domain/diary/validation";
import type { ReviewRecord } from "@/domain/diary/records";
import type { NamedRecord, TitleRecord } from "@/types/records";

const props = defineProps<{ open: boolean; review: ReviewRecord | null }>();
const emit = defineEmits<{ close: []; saved: [ReviewRecord] }>();
const form = ref(createReviewForm());
const errors = ref<ReviewErrors>({});
const submitError = ref("");
const saving = ref(false);
const titleQuery = ref("");
const results = ref<TitleRecord[]>([]);
const tags = ref<NamedRecord[]>([]);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(() => [props.open, props.review] as const, async ([open, review]) => {
  if (!open) return;
  form.value = createReviewForm(review);
  errors.value = {};
  submitError.value = "";
  titleQuery.value = review?.expand?.titulo?.titulo || "";
  tags.value = (await tagRepository.list({ page: 1, perPage: 300, filter: "ativo = true", sort: "ordem,nome" })).items;
}, { immediate: true });

watch(titleQuery, value => {
  if (timer) clearTimeout(timer);
  if (value.trim().length < 2) { results.value = []; return; }
  timer = setTimeout(async () => {
    const slash = String.fromCharCode(92);
    const escaped = value.trim().split(slash).join(slash + slash).split('"').join(slash + '"');
    results.value = (await titleRepository.list({ page: 1, perPage: 20, filter: `apagado = false && (titulo ~ "${escaped}" || titulo_original ~ "${escaped}")`, sort: "titulo" })).items;
  }, 300);
});

function selectTitle(title: TitleRecord): void {
  form.value.titulo = title.id;
  titleQuery.value = `${title.titulo}${title.ano ? ` (${title.ano})` : ""}`;
  results.value = [];
}

async function save(): Promise<void> {
  errors.value = validateReview(form.value);
  await nextTick();
  if (hasErrors(errors.value)) return;
  saving.value = true;
  submitError.value = "";
  try {
    const payload = {
      ...form.value,
      titulo_review: form.value.titulo_review.trim(),
      texto: form.value.texto.trim(),
      data_publicacao: form.value.estado_publicacao === "Publicado"
        ? form.value.data_publicacao || new Date().toISOString().slice(0, 10)
        : form.value.data_publicacao,
    };
    const saved = props.review
      ? await reviewRepository.update(props.review.id, payload)
      : await reviewRepository.create(payload);
    emit("saved", saved);
  } catch (cause) {
    submitError.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
</script>
<template><Teleport to="body"><div v-if="open" class="dialog-backdrop" @click.self="!saving && emit('close')"><section class="dialog-panel review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-dialog-title"><form @submit.prevent="save"><div class="dialog-header"><div><p class="eyebrow">Avaliações</p><h2 id="review-dialog-title">{{ review ? "Editar avaliação" : "Nova avaliação" }}</h2></div><button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="emit('close')">×</button></div><div v-if="submitError" class="form-alert form-alert-error" role="alert">{{submitError}}</div><div class="form-grid"><label class="form-field field-wide"><span>Título do catálogo *</span><input v-model.trim="titleQuery" type="search"/><small v-if="errors.titulo" class="field-error">{{errors.titulo}}</small></label><ul v-if="results.length" class="diary-title-results field-wide"><li v-for="title in results" :key="title.id"><button type="button" @click="selectTitle(title)">{{title.titulo}} <span>{{title.ano||'—'}}</span></button></li></ul><label class="form-field field-wide"><span>Título da avaliação</span><input v-model="form.titulo_review" maxlength="200"/></label><label class="form-field"><span>Classificação (0–10)</span><input v-model.number="form.rating" type="number" min="0" max="10" step="0.5"/><small v-if="errors.rating" class="field-error">{{errors.rating}}</small></label><label class="form-field"><span>Estado</span><select v-model="form.estado_publicacao"><option>Rascunho</option><option>Publicado</option><option>Arquivado</option></select></label><label class="form-field"><span>Data de consumo</span><input v-model="form.data_visto" type="date"/></label><label class="form-field"><span>Data de publicação</span><input v-model="form.data_publicacao" type="date"/></label><fieldset class="lookup-multi field-wide"><legend>Etiquetas</legend><label v-for="tag in tags" :key="tag.id" class="check-field"><input v-model="form.tags_review" type="checkbox" :value="tag.id"/> {{tag.nome}}</label></fieldset><label class="form-field field-wide"><span>Texto</span><textarea v-model="form.texto" rows="10" maxlength="20000"/><small v-if="errors.texto" class="field-error">{{errors.texto}}</small></label><label class="check-field"><input v-model="form.tem_spoilers" type="checkbox"/> Contém spoilers</label><label class="check-field"><input v-model="form.recomenda" type="checkbox"/> Recomendo</label><label class="check-field"><input v-model="form.favorito" type="checkbox"/> Favorita</label></div><div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button><button class="button button-primary" type="submit" :disabled="saving">{{saving?'A guardar…':'Guardar avaliação'}}</button></div></form></section></div></Teleport></template>
