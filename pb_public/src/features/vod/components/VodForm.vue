<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from "vue";
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { BaseRecord } from "@/types/records";
import {
  createEmptyVodForm,
  type VodFormData,
  type VodValidationErrors,
  VOD_TYPES,
} from "@/domain/vod/models";
import { validateVodForm } from "@/domain/vod/validation";
import VodTitleSearch from "./VodTitleSearch.vue";

type CountryRecord = BaseRecord & {
  nome?: string;
  codigo?: string;
};

const props = withDefaults(
  defineProps<{
    initialValue?: VodFormData | null;
    saving?: boolean;
    submitLabel?: string;
    cancelTo?: string;
  }>(),
  {
    initialValue: null,
    saving: false,
    submitLabel: "Guardar disponibilidade",
    cancelTo: "/vod",
  },
);

const emit = defineEmits<{
  submit: [VodFormData];
  dirtyChange: [boolean];
}>();

const countryRepository = new PocketBaseRepository<CountryRecord>("paises");

const form = ref<VodFormData>(createEmptyVodForm());
const countries = ref<CountryRecord[]>([]);
const errors = ref<VodValidationErrors>({});
const validationMessage = ref("");
const loading = ref(true);
const loadError = ref("");
const baseline = ref("");

const qualityOptions = [
  { value: "desconhecida", label: "Desconhecida" },
  { value: "sd", label: "SD" },
  { value: "hd", label: "HD" },
  { value: "fhd", label: "Full HD" },
  { value: "4k", label: "4K" },
  { value: "8k", label: "8K" },
  { value: "audio", label: "Áudio" },
] as const;

const typeLabels: Record<(typeof VOD_TYPES)[number], string> = {
  streaming: "Streaming",
  aluguer: "Aluguer",
  compra: "Compra",
  gratuito: "Gratuito",
  broadcast: "Emissão",
  biblioteca: "Biblioteca",
  fisico: "Físico",
  outro: "Outro",
};

function copyForm(value: VodFormData): VodFormData {
  return { ...toRaw(value) };
}

function signature(value: VodFormData): string {
  return JSON.stringify(copyForm(value));
}

watch(
  () => props.initialValue,
  (value) => {
    form.value = copyForm(value ?? createEmptyVodForm());
    errors.value = {};
    validationMessage.value = "";
    baseline.value = signature(form.value);
    emit("dirtyChange", false);
  },
  { immediate: true, deep: true },
);

watch(
  form,
  (value) => emit("dirtyChange", signature(value) !== baseline.value),
  { deep: true },
);

onMounted(async () => {
  try {
    const countryPage = await countryRepository.list({
      perPage: 500,
      sort: "nome",
    });

    countries.value = countryPage.items;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  } finally {
    loading.value = false;
  }
});

function submit(): void {
  errors.value = validateVodForm(form.value);
  const errorCount = Object.keys(errors.value).length;

  if (errorCount > 0) {
    validationMessage.value = `Corrige ${errorCount} campo${
      errorCount === 1 ? "" : "s"
    } antes de guardar.`;
    return;
  }

  validationMessage.value = "";
  emit("submit", copyForm(form.value));
}
</script>

<template>
  <section v-if="loading" class="page-loading">
    <span class="loader" />
    <p>A carregar opções…</p>
  </section>

  <div v-else-if="loadError" class="form-alert form-alert-error" role="alert">
    {{ loadError }}
  </div>

  <form v-else class="vod-form" novalidate @submit.prevent="submit">
    <div
      v-if="validationMessage"
      class="form-alert form-alert-error"
      role="alert"
      aria-live="assertive"
    >
      <strong>Não foi possível guardar.</strong>
      <p>{{ validationMessage }}</p>
      <ul>
        <li v-for="(message, field) in errors" :key="field">
          {{ message }}
        </li>
      </ul>
    </div>

    <fieldset>
      <legend>Oferta</legend>

      <div class="form-grid">
        <VodTitleSearch
          v-model="form.tituloId"
          :error="errors.tituloId"
        />

        <label class="form-field" for="vod-provider">
          <span>Provider *</span>
          <input
            id="vod-provider"
            v-model.trim="form.providerNome"
            name="provider_nome"
            maxlength="150"
            placeholder="Netflix, RTP Play, MUBI…"
          />
          <small v-if="errors.providerNome" class="field-error">
            {{ errors.providerNome }}
          </small>
        </label>

        <label class="form-field" for="vod-type">
          <span>Modalidade</span>
          <select id="vod-type" v-model="form.tipo" name="tipo">
            <option v-for="type in VOD_TYPES" :key="type" :value="type">
              {{ typeLabels[type] }}
            </option>
          </select>
        </label>

        <label class="form-field field-wide" for="vod-url">
          <span>URL</span>
          <input
            id="vod-url"
            v-model.trim="form.url"
            name="url"
            type="url"
            maxlength="2000"
            placeholder="https://…"
          />
          <small v-if="errors.url" class="field-error">
            {{ errors.url }}
          </small>
        </label>

        <label class="form-field" for="vod-country">
          <span>País</span>
          <select id="vod-country" v-model="form.paisId" name="pais">
            <option value="">Global / não definido</option>
            <option
              v-for="country in countries"
              :key="country.id"
              :value="country.id"
            >
              {{ country.nome || country.codigo || country.id }}
            </option>
          </select>
        </label>

        <label class="form-field" for="vod-quality">
          <span>Qualidade</span>
          <select id="vod-quality" v-model="form.qualidade" name="qualidade">
            <option value="">Não definida</option>
            <option
              v-for="quality in qualityOptions"
              :key="quality.value"
              :value="quality.value"
            >
              {{ quality.label }}
            </option>
          </select>
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Preço e validade</legend>

      <div class="form-grid">
        <label class="form-field" for="vod-price">
          <span>Preço</span>
          <input
            id="vod-price"
            v-model.number="form.preco"
            name="preco"
            type="number"
            min="0"
            step="0.01"
          />
          <small v-if="errors.preco" class="field-error">
            {{ errors.preco }}
          </small>
        </label>

        <label class="form-field" for="vod-currency">
          <span>Moeda</span>
          <input
            id="vod-currency"
            v-model.trim="form.moeda"
            name="moeda"
            maxlength="3"
            placeholder="EUR"
          />
          <small v-if="errors.moeda" class="field-error">
            {{ errors.moeda }}
          </small>
        </label>

        <label class="form-field" for="vod-start-date">
          <span>Disponível desde</span>
          <input
            id="vod-start-date"
            v-model="form.dataInicio"
            name="data_inicio"
            type="date"
          />
        </label>

        <label class="form-field" for="vod-end-date">
          <span>Disponível até</span>
          <input
            id="vod-end-date"
            v-model="form.dataFim"
            name="data_fim"
            type="date"
          />
          <small v-if="errors.dataFim" class="field-error">
            {{ errors.dataFim }}
          </small>
        </label>

        <label class="check-field" for="vod-subscription">
          <input
            id="vod-subscription"
            v-model="form.incluidoSubscricao"
            name="incluido_subscricao"
            type="checkbox"
          />
          Incluído na subscrição
        </label>

        <label class="check-field" for="vod-active">
          <input
            id="vod-active"
            v-model="form.ativo"
            name="ativo"
            type="checkbox"
          />
          Oferta ativa
        </label>
      </div>
    </fieldset>

    <div class="form-actions">
      <RouterLink class="button button-secondary" :to="props.cancelTo">
        Cancelar
      </RouterLink>
      <button class="button button-primary" :disabled="props.saving">
        {{ props.saving ? "A guardar…" : props.submitLabel }}
      </button>
    </div>
  </form>
</template>
