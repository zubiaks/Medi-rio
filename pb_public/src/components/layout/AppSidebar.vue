<script setup lang="ts">
import { useRoute } from "vue-router";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const route = useRoute();

const groups = [
  { label: "Explorar", items: [["/", "⌂", "Visão geral"], ["/catalogo", "◫", "Catálogo"], ["/vod", "▶", "VOD"], ["/colecoes", "◇", "Coleções"], ["/descobrir", "✦", "Descobrir"]] },
  { label: "Acompanhar", items: [["/podcasts", "◉", "Podcasts"], ["/tv", "▣", "TV e streams"], ["/diario", "◷", "Diário"], ["/biblioteca", "▤", "Biblioteca"], ["/reviews", "☆", "Reviews"]] },
  { label: "Sistema", items: [["/providers", "⌁", "Providers"], ["/manutencao", "◈", "Manutenção"], ["/definicoes", "⚙", "Definições"], ["/dev", "⌘", "Diagnóstico"]] },
] as const;

function isActive(path: string) {
  return path === "/" ? route.path === "/" : route.path.startsWith(path);
}
</script>

<template>
  <aside id="sidebar" class="sidebar" :class="{ 'is-open': props.open }" aria-label="Navegação principal">
    <RouterLink class="brand" to="/" @click="emit('close')"><span class="brand-mark">▶</span><span><strong>Media Vault</strong><small>catálogo pessoal</small></span></RouterLink>
    <nav class="nav" aria-label="Áreas da aplicação">
      <template v-for="group in groups" :key="group.label">
        <p class="nav-label">{{ group.label }}</p>
        <RouterLink v-for="item in group.items" :key="item[0]" class="nav-item" :class="{ 'is-active': isActive(item[0]) }" :to="item[0]" @click="emit('close')"><span>{{ item[1] }}</span>{{ item[2] }}</RouterLink>
      </template>
    </nav>
    <div class="sidebar-footer"><slot name="status" /></div>
  </aside>
</template>
