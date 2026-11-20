<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { ref } from "vue"; import { useRouter } from "vue-router";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import TitleForm from "@/features/catalog/components/TitleForm.vue";
import type { TitleFormData } from "@/domain/catalog/models";
import { mapTitleFormToCreatePayload } from "@/domain/catalog/mapper";
import { titleRepository } from "@/domain/repositories";
const router=useRouter(), saving=ref(false), error=ref("");
async function save(form:TitleFormData){ saving.value=true; error.value=""; try { const record=await titleRepository.create(mapTitleFormToCreatePayload(form)); await router.push({name:"catalog-detail",params:{id:record.id},query:{created:"1"}}); } catch(e){ error.value=e instanceof Error?e.message:String(e); } finally { saving.value=false; } }
</script>
<template><BasePageHeader eyebrow="Catálogo" title="Adicionar título" description="Cria uma entrada usando os lookups da base atual."/><div v-if="error" class="form-alert form-alert-error">{{ error }}</div><TitleForm :saving="saving" @submit="save"/></template>
