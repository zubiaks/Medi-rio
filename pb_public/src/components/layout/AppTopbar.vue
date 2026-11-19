<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "@/composables/useTheme";

const emit = defineEmits<{ menu: []; add: [] }>();
const router = useRouter();
const query = ref("");
const { themeIcon, toggleTheme } = useTheme();

function search() {
  const value = query.value.trim();
  if (value) router.push({ name: "catalog", query: { pesquisa: value } });
}
</script>

<template>
  <header class="topbar">
    <button class="icon-button menu-button" type="button" aria-label="Abrir navegação" @click="emit('menu')">☰</button>
    <form class="search" role="search" @submit.prevent="search"><span>⌕</span><label class="sr-only" for="search-input">Pesquisar</label><input id="search-input" v-model="query" type="search" placeholder="Pesquisar títulos, pessoas, podcasts…" autocomplete="off"><kbd>Ctrl K</kbd></form>
    <div class="topbar-actions"><button class="icon-button" type="button" aria-label="Alternar tema" @click="toggleTheme">{{ themeIcon }}</button><button class="button button-primary" type="button" @click="emit('add')">＋ Adicionar</button></div>
  </header>
</template>
