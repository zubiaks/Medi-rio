<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { useRoute } from "vue-router";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const route = useRoute();

const groups = [
  {
    label: "Explorar",
    items: [
      ["/", "⌂", "Visão geral"],
      ["/catalogo", "◫", "Catálogo"],
      ["/vod", "▶", "VOD"],
      ["/vod/novo", "＋", "Adicionar VOD"],
      ["/colecoes", "◇", "Coleções"],
      ["/descobrir", "✦", "Descobrir"],
    ],
  },
  {
    label: "Acompanhar",
    items: [
      ["/podcasts", "◉", "Podcasts"],
      ["/tv", "▣", "TV e streams"],
      ["/diario", "◷", "Diário"],
      ["/biblioteca", "▤", "Biblioteca"],
      ["/reviews", "☆", "Reviews"],
    ],
  },
  {
    label: "Sistema",
    items: [
      ["/lixeira", "♲", "Lixeira"],
      ["/providers", "⌁", "Providers"],
      ["/manutencao", "◈", "Manutenção"],
      ["/definicoes", "⚙", "Definições"],
      ["/dev", "⌘", "Diagnóstico"],
    ],
  },
] as const;

function isActive(path: string): boolean {
  if (path === "/") return route.path === "/";

  // Evita que “VOD” e “Adicionar VOD” fiquem ativos ao mesmo tempo.
  if (path === "/vod") return route.path === "/vod";
  if (path === "/vod/novo") return route.path === "/vod/novo";

  return route.path.startsWith(path);
}
</script>

<template>
  <aside
    id="sidebar"
    class="sidebar"
    :class="{ 'is-open': props.open }"
    aria-label="Navegação principal"
  >
    <RouterLink class="brand" to="/" @click="emit('close')">
      <span class="brand-mark">▶</span>
      <span>
        <strong>Mediario</strong>
        <small>a tua vida multimédia</small>
      </span>
    </RouterLink>

    <nav class="nav" aria-label="Áreas da aplicação">
      <template v-for="group in groups" :key="group.label">
        <p class="nav-label">{{ group.label }}</p>

        <RouterLink
          v-for="item in group.items"
          :key="item[0]"
          class="nav-item"
          :class="{ 'is-active': isActive(item[0]) }"
          :to="item[0]"
          @click="emit('close')"
        >
          <span aria-hidden="true">{{ item[1] }}</span>
          {{ item[2] }}
        </RouterLink>
      </template>
    </nav>

    <div class="sidebar-footer">
      <slot name="status" />
    </div>
  </aside>
</template>
