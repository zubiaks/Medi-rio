<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

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

async function checkBackend(): Promise<void> {
  backendOnline.value = await checkPocketBase();
}

function openCommandDialog(): void {
  if (!dialog.value?.open) {
    dialog.value?.showModal();
  }
}

function closeCommandDialog(): void {
  dialog.value?.close();
}

onMounted(() => {
  void checkBackend();
});
</script>

<template>
  <a class="skip-link" href="#main-content">
    Saltar para o conteúdo
  </a>

  <div class="app-shell">
    <AppSidebar
      :open="sidebarOpen"
      @close="sidebarOpen = false"
    >
      <template #status>
        <div
          class="server-state"
          :class="backendOnline ? 'is-online' : 'is-offline'"
        >
          <span class="state-dot" aria-hidden="true" />

          <span>
            <strong>Local</strong>
            <small>
              {{
                backendOnline
                  ? "PocketBase disponível"
                  : "PocketBase indisponível"
              }}
            </small>
          </span>
        </div>
      </template>
    </AppSidebar>

    <div class="app-main">
      <AppTopbar
        @menu="sidebarOpen = !sidebarOpen"
        @add="openCommandDialog"
      />

      <main id="main-content" tabindex="-1">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </main>

      <footer class="footer">
        <span>
          Mediário
          <b>v0.3.0-alpha.1</b>
        </span>

        <span>Dados locais · PocketBase</span>
      </footer>
    </div>
  </div>

  <dialog
    ref="dialog"
    class="command-dialog"
    aria-labelledby="command-dialog-title"
  >
    <form method="dialog">
      <div class="dialog-header">
        <div>
          <p class="eyebrow">Ação rápida</p>
          <h2 id="command-dialog-title">Adicionar conteúdo</h2>
        </div>

        <button
          class="icon-button"
          type="submit"
          value="cancel"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>

      <div class="dialog-options">
        <RouterLink
          to="/catalogo/novo"
          @click="closeCommandDialog"
        >
          <span aria-hidden="true">＋</span>
          Novo título
        </RouterLink>

        <RouterLink
          to="/podcasts"
          @click="closeCommandDialog"
        >
          <span aria-hidden="true">◉</span>
          Podcast RSS
        </RouterLink>

        <RouterLink
          to="/iptv"
          @click="closeCommandDialog"
        >
          <span aria-hidden="true">▣</span>
          Canal ou stream
        </RouterLink>

        <RouterLink
          to="/biblioteca"
          @click="closeCommandDialog"
        >
          <span aria-hidden="true">▤</span>
          Exemplar
        </RouterLink>
      </div>
    </form>
  </dialog>
</template>