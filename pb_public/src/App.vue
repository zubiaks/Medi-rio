<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppTopbar from "@/components/layout/AppTopbar.vue";
import { checkPocketBase } from "@/infrastructure/pocketbase/client";

const sidebarOpen = ref(false);
const backendOnline = ref(false);
const dialog = ref<HTMLDialogElement | null>(null);

onMounted(async () => { backendOnline.value = await checkPocketBase(); });
</script>

<template>
  <a class="skip-link" href="#main-content">Saltar para o conteúdo</a>
  <div class="app-shell">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false">
      <template #status><div class="server-state" :class="backendOnline ? 'is-online' : 'is-offline'"><span class="state-dot" /><span><strong>Local</strong><small>{{ backendOnline ? 'PocketBase disponível' : 'PocketBase indisponível' }}</small></span></div></template>
    </AppSidebar>
    <div class="app-main">
      <AppTopbar @menu="sidebarOpen = !sidebarOpen" @add="dialog?.showModal()" />
      <main id="main-content" tabindex="-1">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </main>
      <footer class="footer"><span>Media Vault <b>v0.1.0</b></span><span>Dados locais · PocketBase</span></footer>
    </div>
  </div>
  <dialog ref="dialog" class="command-dialog"><form method="dialog"><div class="dialog-header"><div><p class="eyebrow">Ação rápida</p><h2>Adicionar conteúdo</h2></div><button class="icon-button" value="cancel">×</button></div><div class="dialog-options"><RouterLink to="/catalogo/novo" @click="dialog?.close()">◫ Novo título</RouterLink><RouterLink to="/podcasts" @click="dialog?.close()">◉ Podcast RSS</RouterLink><RouterLink to="/tv" @click="dialog?.close()">▣ Canal ou stream</RouterLink><RouterLink to="/biblioteca" @click="dialog?.close()">▤ Exemplar</RouterLink></div></form></dialog>
</template>
