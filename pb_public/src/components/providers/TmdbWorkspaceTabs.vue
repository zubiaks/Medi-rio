<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbWorkspaceTabs.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / workspace TMDB
  Finalidade: Encapsular navegação acessível e montagem diferida dos painéis.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  availableTmdbWorkspaceTabs,
  nextTmdbWorkspaceTab,
  type TmdbWorkspaceTab,
} from "@/domain/providers/tmdbWorkspace";

const props = withDefaults(defineProps<{
  mediaType: string;
  modelValue?: TmdbWorkspaceTab;
}>(), {
  modelValue: "metadata",
});

const emit = defineEmits<{
  "update:modelValue": [TmdbWorkspaceTab];
}>();

const buttons = ref<HTMLButtonElement[]>([]);
const tabs = computed(() => availableTmdbWorkspaceTabs(props.mediaType));
const active = computed({
  get: () => props.modelValue,
  set: (value: TmdbWorkspaceTab) => emit("update:modelValue", value),
});

watch(tabs, (value) => {
  if (!value.some((item) => item.id === active.value)) {
    active.value = value[0]?.id || "metadata";
  }
});

async function focusActive(): Promise<void> {
  await nextTick();
  const index = tabs.value.findIndex((item) => item.id === active.value);
  buttons.value[index]?.focus();
}

function move(direction: 1 | -1): void {
  active.value = nextTmdbWorkspaceTab(active.value, props.mediaType, direction);
  void focusActive();
}

function handleKey(event: KeyboardEvent): void {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    move(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    move(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    active.value = tabs.value[0]?.id || "metadata";
    void focusActive();
  } else if (event.key === "End") {
    event.preventDefault();
    active.value = tabs.value.at(-1)?.id || "health";
    void focusActive();
  }
}
</script>

<template>
  <div class="tmdb-detail-tabs" role="tablist" aria-label="Áreas do enriquecimento TMDB">
    <button
      v-for="(item, index) in tabs"
      :id="`tmdb-tab-${item.id}`"
      :key="item.id"
      :ref="(element) => { if (element) buttons[index] = element as HTMLButtonElement; }"
      class="button button-secondary"
      :class="{ 'is-active': active === item.id }"
      type="button"
      role="tab"
      :aria-controls="`tmdb-panel-${item.id}`"
      :aria-selected="active === item.id"
      :tabindex="active === item.id ? 0 : -1"
      @keydown="handleKey"
      @click="active = item.id"
    >
      {{ item.label }}
    </button>
  </div>

  <div
    v-for="item in tabs"
    v-show="active === item.id"
    :id="`tmdb-panel-${item.id}`"
    :key="`panel-${item.id}`"
    class="tmdb-detail-panel"
    role="tabpanel"
    :aria-labelledby="`tmdb-tab-${item.id}`"
  >
    <slot v-if="active === item.id" :name="item.id" />
  </div>
</template>
