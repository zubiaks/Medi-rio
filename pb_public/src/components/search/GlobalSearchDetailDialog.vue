<!-- Mediário | Fase 9.1: detalhe contextual de resultados globais. -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AddToListPanel from "@/components/lists/AddToListPanel.vue";
import type { GlobalSearchItem } from "@/domain/search/globalSearch";
import {
  actionsForSearchItem,
  executeSearchAction,
} from "@/domain/search/searchActions";
import {
  loadSearchItemDetails,
  type SearchItemDetails,
} from "@/domain/search/searchDetails";

const props = defineProps<{ item: GlobalSearchItem | null }>();
const emit = defineEmits<{ close: []; use: [GlobalSearchItem] }>();
const details = ref<SearchItemDetails | null>(null);
const loading = ref(false);
const error = ref("");
const message = ref("");
const actions = computed(() => props.item ? actionsForSearchItem(props.item) : []);

watch(() => props.item, async (item) => {
  details.value = null;
  error.value = "";
  if (!item) return;
  loading.value = true;
  try {
    details.value = await loadSearchItemDetails(item);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    details.value = { item, facts: [], relations: [] };
  } finally {
    loading.value = false;
  }
}, { immediate: true });
async function runAction(action: ReturnType<typeof actionsForSearchItem>[number]): Promise<void> {
  if (!props.item) return;
  error.value = "";
  message.value = "";
  try {
    await executeSearchAction(action, props.item);
    if (action.id !== "open-source") message.value = "Valor copiado para a área de transferência.";
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

</script>

<template>
  <Teleport to="body">
    <div v-if="item" class="dialog-backdrop search-detail-backdrop" @click.self="!loading && emit('close')">
      <section class="dialog-panel global-search-detail" role="dialog" aria-modal="true" aria-labelledby="search-detail-title">
        <div class="dialog-header">
          <div><p class="eyebrow">Detalhe da pesquisa</p><h2 id="search-detail-title">{{ item.title }}</h2><p>{{ item.subtitle }}</p></div>
          <button class="icon-button" type="button" aria-label="Fechar" :disabled="loading" @click="emit('close')">×</button>
        </div>

        <p v-if="loading" class="page-loading">A carregar detalhes…</p>
        <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>

        <template v-if="details">
          <div class="search-detail-hero">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="" />
            <span v-else class="global-search-fallback" aria-hidden="true">◇</span>
            <div>
              <p v-if="item.description">{{ item.description }}</p>
              <dl class="search-detail-facts">
                <div v-for="fact in details.facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div>
              </dl>
            </div>
          </div>

          <section v-if="details.relations.length" class="search-detail-relations">
            <h3>Relações e referências</h3>
            <ul>
              <li v-for="relation in details.relations" :key="`${relation.kind}-${relation.id}`">
                <div><small>{{ relation.kind }}</small><strong>{{ relation.title }}</strong><span v-if="relation.subtitle">{{ relation.subtitle }}</span></div>
                <a v-if="relation.url" class="button button-secondary" :href="relation.url" target="_blank" rel="noopener noreferrer">Abrir fonte</a>
              </li>
            </ul>
          </section>

          <AddToListPanel :item="item" />

          <details class="search-detail-technical">
            <summary>Dados técnicos</summary>
            <pre>{{ JSON.stringify(item.record, null, 2) }}</pre>
          </details>
        </template>

        <div v-if="message" class="form-alert form-alert-success" role="status">{{ message }}</div>
        <div class="search-detail-actions" aria-label="Ações do resultado">
          <button v-for="action in actions" :key="action.id" class="button button-secondary" type="button" @click="runAction(action)">{{ action.label }}</button>
        </div>
        <div class="form-actions">
          <button class="button button-primary" type="button" :disabled="loading" @click="emit('use', item)">Usar na página atual</button>
          <button class="button button-secondary" type="button" :disabled="loading" @click="emit('close')">Voltar aos resultados</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
