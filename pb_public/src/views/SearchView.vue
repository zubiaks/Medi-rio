<!--
  Mediário
  Caminho: src/views/SearchView.vue
  Versão: 1.0.0
  Domínio: Pesquisa e descoberta
  Finalidade: Vista dedicada pronta para integração no router principal.
 -->
<script setup lang="ts">
import { ref } from "vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import GlobalSearchDialog from "@/components/search/GlobalSearchDialog.vue";
import type { GlobalSearchItem } from "@/domain/search/globalSearch";

const open = ref(true);
const lastSelection = ref<GlobalSearchItem | null>(null);

function selected(item: GlobalSearchItem): void {
  lastSelection.value = item;
  open.value = false;
}
</script>

<template>
  <BasePageHeader
    eyebrow="Pesquisa e descoberta"
    title="Pesquisa global"
    description="Pesquisar, descobrir, comparar e consultar relações em todo o catálogo."
  >
    <template #actions>
      <button class="button button-primary" type="button" @click="open = true">
        Abrir pesquisa <kbd>Ctrl K</kbd>
      </button>
    </template>
  </BasePageHeader>

  <section class="panel search-view-intro">
    <h2>Workspace de pesquisa</h2>
    <p>
      O estado da pesquisa, filtros, modo e apresentação ficam representados no URL,
      permitindo atualizar a página ou partilhar o endereço dentro da instalação local.
    </p>
    <p v-if="lastSelection">
      Último resultado selecionado: <strong>{{ lastSelection.title }}</strong>
    </p>
    <button class="button button-primary" type="button" @click="open = true">
      Pesquisar no Mediário
    </button>
  </section>

  <GlobalSearchDialog
    :open="open"
    @close="open = false"
    @select="selected"
  />
</template>
