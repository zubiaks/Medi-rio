<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  loadProviderSettingStatuses,
  type ProviderSettingStatus,
} from "@/domain/providers/settings";

const statuses = ref<ProviderSettingStatus[]>([]);
const loading = ref(true);
const error = ref("");

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    statuses.value = await loadProviderSettingStatuses();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="panel provider-settings" aria-labelledby="provider-settings-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Configuração segura</p>
        <h2 id="provider-settings-title">Chaves dos providers</h2>
      </div>
      <button class="button button-secondary" type="button" :disabled="loading" @click="load">Actualizar estado</button>
    </div>

    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <p v-if="loading" aria-live="polite">A verificar configuração…</p>
    <ul v-else class="provider-settings-list">
      <li v-for="item in statuses" :key="item.key">
        <strong>{{ item.label }}</strong>
        <span :class="item.configured ? 'status-success' : 'status-warning'">
          {{ item.configured ? "Configurado" : "Não configurado" }}
        </span>
      </li>
    </ul>
    <p class="field-hint">
      Os valores nunca são apresentados nem guardados no browser. A alteração
      de segredos continua reservada à administração local do PocketBase.
    </p>
  </section>
</template>
