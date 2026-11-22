<!-- Mediário | Fase 6B: pré-visualização de pessoas e créditos TMDB. -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TmdbDetails } from "@/domain/providers/tmdbClient";
import { buildCreditPreview, type CreditGroup } from "@/domain/providers/tmdbCredits";
const props = defineProps<{ details: TmdbDetails; disabled?: boolean }>();
const emit = defineEmits<{ apply: [CreditGroup[]] }>();
const preview = computed(() => buildCreditPreview(props.details));
const selected = ref<CreditGroup[]>([]);
watch(preview, (value) => { selected.value = value.map((item) => item.group); }, { immediate: true });
</script>
<template>
  <section class="tmdb-credits" aria-labelledby="tmdb-credits-title">
    <div><p class="eyebrow">Pessoas e créditos</p><h3 id="tmdb-credits-title">Elenco, realização e argumento</h3></div>
    <div class="tmdb-credit-list"><label v-for="item in preview" :key="item.group" class="tmdb-credit-row"><input v-model="selected" type="checkbox" :value="item.group" /><span><strong>{{ item.label }}</strong><small>{{ item.values.slice(0, 12).join(" · ") }}<template v-if="item.values.length > 12"> · +{{ item.values.length - 12 }}</template></small></span></label></div>
    <div class="form-actions"><button class="button button-primary" type="button" :disabled="disabled || !selected.length" @click="emit('apply', selected)">Importar créditos selecionados</button></div>
  </section>
</template>
