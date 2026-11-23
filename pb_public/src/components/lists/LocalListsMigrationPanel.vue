<!-- Mediário | ZIP 12A: migração controlada das listas locais. -->
<script setup lang="ts">
import { ref } from "vue";
import {
  migrateLocalLists,
  previewLocalListMigration,
  type LocalListMigrationPreview,
  type LocalListMigrationResult,
} from "@/domain/lists/localListMigration";
import { exportPersonalLists } from "@/domain/lists/listTransfer";
import { loadPersonalLists } from "@/domain/lists/personalLists";

const preview = ref<LocalListMigrationPreview | null>(null);
const result = ref<LocalListMigrationResult | null>(null);
const loading = ref(false);
const error = ref("");

function backup(): void {
  const blob = new Blob([exportPersonalLists(loadPersonalLists())], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mediario-listas-antes-migracao-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function inspect(): Promise<void> {
  loading.value = true; error.value = ""; result.value = null;
  try { preview.value = await previewLocalListMigration(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function migrate(): Promise<void> {
  if (!preview.value || !window.confirm(`Migrar ${preview.value.migratable.length} lista(s) para a conta atual?`)) return;
  loading.value = true; error.value = "";
  try { result.value = await migrateLocalLists(preview.value); await inspect(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}
</script>

<template>
  <section class="local-list-migration" aria-labelledby="local-list-migration-title">
    <div><p class="eyebrow">ZIP 12A</p><h3 id="local-list-migration-title">Migrar listas para a conta</h3><p>Cria uma cópia persistente no PocketBase. Os dados locais não são removidos automaticamente.</p></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div v-if="result" class="form-alert form-alert-success" role="status">{{ result.createdLists }} listas e {{ result.createdItems }} itens migrados. {{ result.skippedDuplicates }} duplicados ignorados. {{ result.failures.length }} falhas.</div>
    <div class="form-actions"><button class="button button-secondary" type="button" @click="backup">Exportar cópia de segurança</button><button class="button button-secondary" type="button" :disabled="loading" @click="inspect">{{ loading ? "A verificar…" : "Pré-visualizar migração" }}</button></div>
    <dl v-if="preview" class="migration-summary"><div><dt>Listas locais</dt><dd>{{ preview.total }}</dd></div><div><dt>Itens locais</dt><dd>{{ preview.items }}</dd></div><div><dt>A migrar</dt><dd>{{ preview.migratable.length }}</dd></div><div><dt>Duplicados</dt><dd>{{ preview.duplicates.length }}</dd></div></dl>
    <ul v-if="preview?.duplicates.length" class="migration-duplicates"><li v-for="item in preview.duplicates" :key="item.localId"><strong>{{ item.name }}</strong><small>Já existe na conta: {{ item.remoteId }}</small></li></ul>
    <div v-if="preview?.migratable.length" class="form-actions"><button class="button button-primary" type="button" :disabled="loading" @click="migrate">Migrar para PocketBase</button></div>
  </section>
</template>
