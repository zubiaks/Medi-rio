<!--
  Projecto: Mediário
  Ficheiro: src/components/maintenance/SyncJobCreateDialog.vue
  Tipo: Diálogo Vue 3 com TypeScript
  Domínio: Providers e manutenção
-->
<script setup lang="ts">
import { ref, watch } from "vue";
import {
  createSyncJob,
  type CreateSyncJobInput,
} from "@/domain/providers/jobWorkflow";
import { writeAuditLog } from "@/domain/providers/audit";
import {
  EXTERNAL_PROVIDERS,
  SYNC_JOB_TYPES,
  type SyncJobRecord,
  type SyncJobType,
} from "@/domain/providers/records";

const props = defineProps<{
  open: boolean;
  jobs: SyncJobRecord[];
}>();
const emit = defineEmits<{ close: []; created: [SyncJobRecord] }>();

const type = ref<SyncJobType>("enriquecimento");
const provider = ref("");
const entity = ref("");
const entityId = ref("");
const total = ref<number | null>(null);
const details = ref("");
const saving = ref(false);
const error = ref("");

watch(() => props.open, (open) => {
  if (!open) return;
  type.value = "enriquecimento";
  provider.value = "";
  entity.value = "";
  entityId.value = "";
  total.value = null;
  details.value = "";
  error.value = "";
});

async function save(): Promise<void> {
  saving.value = true;
  error.value = "";

  try {
    let parsedDetails: unknown = null;
    if (details.value.trim()) {
      try {
        parsedDetails = JSON.parse(details.value);
      } catch {
        throw new Error("Os detalhes têm de conter JSON válido.");
      }
    }

    const input: CreateSyncJobInput = {
      tipo: type.value,
      provider: provider.value,
      entidade: entity.value,
      entidade_id: entityId.value,
      total: total.value || 0,
      detalhes: parsedDetails,
    };
    const job = await createSyncJob(input, props.jobs);

    await writeAuditLog({
      entidade: "sync_jobs",
      entidade_id: job.id,
      entidade_nome: `${job.provider} · ${job.tipo || "outro"}`,
      acao: "criar",
      origem: "manutencao",
      sucesso: true,
      detalhes: { tipo: job.tipo, provider: job.provider },
    });

    emit("created", job);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="dialog-backdrop"
      @click.self="!saving && emit('close')"
    >
      <section
        class="dialog-panel sync-job-create-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-job-create-title"
      >
        <form @submit.prevent="save">
          <div class="dialog-header">
            <div>
              <p class="eyebrow">Sincronizações</p>
              <h2 id="sync-job-create-title">Nova tarefa</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="emit('close')">×</button>
          </div>

          <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>

          <div class="form-grid">
            <label class="form-field">
              <span>Tipo *</span>
              <select v-model="type" required>
                <option v-for="item in SYNC_JOB_TYPES" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>
            <label class="form-field">
              <span>Provider *</span>
              <select v-model="provider" required>
                <option value="">Seleccionar</option>
                <option v-for="item in EXTERNAL_PROVIDERS" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>
            <label class="form-field">
              <span>Entidade</span>
              <input v-model.trim="entity" maxlength="80" placeholder="titulos, streams…" />
            </label>
            <label class="form-field">
              <span>Identificador da entidade</span>
              <input v-model.trim="entityId" maxlength="30" />
            </label>
            <label class="form-field">
              <span>Total previsto</span>
              <input v-model.number="total" type="number" min="0" step="1" />
            </label>
            <label class="form-field field-wide">
              <span>Detalhes técnicos (JSON)</span>
              <textarea v-model="details" rows="7" />
            </label>
          </div>

          <p class="field-hint">
            A criação da tarefa não executa pedidos externos no browser. O
            processamento deve ser feito por hooks ou rotas locais do PocketBase.
          </p>

          <div class="form-actions">
            <button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button>
            <button class="button button-primary" type="submit" :disabled="saving">{{ saving ? "A criar…" : "Criar tarefa" }}</button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
