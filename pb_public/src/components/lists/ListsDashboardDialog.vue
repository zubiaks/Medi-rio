<!--
  Mediário
  Caminho: src/components/lists/ListsDashboardDialog.vue
  Versão: 1.0.0
  Domínio: Coleções e listas
  Finalidade: Dashboard, filtros e atualização sequencial das listas inteligentes.
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ListActivityPanel from "./ListActivityPanel.vue";
import LocalListsMigrationPanel from "./LocalListsMigrationPanel.vue";
import RemoteListsPanel from "./RemoteListsPanel.vue";
import {
  buildListDashboardMetrics,
  duplicatePersonalList,
  filterPersonalListItems,
} from "@/domain/lists/listDashboard";
import {
  loadPersonalLists,
  type PersonalList,
} from "@/domain/lists/personalLists";
import {
  pinnedLists,
  refreshAllSmartLists,
  type SmartListBatchResult,
} from "@/domain/lists/smartListBatch";
import { loadListChangeNotices, markListNoticeRead } from "@/domain/lists/listNotifications";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; manage: [string] }>();
const lists = ref<PersonalList[]>([]);
const query = ref("");
const kind = ref<"all" | "manual" | "smart" | "pinned">("all");
const running = ref(false);
const cancelRequested = ref(false);
const progress = ref({ processed: 0, total: 0 });
const result = ref<SmartListBatchResult | null>(null);
const error = ref("");
const notices = ref(loadListChangeNotices());

const metrics = computed(() => buildListDashboardMetrics(lists.value));
const pinned = computed(() => pinnedLists(lists.value));
const visible = computed(() => lists.value
  .filter((list) =>
    kind.value === "all" ||
    (kind.value === "pinned" ? list.pinned : list.kind === kind.value),
  )
  .filter((list) => {
    const term = query.value.trim().toLocaleLowerCase("pt-PT");
    if (!term) return true;
    return `${list.name} ${list.description}`
      .toLocaleLowerCase("pt-PT")
      .includes(term) || filterPersonalListItems(list.items, term).length > 0;
  })
  .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)));

watch(() => props.open, (open) => {
  if (!open) return;
  load();
});

function load(): void {
  lists.value = loadPersonalLists();
  notices.value = loadListChangeNotices();
  error.value = "";
}

function openList(id: string): void {
  notices.value = markListNoticeRead(id);
  emit("manage", id);
}

function duplicate(list: PersonalList): void {
  try {
    lists.value = duplicatePersonalList(list.id);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

async function refreshAll(): Promise<void> {
  running.value = true;
  cancelRequested.value = false;
  result.value = null;
  error.value = "";
  progress.value = { processed: 0, total: metrics.value.smartLists };
  try {
    result.value = await refreshAllSmartLists(
      () => cancelRequested.value,
      (processed, total) => { progress.value = { processed, total }; },
    );
    load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    running.value = false;
  }
}

function age(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Sem data";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} dias`;
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="!running && emit('close')">
      <section class="dialog-panel lists-dashboard-dialog" role="dialog" aria-modal="true" aria-labelledby="lists-dashboard-title">
        <div class="dialog-header">
          <div><p class="eyebrow">Fase 10.2</p><h2 id="lists-dashboard-title">Dashboard de listas</h2></div>
          <button class="icon-button" type="button" aria-label="Fechar" :disabled="running" @click="emit('close')">×</button>
        </div>

        <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
        <div v-if="result" class="form-alert form-alert-success" role="status">
          {{ result.updated }} atualizadas, {{ result.failed }} falharam<template v-if="result.cancelled">, operação cancelada</template>.
        </div>

        <dl class="lists-dashboard-metrics">
          <div><dt>Listas</dt><dd>{{ metrics.totalLists }}</dd></div>
          <div><dt>Manuais</dt><dd>{{ metrics.manualLists }}</dd></div>
          <div><dt>Inteligentes</dt><dd>{{ metrics.smartLists }}</dd></div>
          <div><dt>Fixadas</dt><dd>{{ metrics.pinnedLists }}</dd></div>
          <div><dt>Itens</dt><dd>{{ metrics.totalItems }}</dd></div>
          <div><dt>Itens únicos</dt><dd>{{ metrics.uniqueItems }}</dd></div>
        </dl>

        <section v-if="pinned.length" class="lists-pinned" aria-labelledby="lists-pinned-title">
          <h3 id="lists-pinned-title">Listas fixadas</h3>
          <div>
            <button v-for="list in pinned" :key="list.id" type="button" @click="openList(list.id)">
              <span :style="{ background: list.color }" aria-hidden="true" />
              <strong>{{ list.name }}</strong>
              <small>{{ list.items.length }} itens · {{ age(list.updatedAt) }}</small>
            </button>
          </div>
        </section>

        <div class="lists-dashboard-toolbar">
          <label class="form-field"><span>Pesquisar listas e itens</span><input v-model.trim="query" type="search" /></label>
          <label class="form-field"><span>Tipo</span><select v-model="kind"><option value="all">Todas</option><option value="manual">Manuais</option><option value="smart">Inteligentes</option><option value="pinned">Fixadas</option></select></label>
          <button class="button button-primary" type="button" :disabled="running || !metrics.smartLists" @click="refreshAll">{{ running ? "A atualizar…" : "Atualizar inteligentes" }}</button>
          <button v-if="running" class="button button-secondary" type="button" :disabled="cancelRequested" @click="cancelRequested = true">Parar depois da atual</button>
        </div>

        <div v-if="running" class="lists-batch-progress" role="status">
          <progress :value="progress.processed" :max="Math.max(1, progress.total)" />
          <span>{{ progress.processed }}/{{ progress.total }}</span>
        </div>

        <p v-if="!visible.length" class="form-alert">Não existem listas para estes filtros.</p>
        <div v-else class="lists-dashboard-grid">
          <article v-for="list in visible" :key="list.id" class="list-dashboard-card">
            <header><span :style="{ background: list.color }" aria-hidden="true" /><div><h3>{{ list.name }}</h3><small>{{ list.kind === 'smart' ? 'Inteligente' : 'Manual' }} · {{ age(list.updatedAt) }}</small></div></header>
            <p>{{ list.description || "Sem descrição." }}</p>
            <p v-if="notices.find((notice) => notice.listId === list.id && !notice.read)" class="list-change-notice">
              {{ notices.find((notice) => notice.listId === list.id)?.added || 0 }} novos ·
              {{ notices.find((notice) => notice.listId === list.id)?.removed || 0 }} removidos
            </p>
            <dl><div><dt>Itens</dt><dd>{{ list.items.length }}</dd></div><div><dt>Fixada</dt><dd>{{ list.pinned ? "Sim" : "Não" }}</dd></div></dl>
            <div class="form-actions"><button class="button button-primary" type="button" @click="openList(list.id)">Abrir</button><button class="button button-secondary" type="button" @click="duplicate(list)">Duplicar</button></div>
          </article>
        </div>

        <RemoteListsPanel />
        <LocalListsMigrationPanel />
        <ListActivityPanel @restored="load" />
        <div class="form-actions"><button class="button button-secondary" type="button" :disabled="running" @click="emit('close')">Fechar</button></div>
      </section>
    </div>
  </Teleport>
</template>
