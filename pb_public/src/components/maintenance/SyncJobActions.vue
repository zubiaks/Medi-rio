<script setup lang="ts">
import {
  cancelSyncJob,
  repeatSyncJob,
  startSyncJob,
} from "@/domain/providers/jobWorkflow";
import { writeAuditLog } from "@/domain/providers/audit";
import type { SyncJobRecord } from "@/domain/providers/records";

const props = defineProps<{ job: SyncJobRecord; jobs: SyncJobRecord[] }>();
const emit = defineEmits<{ changed: [SyncJobRecord]; error: [string] }>();

async function run(action: "start" | "cancel" | "repeat"): Promise<void> {
  try {
    const saved = action === "start"
      ? await startSyncJob(props.job)
      : action === "cancel"
        ? await cancelSyncJob(props.job)
        : await repeatSyncJob(props.job, props.jobs);

    await writeAuditLog({
      entidade: "sync_jobs",
      entidade_id: saved.id,
      entidade_nome: `${saved.provider} · ${saved.tipo || "outro"}`,
      acao: action === "start" ? "sincronizar" : action === "cancel" ? "editar" : "criar",
      origem: action === "start" ? "sincronizacao" : "manutencao",
      sucesso: true,
      detalhes: { operacao: action, tarefa_anterior: props.job.id },
    });
    emit("changed", saved);
  } catch (cause) {
    emit("error", cause instanceof Error ? cause.message : String(cause));
  }
}
</script>

<template>
  <div class="sync-job-actions">
    <button v-if="job.estado === 'pendente'" class="button button-primary" type="button" @click="run('start')">Iniciar</button>
    <button v-if="job.estado === 'pendente' || job.estado === 'em_execucao'" class="button button-secondary" type="button" @click="run('cancel')">Cancelar</button>
    <button v-if="['falhou', 'parcial', 'cancelado'].includes(job.estado || '')" class="button button-secondary" type="button" @click="run('repeat')">Repetir</button>
  </div>
</template>
