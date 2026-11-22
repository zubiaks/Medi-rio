<!-- Mediário | Fase 6D: importação controlada de títulos alternativos TMDB. -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TitleRecord } from "@/types/records";
import type { TmdbAlternativeTitle, TmdbDetails } from "@/domain/providers/tmdbClient";
import { buildAlternativeTitlePreview, importAlternativeTitles } from "@/domain/providers/tmdbAlternativeTitles";
const props = defineProps<{ title: TitleRecord; details: TmdbDetails; disabled?: boolean }>();
const emit = defineEmits<{ imported: [{ created: number; skipped: number }] }>();
const options = computed(() => buildAlternativeTitlePreview(props.details));
const selected = ref<TmdbAlternativeTitle[]>([]);
const country = ref("");
const loading = ref(false);
const error = ref("");
const countries = computed(() => [...new Set(options.value.map((item) => item.country).filter(Boolean))].sort());
const visible = computed(() => country.value ? options.value.filter((item) => item.country === country.value) : options.value);
watch(options, (value) => { selected.value = value.filter((item) => ["PT", "US", "GB"].includes(item.country)).slice(0, 20); }, { immediate: true });
async function apply(): Promise<void> { loading.value = true; error.value = ""; try { emit("imported", await importAlternativeTitles(props.title, selected.value)); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
</script>
<template>
  <section class="tmdb-alternative-titles" aria-labelledby="tmdb-alternative-titles-title">
    <div><p class="eyebrow">Localização e aliases</p><h3 id="tmdb-alternative-titles-title">Títulos alternativos</h3></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <label class="form-field tmdb-country-filter"><span>Filtrar por país</span><select v-model="country"><option value="">Todos</option><option v-for="item in countries" :key="item" :value="item">{{ item }}</option></select></label>
    <div class="tmdb-alternative-title-list"><label v-for="item in visible" :key="`${item.country}-${item.name}`" class="tmdb-alternative-title-row"><input v-model="selected" type="checkbox" :value="item" /><span><strong>{{ item.name }}</strong><small>{{ item.country || "Sem país" }}<template v-if="item.type"> · {{ item.type }}</template></small></span></label></div>
    <div class="form-actions"><button class="button button-primary" type="button" :disabled="disabled || loading || !selected.length" @click="apply">Importar {{ selected.length }} título{{ selected.length === 1 ? "" : "s" }}</button></div>
  </section>
</template>
