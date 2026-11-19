<script setup lang="ts">
import { onMounted, ref } from "vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import { checkPocketBase, pocketBaseUrl } from "@/infrastructure/pocketbase/client";
const online = ref(false); onMounted(async () => { online.value = await checkPocketBase(); });
</script>
<template><BasePageHeader eyebrow="Desenvolvimento" title="Diagnóstico" description="Estado do frontend, backend e configuração local."/><section class="diagnostic-grid"><article class="diagnostic-card"><span class="status status-ok">ok</span><strong>Vue</strong><code>3 + TypeScript</code></article><article class="diagnostic-card"><span class="status" :class="online ? 'status-ok' : 'status-error'">{{ online ? 'ok' : 'erro' }}</span><strong>PocketBase</strong><code>{{ pocketBaseUrl }}</code></article><article class="diagnostic-card"><span class="status status-warn">local</span><strong>Autenticação</strong><code>adiada durante estabilização</code></article></section></template>
