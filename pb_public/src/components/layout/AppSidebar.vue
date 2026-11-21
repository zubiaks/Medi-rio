<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const iconFailed = ref(false);

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
      ["/tv", "▣", "IPTV"],
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
  if (path === "/") {
    return route.path === "/";
  }

  if (path === "/vod") {
    return route.path === "/vod";
  }

  if (path === "/vod/novo") {
    return route.path === "/vod/novo";
  }

  return route.path.startsWith(path);
}

function closeSidebar(): void {
  emit("close");
}
</script>

<template>
  <aside
    id="sidebar"
    class="sidebar"
    :class="{ 'is-open': open }"
    aria-label="Navegação principal"
  >
    <RouterLink
      class="brand"
      to="/"
      aria-label="Mediário — página inicial"
      @click="closeSidebar"
    >
      <span class="brand-icon-wrap" aria-hidden="true">
        <img
          v-if="!iconFailed"
          class="brand-icon"
          src="/brand/mediario-icon.png"
          alt=""
          width="52"
          height="52"
          @error="iconFailed = true"
        />

        <span v-else class="brand-icon-fallback">
          M
        </span>
      </span>

      <span class="brand-copy">
        <strong>Mediário</strong>
        <small>A tua vida multimédia</small>
      </span>
    </RouterLink>

    <nav class="nav" aria-label="Áreas da aplicação">
      <template
        v-for="group in groups"
        :key="group.label"
      >
        <p class="nav-label">
          {{ group.label }}
        </p>

        <RouterLink
          v-for="item in group.items"
          :key="item[0]"
          class="nav-item"
          :class="{ 'is-active': isActive(item[0]) }"
          :to="item[0]"
          :aria-current="isActive(item[0]) ? 'page' : undefined"
          @click="closeSidebar"
        >
          <span class="nav-item-icon" aria-hidden="true">
            {{ item[1] }}
          </span>

          <span>{{ item[2] }}</span>
        </RouterLink>
      </template>
    </nav>

    <div class="sidebar-footer">
      <slot name="status" />
    </div>
  </aside>
</template>
