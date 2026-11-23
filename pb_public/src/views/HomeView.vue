<script setup lang="ts">
import { computed } from "vue";
import { useAuth } from "@/composables/useAuth";
import { usePermissions } from "@/composables/usePermissions";
import { homeDashboardLinks } from "@/domain/navigation/homeDashboard";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
const auth=useAuth(); const permissions=usePermissions();
const links=computed(()=>homeDashboardLinks.filter(item=>!item.permission||permissions.can(item.permission)));
const greeting=computed(()=>auth.user.value?.nome||auth.user.value?.email||"Utilizador");
</script>
<template><BasePageHeader eyebrow="Página inicial" :title="`Olá, ${greeting}`" description="Acessos rápidos ajustados às permissões da conta atual."><template #actions><RouterLink class="button button-secondary" :to="{name:'profile'}">Perfil</RouterLink></template></BasePageHeader><section class="home-dashboard-grid" aria-label="Áreas disponíveis"><RouterLink v-for="item in links" :key="item.to" :to="item.to" class="home-dashboard-card"><span aria-hidden="true">{{item.icon}}</span><div><h2>{{item.title}}</h2><p>{{item.description}}</p></div></RouterLink></section><section class="panel home-security-summary"><h2>Sessão e privacidade</h2><p>Função atual: <strong>{{auth.user.value?.role}}</strong>.</p></section></template>
