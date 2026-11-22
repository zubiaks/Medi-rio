<!--
  Projeto: Mediário
  Ficheiro: src/views/DiaryView.vue
  Versão do ficheiro: 1.0.0
  Tipo: Página Vue 3 com TypeScript
  Domínio: Diário e avaliações

  Finalidade:
  Gere o histórico de consumo, o calendário mensal e as avaliações.
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import DiaryCalendar from "@/components/diary/DiaryCalendar.vue";
import DiaryEntryDialog from "@/components/diary/DiaryEntryDialog.vue";
import DiaryStatisticsPanel from "@/components/diary/DiaryStatisticsPanel.vue";
import ReviewCard from "@/components/diary/ReviewCard.vue";
import ReviewDialog from "@/components/diary/ReviewDialog.vue";
import { diaryEntryRepository, reviewRepository } from "@/domain/diary/repository";
import type { DiaryEntryRecord, ReviewRecord } from "@/domain/diary/records";

type DiaryTab = "diary" | "calendar" | "reviews" | "statistics";
const tab = ref<DiaryTab>("diary");
const entries = ref<DiaryEntryRecord[]>([]);
const statisticsEntries = ref<DiaryEntryRecord[]>([]);
const reviews = ref<ReviewRecord[]>([]);
const loading = ref(true);
const error = ref("");
const page = ref(1);
const pages = ref(1);
const search = ref("");
const complete = ref("");
const rewatch = ref("");
const entryOpen = ref(false);
const editingEntry = ref<DiaryEntryRecord | null>(null);
const reviewOpen = ref(false);
const editingReview = ref<ReviewRecord | null>(null);

const filteredEntries = computed(() => {
  const query = search.value.toLocaleLowerCase("pt-PT");
  return entries.value.filter(entry => {
    const title = entry.expand?.titulo?.titulo?.toLocaleLowerCase("pt-PT") || "";
    return (!query || title.includes(query)) &&
      (!complete || entry.completo === (complete === "yes")) &&
      (!rewatch || entry.revisualizacao === (rewatch === "yes"));
  });
});

async function loadEntries(): Promise<void> {
  loading.value = true;
  try {
    const result = await diaryEntryRepository.list({ page: page.value, perPage: 50, sort: "-iniciado_em", expand: "titulo,temporada,episodio,plataforma" });
    entries.value = result.items;
    pages.value = result.totalPages || 1;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loading.value = false; }
}

async function loadStatisticsData(): Promise<void> {
  const allEntries: DiaryEntryRecord[] = [];
  let statisticsPage = 1;
  let totalPages = 1;

  do {
    const result = await diaryEntryRepository.list({
      page: statisticsPage,
      perPage: 500,
      sort: "-iniciado_em",
      expand: "titulo,temporada,episodio,plataforma",
    });
    allEntries.push(...result.items);
    totalPages = result.totalPages || 1;
    statisticsPage += 1;
  } while (statisticsPage <= totalPages);

  statisticsEntries.value = allEntries;
}

async function loadReviews(): Promise<void> {
  try { reviews.value = (await reviewRepository.list({ page: 1, perPage: 200, sort: "-data_publicacao,-updated", expand: "titulo,tags_review" })).items; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
}

function newEntry(): void { editingEntry.value = null; entryOpen.value = true; }
function editEntry(entry: DiaryEntryRecord): void { editingEntry.value = entry; entryOpen.value = true; }
function newReview(): void { editingReview.value = null; reviewOpen.value = true; }
function editReview(review: ReviewRecord): void { editingReview.value = review; reviewOpen.value = true; }
async function entrySaved(): Promise<void> { entryOpen.value = false; editingEntry.value = null; await loadEntries(); }
async function reviewSaved(): Promise<void> { reviewOpen.value = false; editingReview.value = null; await loadReviews(); }
function formatDate(value?: string): string { return value ? new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—"; }

onMounted(() =>
  Promise.all([loadEntries(), loadStatisticsData(), loadReviews()]),
);
</script>
<template><BasePageHeader eyebrow="Histórico pessoal" title="Diário e avaliações" description="Registos de consumo, calendário, classificações e opiniões."><template #actions><button v-if="tab==='reviews'" class="button button-primary" type="button" @click="newReview">＋ Nova avaliação</button><button v-else class="button button-primary" type="button" @click="newEntry">＋ Novo registo</button></template></BasePageHeader><div v-if="error" class="form-alert form-alert-error" role="alert">{{error}}</div><div class="view-switch diary-tabs" role="tablist" aria-label="Área do Diário"><button type="button" :class="{'is-active':tab==='diary'}" @click="tab='diary'">Diário</button><button type="button" :class="{'is-active':tab==='calendar'}" @click="tab='calendar'">Calendário</button><button type="button" :class="{'is-active':tab==='reviews'}" @click="tab='reviews'">Avaliações</button><button type="button" :class="{'is-active':tab==='statistics'}" @click="tab='statistics'">Estatísticas</button></div><section v-if="tab==='diary'" class="diary-section"><div class="panel diary-filters"><label class="form-field"><span>Pesquisar título</span><input v-model.trim="search" type="search"/></label><label class="form-field"><span>Conclusão</span><select v-model="complete"><option value="">Todas</option><option value="yes">Concluídas</option><option value="no">Em progresso</option></select></label><label class="form-field"><span>Revisualização</span><select v-model="rewatch"><option value="">Todas</option><option value="yes">Revisualizações</option><option value="no">Primeira vez</option></select></label></div><p v-if="loading" class="page-loading" aria-live="polite">A carregar o Diário…</p><BaseEmptyState v-else-if="!filteredEntries.length" icon="◷" title="Sem registos" description="Ainda não existem registos para estes filtros."/><div v-else class="diary-list"><article v-for="entry in filteredEntries" :key="entry.id" class="diary-entry"><div><p class="eyebrow">{{entry.completo?'Concluído':'Em progresso'}}<span v-if="entry.revisualizacao"> · Revisualização</span></p><h3>{{entry.expand?.titulo?.titulo||'Título desconhecido'}}</h3><p>{{formatDate(entry.iniciado_em)}} · {{entry.percentagem||0}}%</p></div><button class="button button-secondary" type="button" @click="editEntry(entry)">Editar</button></article></div><BasePagination :page="page" :pages="pages" label="Paginação do Diário" @change="page=$event;loadEntries()"/></section><DiaryCalendar v-else-if="tab==='calendar'" :entries="entries"/><DiaryStatisticsPanel v-else-if="tab==='statistics'" :entries="statisticsEntries" :reviews="reviews"/><section v-else class="review-grid"><BaseEmptyState v-if="!reviews.length" icon="★" title="Sem avaliações" description="Escreve a primeira avaliação do teu catálogo."/><ReviewCard v-for="review in reviews" v-else :key="review.id" :review="review" @edit="editReview"/></section><DiaryEntryDialog :open="entryOpen" :entry="editingEntry" @close="entryOpen=false" @saved="entrySaved"/><ReviewDialog :open="reviewOpen" :review="editingReview" @close="reviewOpen=false" @saved="reviewSaved"/></template>
