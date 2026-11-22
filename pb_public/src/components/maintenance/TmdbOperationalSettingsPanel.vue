<!--
  Projeto: Mediário
  Caminho: src/components/maintenance/TmdbOperationalSettingsPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / configuração operacional TMDB
  Finalidade: Editar limites seguros sem mostrar credenciais.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  loadTmdbOperationalSettings,
  normalizeTmdbOperationalSettings,
  saveTmdbOperationalSettings,
  TMDB_OPERATIONAL_DEFAULTS,
  type TmdbOperationalSettings,
} from "@/domain/providers/tmdbOperationalSettings";

const form = ref<TmdbOperationalSettings>({ ...TMDB_OPERATIONAL_DEFAULTS });
const loading = ref(false);
const error = ref("");
const message = ref("");

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try { form.value = await loadTmdbOperationalSettings(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

function restoreDefaults(): void {
  form.value = { ...TMDB_OPERATIONAL_DEFAULTS };
  message.value = "Valores recomendados repostos. Guarda para aplicar.";
}

async function save(): Promise<void> {
  loading.value = true;
  error.value = "";
  message.value = "";
  try {
    form.value = normalizeTmdbOperationalSettings(form.value);
    await saveTmdbOperationalSettings(form.value);
    message.value = "Configuração operacional TMDB guardada.";
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

onMounted(load);
</script>

<template>
  <section class="tmdb-operational-settings" aria-labelledby="tmdb-settings-title">
    <div class="tmdb-operational-settings-header">
      <div><p class="eyebrow">Fase 6O</p><h3 id="tmdb-settings-title">Limites operacionais TMDB</h3></div>
      <button class="button button-secondary" type="button" :disabled="loading" @click="restoreDefaults">Repor recomendados</button>
    </div>
    <p>Esta configuração não apresenta nem altera a chave TMDB.</p>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="message" class="form-alert" role="status">{{ message }}</div>
    <div class="tmdb-operational-grid">
      <label class="form-field"><span>Dias até ficar desatualizado</span><input v-model.number="form.staleDays" type="number" min="1" max="365" /></label>
      <label class="form-field"><span>Minutos até tarefa bloqueada</span><input v-model.number="form.stuckMinutes" type="number" min="5" max="240" /></label>
      <label class="form-field"><span>Tarefas por lote</span><input v-model.number="form.batchDefault" type="number" min="1" max="25" /></label>
      <label class="form-field"><span>Máximo por lote</span><input v-model.number="form.batchMax" type="number" min="1" max="50" /></label>
      <label class="form-field"><span>Créditos por título</span><input v-model.number="form.castLimit" type="number" min="1" max="200" /></label>
      <label class="form-field"><span>Imagens por categoria</span><input v-model.number="form.imagesLimit" type="number" min="1" max="100" /></label>
      <label class="form-field"><span>Pedidos por minuto</span><input v-model.number="form.requestsPerMinute" type="number" min="1" max="40" /></label>
      <label class="form-field"><span>Títulos por execução global</span><input v-model.number="form.catalogueRunLimit" type="number" min="1" max="100" /></label>
      <label class="form-field"><span>Repetições automáticas</span><input v-model.number="form.retries" type="number" min="0" max="5" /></label>
      <label class="form-field"><span>Idioma principal</span><input v-model.trim="form.defaultLanguage" maxlength="10" /></label>
      <label class="form-field"><span>Idioma alternativo</span><input v-model.trim="form.fallbackLanguage" maxlength="10" /></label>
    </div>
    <div class="form-actions"><button class="button button-primary" type="button" :disabled="loading" @click="save">{{ loading ? "A guardar…" : "Guardar limites" }}</button></div>
  </section>
</template>
