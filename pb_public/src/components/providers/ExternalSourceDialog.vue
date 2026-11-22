<!--
  Projeto: Mediário
  Ficheiro: src/components/providers/ExternalSourceDialog.vue
  Tipo: Diálogo Vue 3 com TypeScript
  Domínio: Providers
-->
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { titleRepository } from "@/domain/repositories";
import { externalSourceRepository } from "@/domain/providers/repository";
import {
  EXTERNAL_PROVIDERS,
  type ExternalSourceRecord,
} from "@/domain/providers/records";
import {
  createExternalSourceForm,
  findExternalSourceDuplicate,
  validateExternalSource,
  type ExternalSourceErrors,
} from "@/domain/providers/validation";
import type { TitleRecord } from "@/types/records";

const props = defineProps<{
  open: boolean;
  source: ExternalSourceRecord | null;
  existing: ExternalSourceRecord[];
}>();
const emit = defineEmits<{ close: []; saved: [ExternalSourceRecord] }>();
const form = ref(createExternalSourceForm());
const errors = ref<ExternalSourceErrors>({});
const submitError = ref("");
const saving = ref(false);
const titleQuery = ref("");
const results = ref<TitleRecord[]>([]);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(() => [props.open, props.source] as const, ([open, source]) => {
  if (!open) return;
  form.value = createExternalSourceForm(source);
  titleQuery.value = source?.expand?.titulo?.titulo || "";
  results.value = [];
  errors.value = {};
  submitError.value = "";
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
  errors.value = validateExternalSource(form.value);
  const duplicate = findExternalSourceDuplicate(form.value, props.existing, props.source?.id);
  if (duplicate) submitError.value = "Já existe uma fonte com o mesmo provider, identificador e tipo externo.";
  await nextTick();
  if (Object.keys(errors.value).length || duplicate) return;
  saving.value = true;
  submitError.value = "";
  try {
    const payload = {
      titulo: form.value.titulo,
      provider: form.value.provider,
      external_id: form.value.external_id.trim(),
      external_url: form.value.external_url.trim(),
      tipo_externo: form.value.tipo_externo.trim(),
      principal: form.value.principal,
      ultima_sincronizacao: form.value.ultima_sincronizacao
        ? new Date(form.value.ultima_sincronizacao).toISOString()
        : "",
      metadata_extra: form.value.metadata_extra.trim()
        ? JSON.parse(form.value.metadata_extra)
        : null,
    };
    const saved = props.source
      ? await externalSourceRepository.update(props.source.id, payload)
      : await externalSourceRepository.create(payload);
    emit("saved", saved);
  } catch (cause) {
    submitError.value = cause instanceof Error ? cause.message : String(cause);
  } finally { saving.value = false; }
}
</script>
<template><Teleport to="body"><div v-if="open" class="dialog-backdrop" @click.self="!saving && emit('close')"><section class="dialog-panel external-source-dialog" role="dialog" aria-modal="true" aria-labelledby="external-source-title"><form @submit.prevent="save"><div class="dialog-header"><div><p class="eyebrow">Provider externo</p><h2 id="external-source-title">{{source?'Editar fonte':'Nova fonte externa'}}</h2></div><button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="emit('close')">×</button></div><div v-if="submitError" class="form-alert form-alert-error" role="alert">{{submitError}}</div><div class="form-grid"><label class="form-field field-wide"><span>Título *</span><input v-model.trim="titleQuery" type="search"/><small v-if="errors.titulo" class="field-error">{{errors.titulo}}</small></label><ul v-if="results.length" class="provider-title-results field-wide"><li v-for="title in results" :key="title.id"><button type="button" @click="selectTitle(title)">{{title.titulo}} <span>{{title.ano||'—'}}</span></button></li></ul><label class="form-field"><span>Provider *</span><select v-model="form.provider"><option value="">Seleccionar</option><option v-for="provider in EXTERNAL_PROVIDERS" :key="provider" :value="provider">{{provider}}</option></select></label><label class="form-field"><span>Identificador externo *</span><input v-model="form.external_id" maxlength="200"/></label><label class="form-field"><span>Tipo externo</span><input v-model="form.tipo_externo" maxlength="80" placeholder="movie, tv, game…"/></label><label class="form-field"><span>Última sincronização</span><input v-model="form.ultima_sincronizacao" type="datetime-local"/></label><label class="form-field field-wide"><span>Endereço externo</span><input v-model="form.external_url" type="url" maxlength="2000"/><small v-if="errors.external_url" class="field-error">{{errors.external_url}}</small></label><label class="check-field field-wide"><input v-model="form.principal" type="checkbox"/> Fonte principal deste provider</label><label class="form-field field-wide"><span>Metadados adicionais (JSON)</span><textarea v-model="form.metadata_extra" rows="7"/><small v-if="errors.metadata_extra" class="field-error">{{errors.metadata_extra}}</small></label></div><div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button><button class="button button-primary" type="submit" :disabled="saving">{{saving?'A guardar…':'Guardar fonte'}}</button></div></form></section></div></Teleport></template>
