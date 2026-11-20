<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import VodForm from "@/features/vod/components/VodForm.vue";
import { createEmptyVodForm, type VodFormData } from "@/domain/vod/models";
import { mapVodFormToPayload } from "@/domain/vod/mapper";
import { findVodDuplicate } from "@/domain/vod/checkDuplicate";
import { availabilityRepository } from "@/domain/repositories";

const route = useRoute();
const router = useRouter();
const saving = ref(false);
const error = ref("");
const initial = createEmptyVodForm();
if (typeof route.query.titulo === "string") initial.tituloId = route.query.titulo;

async function save(form: VodFormData) {
  saving.value = true;
  error.value = "";
  try {
    const duplicate = await findVodDuplicate(form);
    if (duplicate && !window.confirm(`Já existe uma oferta semelhante de ${duplicate.provider_nome}. Guardar mesmo assim?`)) return;
    await availabilityRepository.create(mapVodFormToPayload(form));
    await router.push({ name: "vod", query: { created: "1" } });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BasePageHeader eyebrow="VOD" title="Adicionar disponibilidade" description="Regista onde um título está disponível." />
  <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
  <VodForm :initial-value="initial" :saving="saving" @submit="save" />
</template>
