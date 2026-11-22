<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbSyncSchedulerPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / agendamento TMDB
  Finalidade: Criar tarefas de atualização sem duplicados ativos.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import type { TitleRecord } from "@/types/records";
import type { SyncJobRecord } from "@/domain/providers/records";
import { evaluateTmdbSyncNeed, scheduleTmdbRefresh } from "@/domain/providers/tmdbSyncScheduler";

const props = defineProps<{ title: TitleRecord; disabled?: boolean }>();
const emit = defineEmits<{ scheduled: [SyncJobRecord] }>();
const status = computed(() => evaluateTmdbSyncNeed(props.title));
const force = ref(false);
const loading = ref(false);
const error = ref("");
const success = ref("");

async function schedule(): Promise<void> {
  loading.value = true;
  error.value = "";
  success.value = "";
  try {
    const job = await scheduleTmdbRefresh(props.title, force.value);
    success.value = "A tarefa de atualização TMDB foi criada.";
    emit("scheduled", job);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="tmdb-sync-scheduler" aria-labelledby="tmdb-sync-scheduler-title">
    <div class="tmdb-sync-scheduler-header">
      <div>
        <p class="eyebrow">Atualização programada</p>
        <h3 id="tmdb-sync-scheduler-title">Agendar nova sincronização</h3>
      </div>
      <span class="tmdb-sync-badge" :class="`is-${status.need}`">
        {{ status.label }}
      </span>
    </div>

    <p>{{ status.detail }}</p>

    <div v-if="error" class="form-alert form-alert-error" role="alert">
      {{ error }}
    </div>
    <div v-if="success" class="form-alert" role="status">
      {{ success }}
    </div>

    <label v-if="!status.recommended" class="check-field">
      <input v-model="force" type="checkbox" />
      Agendar mesmo com a sincronização atual
    </label>

    <div class="form-actions">
      <button
        class="button button-primary"
        type="button"
        :disabled="disabled || loading || (!status.recommended && !force)"
        @click="schedule"
      >
        {{ loading ? "A agendar…" : "Agendar atualização TMDB" }}
      </button>
    </div>
  </section>
</template>
