<!-- Mediário | ZIP 13A — shell autenticada e navegação integrada. -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppTopbar from "@/components/layout/AppTopbar.vue";
import AppBreadcrumbs from "@/components/layout/AppBreadcrumbs.vue";
import AuthSessionMenu from "@/components/auth/AuthSessionMenu.vue";
import NotificationCenter from "@/components/notifications/NotificationCenter.vue";
import { checkPocketBase } from "@/infrastructure/pocketbase/client";
import { useAuth } from "@/composables/useAuth";
import { usePermissions } from "@/composables/usePermissions";

const route=useRoute(); const auth=useAuth(); const permissions=usePermissions();
const sidebarOpen=ref(false); const backendOnline=ref(false); const dialog=ref<HTMLDialogElement|null>(null);
const publicLayout=computed(()=>route.meta.public===true);
async function checkBackend(){backendOnline.value=await checkPocketBase();}
function openCommandDialog(){if(!dialog.value?.open) dialog.value?.showModal();}
function closeCommandDialog(){dialog.value?.close();}
onMounted(()=>{void checkBackend();});
</script>
<template>
  <RouterView v-if="publicLayout"/>
  <template v-else>
    <a class="skip-link" href="#main-content">Saltar para o conteúdo</a>
    <div class="app-shell">
      <AppSidebar :open="sidebarOpen" @close="sidebarOpen=false"><template #status><div class="server-state" :class="backendOnline?'is-online':'is-offline'"><span class="state-dot" aria-hidden="true"/><span><strong>Local</strong><small>{{backendOnline?'PocketBase disponível':'PocketBase indisponível'}}</small></span></div></template></AppSidebar>
      <div class="app-main">
        <AppTopbar @menu="sidebarOpen=!sidebarOpen" @add="openCommandDialog"/>
        <div class="app-integrated-nav"><nav aria-label="Áreas principais"><RouterLink to="/">Início</RouterLink><RouterLink to="/pesquisa">Pesquisa</RouterLink><RouterLink v-if="auth.user.value?.role!=='leitor'" to="/listas">Listas</RouterLink><RouterLink v-if="['admin','editor'].includes(auth.user.value?.role||'')" to="/providers">Providers</RouterLink><RouterLink v-if="auth.user.value?.role==='admin'" to="/administracao">Administração</RouterLink></nav><div class="app-user-tools"><NotificationCenter/><AuthSessionMenu/></div></div>
        <main id="main-content" tabindex="-1"><AppBreadcrumbs/><RouterView v-slot="{Component}"><component :is="Component"/></RouterView></main>
        <footer class="footer"><span>Mediário <b>v0.13.0-beta.1</b></span><span>Dados locais · PocketBase</span></footer>
      </div>
    </div>
    <dialog ref="dialog" class="command-dialog" aria-labelledby="command-dialog-title"><form method="dialog"><div class="dialog-header"><div><p class="eyebrow">Ação rápida</p><h2 id="command-dialog-title">Adicionar conteúdo</h2></div><button class="icon-button" type="submit" value="cancel" aria-label="Fechar">×</button></div><div class="dialog-options"><RouterLink v-if="permissions.can('catalog.write')" to="/catalogo/novo" @click="closeCommandDialog"><span aria-hidden="true">＋</span>Novo título</RouterLink><RouterLink v-if="permissions.can('catalog.write')" to="/podcasts" @click="closeCommandDialog"><span aria-hidden="true">◉</span>Podcast RSS</RouterLink><RouterLink v-if="permissions.can('catalog.write')" to="/iptv" @click="closeCommandDialog"><span aria-hidden="true">▣</span>Canal ou stream</RouterLink><RouterLink v-if="permissions.can('catalog.write')" to="/biblioteca" @click="closeCommandDialog"><span aria-hidden="true">▤</span>Exemplar</RouterLink></div></form></dialog>
  </template>
</template>
