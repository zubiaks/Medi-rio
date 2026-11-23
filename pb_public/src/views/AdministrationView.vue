<script setup lang="ts">
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import ProviderAdminPanel from "@/components/maintenance/ProviderAdminPanel.vue";
import { useAuth } from "@/composables/useAuth";
const auth=useAuth();
</script>
<template><BasePageHeader eyebrow="Administração" title="Configuração da instalação" description="Segurança, providers, backups e diagnóstico."/><section class="panel administration-summary"><h2>Conta administrativa</h2><dl><div><dt>Email</dt><dd>{{auth.user.value?.email}}</dd></div><div><dt>Função</dt><dd>{{auth.user.value?.role}}</dd></div><div><dt>Estado</dt><dd>{{auth.user.value?.estado}}</dd></div></dl></section><ProviderAdminPanel/><section class="panel"><h2>Backups e restauro</h2><p>Scripts em <code>D:\Mediário\scripts</code>.</p></section></template>
