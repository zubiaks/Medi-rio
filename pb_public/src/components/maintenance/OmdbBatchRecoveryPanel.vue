<!-- Mediário | Fase 8E: lote e recuperação OMDb. -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { executeOmdbBatch, listRecoverableOmdbJobs, retryOmdbJobs } from "@/domain/providers/omdbBatchRecovery";
import type { SyncJobRecord } from "@/domain/providers/records";
const limit = ref(10);
const running = ref(false);
const cancelRequested = ref(false);
const processed = ref(0);
const total = ref(0);
const recoverable = ref<SyncJobRecord[]>([]);
const selected = ref<string[]>([]);
const error = ref("");
const message = ref("");

async function load(): Promise<void> {
  try { recoverable.value = await listRecoverableOmdbJobs(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
}

async function run(): Promise<void> {
  running.value = true; cancelRequested.value = false; processed.value = 0; error.value = ""; message.value = "";
  try {
    const result = await executeOmdbBatch(limit.value, () => cancelRequested.value, (done, count) => { processed.value = done; total.value = count; });
    message.value = `${result.succeeded} sucessos, ${result.failed} falhas${result.cancelled ? ", cancelado" : ""}.`;
    await load();
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { running.value = false; }
}

async function retry(): Promise<void> {
  running.value = true; error.value = "";
  try {
    const count = await retryOmdbJobs(recoverable.value.filter((job) => selected.value.includes(job.id)));
    message.value = `${count} tarefa(s) OMDb repetida(s).`;
    selected.value = [];
    await load();
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { running.value = false; }
}
onMounted(load);
</script>
<template>
  <section class="omdb-batch-recovery" aria-labelledby="omdb-batch-title">
    <div><p class="eyebrow">Operação OMDb</p><h3 id="omdb-batch-title">Lote e recuperação</h3></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div><div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
    <div class="omdb-batch-controls"><label class="form-field"><span>Máximo por lote</span><input v-model.number="limit" type="number" min="1" max="25" /></label><button class="button button-primary" type="button" :disabled="running" @click="run">Executar lote</button><button v-if="running" class="button button-secondary" type="button" @click="cancelRequested = true">Parar depois da atual</button></div>
    <p v-if="running">{{ processed }}/{{ total }} processadas</p>
    <h4>Tarefas recuperáveis</h4>
    <p v-if="!recoverable.length">Não existem falhas OMDb recuperáveis.</p>
    <ul v-else class="omdb-recovery-list"><li v-for="job in recoverable" :key="job.id"><input v-model="selected" type="checkbox" :value="job.id" /><span><strong>{{ job.entidade_id }}</strong><small>{{ job.estado }} · {{ job.erro || "Sem erro" }}</small></span></li></ul>
    <div class="form-actions"><button class="button button-secondary" type="button" :disabled="running || !selected.length" @click="retry">Repetir selecionadas</button></div>
  </section>
</template>
