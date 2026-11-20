<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import VodForm from "@/features/vod/components/VodForm.vue";
import type { VodFormData } from "@/domain/vod/models";
import { mapAvailabilityToForm, mapVodFormToPayload } from "@/domain/vod/mapper";
import { findVodDuplicate } from "@/domain/vod/checkDuplicate";
import { availabilityRepository } from "@/domain/repositories";

const route = useRoute();
const router = useRouter();
const id = String(route.params.id);
const initial = ref<VodFormData | null>(null);
const loading = ref(true);
const saving = ref(false);
const dirty = ref(false);
const error = ref("");
let allow = false;

async function load() {
  loading.value = true;
  error.value = "";
  try { initial.value = mapAvailabilityToForm(await availabilityRepository.get(id)); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function save(form: VodFormData) {
  saving.value = true;
  error.value = "";
  try {
    const duplicate = await findVodDuplicate(form, id);
    if (duplicate && !window.confirm(`Já existe uma oferta semelhante de ${duplicate.provider_nome}. Guardar mesmo assim?`)) return;
    await availabilityRepository.update(id, mapVodFormToPayload(form));
    allow = true;
    dirty.value = false;
    await router.push({ name: "vod", query: { updated: "1" } });
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { saving.value = false; }
}

function beforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return;
  event.preventDefault();
  event.returnValue = "";
}

onBeforeRouteLeave(() => allow || !dirty.value || window.confirm("Existem alterações por guardar. Queres sair sem guardar?"));
onMounted(() => { window.addEventListener("beforeunload", beforeUnload); void load(); });
onBeforeUnmount(() => window.removeEventListener("beforeunload", beforeUnload));
</script>

<template>
  <section v-if="loading" class="page-loading"><span class="loader" /></section>
  <BaseEmptyState v-else-if="error && !initial" icon="!" title="Não foi possível abrir a disponibilidade" :description="error"><button class="button button-secondary" @click="load">Voltar a tentar</button></BaseEmptyState>
  <template v-else-if="initial">
    <BasePageHeader eyebrow="VOD" title="Editar disponibilidade" description="Atualiza provider, modalidade, país, preço e validade." />
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <VodForm :initial-value="initial" :saving="saving" submit-label="Guardar alterações" @dirty-change="dirty = $event" @submit="save" />
  </template>
</template>
