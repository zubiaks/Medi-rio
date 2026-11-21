<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import type { BaseRecord } from "@/types/records";

type CountryRecord = BaseRecord & {
  nome?: string;
  codigo?: string;
};

withDefaults(
  defineProps<{
    countries: CountryRecord[];
  }>(),
  {
    countries: () => [],
  },
);

const emit = defineEmits<{
  clear: [];
}>();

const search = defineModel<string>("search", { required: true });
const country = defineModel<string>("country", { required: true });
const type = defineModel<string>("type", { required: true });
const quality = defineModel<string>("quality", { required: true });
const status = defineModel<string>("status", { required: true });
const subscription = defineModel<string>("subscription", { required: true });

const expanded = ref(false);

const typeOptions = [
  { value: "streaming", label: "Streaming" },
  { value: "aluguer", label: "Aluguer" },
  { value: "compra", label: "Compra" },
  { value: "gratuito", label: "Gratuito" },
  
  { value: "biblioteca", label: "Biblioteca" },
  { value: "fisico", label: "Físico" },
  { value: "outro", label: "Outro" },
] as const;

const qualityOptions = [
  { value: "desconhecida", label: "Desconhecida" },
  { value: "sd", label: "SD" },
  { value: "hd", label: "HD" },
  { value: "fhd", label: "Full HD" },
  { value: "4k", label: "4K" },
  { value: "8k", label: "8K" },
  { value: "audio", label: "Áudio" },
] as const;

const activeFilterCount = computed(() =>
  [
    search.value.trim(),
    country.value,
    type.value,
    quality.value,
    status.value !== "active" ? status.value : "",
    subscription.value,
  ].filter(Boolean).length,
);

const advancedSummary = computed(() => {
  const parts: string[] = [];

  if (country.value) parts.push("país");
  if (type.value) parts.push("modalidade");
  if (quality.value) parts.push("qualidade");
  if (status.value !== "active") parts.push("estado");
  if (subscription.value) parts.push("subscrição");

  return parts.length ? parts.join(", ") : "sem filtros avançados";
});

function clearSearch(): void {
  search.value = "";
}
</script>

<template>
  <section class="panel vod-filters" aria-labelledby="vod-filters-title">
    <div class="vod-filters-header">
      <div>
        <h2 id="vod-filters-title">Filtrar disponibilidades</h2>
        <p>
          {{ activeFilterCount }} filtro{{ activeFilterCount === 1 ? "" : "s" }} ativo{{ activeFilterCount === 1 ? "" : "s" }}
        </p>
      </div>

      <div class="vod-filter-header-actions">
        <button
          class="button button-secondary vod-filter-toggle"
          type="button"
          :aria-expanded="expanded"
          aria-controls="vod-advanced-filters"
          @click="expanded = !expanded"
        >
          {{ expanded ? "Ocultar filtros" : "Mais filtros" }}
        </button>

        <button
          v-if="activeFilterCount"
          class="button button-secondary"
          type="button"
          @click="emit('clear')"
        >
          Limpar ({{ activeFilterCount }})
        </button>
      </div>
    </div>

    <div class="vod-primary-filter">
      <label class="form-field" for="vod-filter-search">
        <span>Pesquisar</span>
        <div class="vod-search-control">
          <input
            id="vod-filter-search"
            v-model="search"
            name="vod_filter_search"
            type="search"
            autocomplete="off"
            placeholder="Título ou provider"
          />
          <button
            v-if="search"
            class="button button-secondary"
            type="button"
            aria-label="Limpar pesquisa"
            @click="clearSearch"
          >
            ×
          </button>
        </div>
      </label>
    </div>

    <p class="vod-filter-summary">
      {{ advancedSummary }}
    </p>

    <div
      id="vod-advanced-filters"
      class="vod-filter-grid vod-advanced-filters"
      :class="{ 'is-expanded': expanded }"
    >
      <label class="form-field" for="vod-filter-country">
        <span>País</span>
        <select id="vod-filter-country" v-model="country" name="vod_filter_country">
          <option value="">Todos os países</option>
          <option
            v-for="countryOption in countries"
            :key="countryOption.id"
            :value="countryOption.id"
          >
            {{ countryOption.nome || countryOption.codigo || countryOption.id }}
          </option>
        </select>
      </label>

      <label class="form-field" for="vod-filter-type">
        <span>Modalidade</span>
        <select id="vod-filter-type" v-model="type" name="vod_filter_type">
          <option value="">Todas as modalidades</option>
          <option
            v-for="option in typeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="form-field" for="vod-filter-quality">
        <span>Qualidade</span>
        <select
          id="vod-filter-quality"
          v-model="quality"
          name="vod_filter_quality"
        >
          <option value="">Todas as qualidades</option>
          <option
            v-for="option in qualityOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="form-field" for="vod-filter-status">
        <span>Estado</span>
        <select id="vod-filter-status" v-model="status" name="vod_filter_status">
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
          <option value="all">Ativas e inativas</option>
          <option value="expired">Expiradas</option>
        </select>
      </label>

      <label class="form-field" for="vod-filter-subscription">
        <span>Subscrição</span>
        <select
          id="vod-filter-subscription"
          v-model="subscription"
          name="vod_filter_subscription"
        >
          <option value="">Todas as ofertas</option>
          <option value="yes">Incluídas na subscrição</option>
          <option value="no">Não incluídas</option>
        </select>
      </label>
    </div>
  </section>
</template>


