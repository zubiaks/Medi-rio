<!-- Mediário | Fase 8F: métricas comparativas TMDB e OMDb. -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  buildProviderMetric,
  loadAllProviderJobs,
  type OperationalProvider,
} from "@/domain/providers/providerOperations";
import type { SyncJobRecord } from "@/domain/providers/records";

const jobs = ref<SyncJobRecord[]>([]);
const loading = ref(false);
const error = ref("");
const providers: OperationalProvider[] = ["tmdb", "omdb"];
const metrics = computed(() =>
  providers.map((provider) => buildProviderMetric(provider, jobs.value)),
);

function duration(value: number): string {
  if (!value) return "—";
  return value < 60 ? `${value} s` : `${Math.round(value / 60)} min`;
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try { jobs.value = await loadAllProviderJobs(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

onMounted(load);
</script>

<template>
  <section class="provider-operations-dashboard" aria-labelledby="provider-operations-title">
    <div class="tmdb-operations-header">
      <div><p class="eyebrow">Visão transversal</p><h3 id="provider-operations-title">Saúde dos providers</h3></div>
      <button class="button button-secondary" type="button" :disabled="loading" @click="load">Atualizar métricas</button>
    </div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div class="provider-metric-grid">
      <article v-for="metric in metrics" :key="metric.provider" class="provider-metric-card">
        <header><h4>{{ metric.provider.toUpperCase() }}</h4><strong>{{ metric.successRate }}%</strong></header>
        <dl>
          <div><dt>Pendentes</dt><dd>{{ metric.pending }}</dd></div>
          <div><dt>Em execução</dt><dd>{{ metric.running }}</dd></div>
          <div><dt>Concluídas</dt><dd>{{ metric.completed }}</dd></div>
          <div><dt>Falharam</dt><dd>{{ metric.failed }}</dd></div>
          <div><dt>Bloqueadas</dt><dd>{{ metric.stuck }}</dd></div>
          <div><dt>Duração média</dt><dd>{{ duration(metric.averageDurationSeconds) }}</dd></div>
        </dl>
      </article>
    </div>
  </section>
</template>
