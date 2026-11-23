<!-- Mediário | Fase 9.2: prateleiras locais de descoberta. -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { loadLocalDiscovery, type DiscoveryShelf } from "@/domain/search/localDiscovery";
import type { GlobalSearchItem } from "@/domain/search/globalSearch";

const emit = defineEmits<{ select: [GlobalSearchItem] }>();
const shelves = ref<DiscoveryShelf[]>([]);
const loading = ref(false);
const error = ref("");

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try { shelves.value = await loadLocalDiscovery(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

onMounted(load);
</script>

<template>
  <section class="search-discovery" aria-labelledby="search-discovery-title">
    <div class="global-search-summary"><div><p class="eyebrow">Descoberta local</p><h3 id="search-discovery-title">Explorar o catálogo</h3></div><button class="button button-secondary" type="button" :disabled="loading" @click="load">Atualizar</button></div>
    <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
    <p v-if="loading">A preparar sugestões…</p>
    <section v-for="shelf in shelves.filter((item) => item.items.length)" :key="shelf.id" class="discovery-shelf">
      <header><div><h4>{{ shelf.title }}</h4><p>{{ shelf.description }}</p></div><span>{{ shelf.items.length }}</span></header>
      <div class="discovery-rail">
        <button v-for="item in shelf.items" :key="item.id" type="button" class="discovery-card" @click="emit('select', item)">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="" loading="lazy" />
          <span v-else class="global-search-fallback" aria-hidden="true">◇</span>
          <strong>{{ item.title }}</strong><small>{{ item.subtitle || item.provider || "Título" }}</small>
        </button>
      </div>
    </section>
  </section>
</template>
