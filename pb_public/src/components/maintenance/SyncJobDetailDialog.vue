<script setup lang="ts">
import { computed } from "vue";
import { jobDurationSeconds } from "@/domain/providers/jobWorkflow";
import type { SyncJobRecord } from "@/domain/providers/records";
import SyncJobActions from "./SyncJobActions.vue";

const props = defineProps<{ job: SyncJobRecord | null; jobs: SyncJobRecord[] }>();
const emit = defineEmits<{ close: []; changed: [SyncJobRecord]; error: [string] }>();
const duration = computed(() => props.job ? jobDurationSeconds(props.job) : 0);
</script>

<template>
  <Teleport to="body">
    <div v-if="job" class="dialog-backdrop" @click.self="emit('close')">
      <section class="dialog-panel sync-job-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="sync-job-detail-title">
        <div class="dialog-header">
          <div><p class="eyebrow">{{ job.estado || "Sem estado" }}</p><h2 id="sync-job-detail-title">{{ job.provider }} · {{ job.tipo || "outro" }}</h2></div>
          <button class="icon-button" type="button" aria-label="Fechar" @click="emit('close')">×</button>
        </div>
        <dl class="sync-job-facts">
          <div><dt>Entidade</dt><dd>{{ job.entidade || "—" }}</dd></div>
          <div><dt>Identificador</dt><dd>{{ job.entidade_id || "—" }}</dd></div>
          <div><dt>Duração</dt><dd>{{ duration }} segundos</dd></div>
          <div><dt>Processados</dt><dd>{{ job.processados || 0 }} / {{ job.total || 0 }}</dd></div>
          <div><dt>Sucessos</dt><dd>{{ job.sucessos || 0 }}</dd></div>
          <div><dt>Falhas</dt><dd>{{ job.falhas || 0 }}</dd></div>
        </dl>
        <div v-if="job.erro" class="form-alert form-alert-error">{{ job.erro }}</div>
        <pre v-if="job.detalhes" class="technical-details">{{ JSON.stringify(job.detalhes, null, 2) }}</pre>
        <SyncJobActions :job="job" :jobs="jobs" @changed="emit('changed', $event)" @error="emit('error', $event)" />
      </section>
    </div>
  </Teleport>
</template>
