<!--
  Projeto: Mediário
  Caminho: src/components/providers/TitleVersionPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / histórico e recuperação
  Finalidade: Criar snapshots e restaurar campos selecionados.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { ref, watch } from "vue";
import type { TitleRecord } from "@/types/records";
import { createTitleSnapshot, listTitleVersions, restorableFields, restoreTitleVersion, type TitleVersionRecord } from "@/domain/providers/titleVersions";
const props = defineProps<{ title: TitleRecord; disabled?: boolean }>();
const emit = defineEmits<{ restored: [Record<string, unknown>]; snapshot: [TitleVersionRecord] }>();
const versions = ref<TitleVersionRecord[]>([]);
const selectedVersion = ref<TitleVersionRecord | null>(null);
const selectedFields = ref<string[]>([]);
const reason = ref("Snapshot antes da sincronização TMDB");
const loading = ref(false);
const error = ref("");
async function load(): Promise<void> { loading.value = true; error.value = ""; try { versions.value = await listTitleVersions(props.title.id); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
async function create(): Promise<void> { loading.value = true; error.value = ""; try { const version = await createTitleSnapshot(props.title, reason.value); versions.value = [version, ...versions.value]; emit("snapshot", version); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
function choose(version: TitleVersionRecord): void { selectedVersion.value = version; selectedFields.value = restorableFields(version.snapshot); }
async function restore(): Promise<void> { if (!selectedVersion.value) return; loading.value = true; error.value = ""; try { emit("restored", await restoreTitleVersion(selectedVersion.value, selectedFields.value)); await load(); } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); } finally { loading.value = false; } }
watch(() => props.title.id, () => { versions.value = []; selectedVersion.value = null; void load(); }, { immediate: true });
</script>
<template>
  <section class="title-versions" aria-labelledby="title-versions-title">
    <div><p class="eyebrow">Segurança e recuperação</p><h3 id="title-versions-title">Versões do título</h3></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <div class="title-version-create"><label class="form-field"><span>Motivo do snapshot</span><input v-model.trim="reason" maxlength="500" /></label><button class="button button-secondary" type="button" :disabled="disabled || loading" @click="create">Criar snapshot agora</button></div>
    <p v-if="loading && !versions.length">A carregar versões…</p>
    <div v-else-if="versions.length" class="title-version-layout">
      <ul class="title-version-list"><li v-for="version in versions" :key="version.id"><button type="button" :class="{ 'is-selected': selectedVersion?.id === version.id }" @click="choose(version)"><strong>Versão {{ version.versao_num }}</strong><small>{{ version.motivo || "Sem motivo" }} · {{ new Date(version.created).toLocaleString("pt-PT") }}</small></button></li></ul>
      <div v-if="selectedVersion" class="title-version-fields"><h4>Campos a restaurar</h4><label v-for="field in restorableFields(selectedVersion.snapshot)" :key="field"><input v-model="selectedFields" type="checkbox" :value="field" /> {{ field }}</label><button class="button button-primary" type="button" :disabled="disabled || loading || !selectedFields.length" @click="restore">Restaurar campos selecionados</button></div>
    </div>
    <p v-else>Não existem versões guardadas para este título.</p>
  </section>
</template>
