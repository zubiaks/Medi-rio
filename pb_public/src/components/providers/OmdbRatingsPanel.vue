<!-- Mediário | Fase 8C: ratings múltiplos, diagnóstico e agendamento OMDb. -->
<script setup lang="ts">
import { computed, ref } from "vue";
import type { TitleRecord } from "@/types/records";
import type { OmdbDetails } from "@/domain/providers/omdbClient";
import { buildOmdbHealth, normalizeOmdbRatings } from "@/domain/providers/omdbRatings";
import { scheduleOmdbRefresh } from "@/domain/providers/omdbScheduler";
import type { SyncJobRecord } from "@/domain/providers/records";

const props = defineProps<{ title: TitleRecord; details: OmdbDetails; disabled?: boolean }>();
const emit = defineEmits<{ scheduled: [SyncJobRecord] }>();
const ratings = computed(() => normalizeOmdbRatings(props.details.ratings));
const health = computed(() => buildOmdbHealth(props.title, props.details));
const loading = ref(false);
const error = ref("");
const message = ref("");

async function schedule(): Promise<void> {
  loading.value = true;
  error.value = "";
  message.value = "";
  try {
    const job = await scheduleOmdbRefresh(props.title);
    message.value = "A atualização OMDb foi agendada.";
    emit("scheduled", job);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="omdb-ratings-panel" aria-labelledby="omdb-ratings-title">
    <div class="tmdb-enrichment-header">
      <div><p class="eyebrow">Fase 8C</p><h3 id="omdb-ratings-title">Ratings e diagnóstico OMDb</h3></div>
      <div class="omdb-health-score"><strong>{{ health.score }}%</strong><small>{{ health.completed }}/{{ health.total }}</small></div>
    </div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
    <dl class="omdb-rating-grid">
      <div><dt>IMDb</dt><dd>{{ ratings.imdb ?? "—" }} / 10</dd></div>
      <div><dt>Rotten Tomatoes</dt><dd>{{ ratings.rottenTomatoes ?? "—" }}%</dd></div>
      <div><dt>Metacritic</dt><dd>{{ ratings.metacritic ?? "—" }} / 100</dd></div>
    </dl>
    <ul class="omdb-health-list">
      <li v-for="item in health.items" :key="item.key" :class="{ 'is-ok': item.ok, 'is-required': item.required && !item.ok }">
        <span aria-hidden="true">{{ item.ok ? "✓" : "!" }}</span>
        <div><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></div>
      </li>
    </ul>
    <div class="form-actions">
      <button class="button button-secondary" type="button" :disabled="disabled || loading" @click="schedule">
        {{ loading ? "A agendar…" : "Agendar atualização OMDb" }}
      </button>
    </div>
  </section>
</template>
