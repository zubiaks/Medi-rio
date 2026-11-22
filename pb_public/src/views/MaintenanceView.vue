<!--
  Projeto: Mediário
  Ficheiro: src/views/MaintenanceView.vue
  Versão do ficheiro: 2.0.0
  Tipo: Página Vue 3 com TypeScript
  Domínio: Providers e manutenção
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import AuditLogPanel from "@/components/maintenance/AuditLogPanel.vue";
import IncompleteRecordsPanel from "@/components/maintenance/IncompleteRecordsPanel.vue";
import ProviderSettingsPanel from "@/components/maintenance/ProviderSettingsPanel.vue";
import SyncJobCreateDialog from "@/components/maintenance/SyncJobCreateDialog.vue";
import SyncJobDetailDialog from "@/components/maintenance/SyncJobDetailDialog.vue";
import SyncJobPanel from "@/components/maintenance/SyncJobPanel.vue";
import {
  detectIncompleteSources,
  detectIncompleteTitles,
  detectStuckJobs,
} from "@/domain/maintenance/diagnostics";
import {
  auditLogRepository,
  externalSourceRepository,
  syncJobRepository,
} from "@/domain/providers/repository";
import { titleRepository } from "@/domain/repositories";
import type {
  AuditLogRecord,
  ExternalSourceRecord,
  SyncJobRecord,
} from "@/domain/providers/records";
import type { TitleRecord } from "@/types/records";

const jobs = ref<SyncJobRecord[]>([]);
const logs = ref<AuditLogRecord[]>([]);
const sources = ref<ExternalSourceRecord[]>([]);
const titles = ref<TitleRecord[]>([]);
const loading = ref(true);
const error = ref("");
const createOpen = ref(false);
const selectedJob = ref<SyncJobRecord | null>(null);

const issues = computed(() => [
  ...detectStuckJobs(jobs.value),
  ...detectIncompleteSources(sources.value),
  ...detectIncompleteTitles(titles.value),
]);

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    const [jobsResult, logsResult, sourcesResult, titlesResult] =
      await Promise.all([
        syncJobRepository.list({ page: 1, perPage: 500, sort: "-iniciado_em" }),
        auditLogRepository.list({ page: 1, perPage: 500, sort: "-created" }),
        externalSourceRepository.list({ page: 1, perPage: 500, sort: "provider" }),
        titleRepository.list({ page: 1, perPage: 500, filter: "apagado = false", sort: "titulo" }),
      ]);

    jobs.value = jobsResult.items;
    logs.value = logsResult.items;
    sources.value = sourcesResult.items;
    titles.value = titlesResult.items;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

function handleJobCreated(job: SyncJobRecord): void {
  createOpen.value = false;
  jobs.value = [job, ...jobs.value];
}

function handleJobChanged(job: SyncJobRecord): void {
  jobs.value = jobs.value.map((item) => (item.id === job.id ? job : item));
  selectedJob.value = job;
}

onMounted(load);
</script>

<template>
  <BasePageHeader
    eyebrow="Operações técnicas"
    title="Manutenção"
    description="Tarefas, configuração segura, auditoria e diagnóstico de dados."
  >
    <template #actions>
      <button class="button button-secondary" type="button" :disabled="loading" @click="load">Actualizar diagnóstico</button>
      <button class="button button-primary" type="button" @click="createOpen = true">＋ Nova tarefa</button>
    </template>
  </BasePageHeader>

  <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
  <p v-if="loading" class="page-loading" aria-live="polite">A carregar manutenção…</p>

  <template v-else>
    <ProviderSettingsPanel />
    <IncompleteRecordsPanel :issues="issues" />
    <SyncJobPanel :jobs="jobs" @row-click="selectedJob = $event" />
    <AuditLogPanel :items="logs" />
  </template>

  <SyncJobCreateDialog
    :open="createOpen"
    :jobs="jobs"
    @close="createOpen = false"
    @created="handleJobCreated"
  />

  <SyncJobDetailDialog
    :job="selectedJob"
    :jobs="jobs"
    @close="selectedJob = null"
    @changed="handleJobChanged"
    @error="error = $event"
  />
</template>
