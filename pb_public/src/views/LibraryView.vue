<!--
  Projeto: Mediário
  Ficheiro: src/views/LibraryView.vue
  Versão do ficheiro: 2.0.0
  Tipo: Página Vue 3 com TypeScript
  Domínio: Biblioteca física
  Estado: Em desenvolvimento
  Última revisão: 2026-11-22

  Finalidade:
  Gere os exemplares físicos, os filtros, o histórico de empréstimos,
  os destinatários e as operações de importação e exportação CSV.

  Responsabilidades:
  - Carregar exemplares, formatos, tipos de edição e histórico.
  - Apresentar métricas e filtros da coleção física.
  - Abrir detalhe, edição e gestão de empréstimos.
  - Agrupar empréstimos por destinatário.
  - Importar e exportar o inventário em CSV.
  - Recarregar dados depois de alterações.

  Coleções PocketBase:
  - exemplares
  - historico_emprestimos
  - formatos_fisicos
  - tipos_edicao
  - titulos
  - pessoas

  Regras:
  - Não consultar directamente o cliente PocketBase.
  - Usar os repositórios do domínio library.
  - Manter regras de negócio em TypeScript puro.
  - Preservar TypeScript strict, acessibilidade e UTF-8 sem BOM.
  - Validar com type-check, testes essenciais, build e git diff --check.

  Autor: Zubiaks
  Copyright (c) 2026 Zubiaks.
  Licença: PolyForm Noncommercial License 1.0.0.
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseMetricCard from "@/components/base/BaseMetricCard.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import BasePagination from "@/components/base/BasePagination.vue";

import BorrowersPanel from "@/components/library/BorrowersPanel.vue";
import LibraryCopyDetailDialog from "@/components/library/LibraryCopyDetailDialog.vue";
import LibraryCopyDialog from "@/components/library/LibraryCopyDialog.vue";
import LibraryCsvDialog from "@/components/library/LibraryCsvDialog.vue";
import LibraryLoanDialog from "@/components/library/LibraryLoanDialog.vue";
import LoanHistoryPanel from "@/components/library/LoanHistoryPanel.vue";

import { downloadLibraryCsv } from "@/domain/library/csvInventory";
import { buildLibraryDashboard } from "@/domain/library/dashboard";
import {
  editionTypeRepository,
  libraryCopyRepository,
  loanHistoryRepository,
  physicalFormatRepository,
} from "@/domain/library/repository";

import type {
  EditionTypeRecord,
  LibraryCopyRecord,
  LoanHistoryRecord,
  PhysicalFormatRecord,
} from "@/domain/library/records";

const ITEMS_PER_PAGE = 50;

const items = ref<LibraryCopyRecord[]>([]);
const history = ref<LoanHistoryRecord[]>([]);
const formats = ref<PhysicalFormatRecord[]>([]);
const editions = ref<EditionTypeRecord[]>([]);

const loading = ref(true);
const historyLoading = ref(true);
const error = ref("");

const page = ref(1);
const pages = ref(1);

const search = ref("");
const status = ref("");
const format = ref("");
const edition = ref("");
const location = ref("");

const copyDialogOpen = ref(false);
const csvDialogOpen = ref(false);
const detailCopy = ref<LibraryCopyRecord | null>(null);
const editingCopy = ref<LibraryCopyRecord | null>(null);
const loanDialogOpen = ref(false);
const loanCopy = ref<LibraryCopyRecord | null>(null);

const dashboard = computed(() =>
  buildLibraryDashboard(items.value, history.value),
);

const filteredItems = computed(() => {
  const normalizedSearch = search.value.toLocaleLowerCase("pt-PT");
  const normalizedLocation = location.value.toLocaleLowerCase("pt-PT");

  return items.value.filter((item) => {
    const title = item.expand?.titulo?.titulo || "";
    const searchableText = [
      title,
      item.codigo_interno || "",
      item.codigo_barras || "",
    ]
      .join(" ")
      .toLocaleLowerCase("pt-PT");

    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch);

    const matchesStatus =
      !status.value ||
      (status.value === "available" ? !item.emprestado : item.emprestado);

    const matchesFormat = !format.value || item.formato === format.value;
    const matchesEdition =
      !edition.value || item.tipo_edicao === edition.value;

    const matchesLocation =
      !normalizedLocation ||
      item.localizacao
        ?.toLocaleLowerCase("pt-PT")
        .includes(normalizedLocation);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesFormat &&
      matchesEdition &&
      matchesLocation
    );
  });
});

async function loadLibrary(): Promise<void> {
  loading.value = true;
  error.value = "";

  try {
    const [copiesResult, formatsResult, editionsResult] = await Promise.all([
      libraryCopyRepository.list({
        page: page.value,
        perPage: ITEMS_PER_PAGE,
        sort: "-updated",
        expand: "titulo,formato,tipo_edicao,emprestado_a",
      }),
      physicalFormatRepository.list({
        page: 1,
        perPage: 500,
        filter: "ativo = true",
        sort: "categoria,ordem,nome",
      }),
      editionTypeRepository.list({
        page: 1,
        perPage: 200,
        filter: "ativo = true",
        sort: "categoria,ordem,nome",
      }),
    ]);

    items.value = copiesResult.items;
    pages.value = copiesResult.totalPages || 1;
    formats.value = formatsResult.items;
    editions.value = editionsResult.items;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    items.value = [];
    pages.value = 1;
  } finally {
    loading.value = false;
  }
}

async function loadHistory(): Promise<void> {
  historyLoading.value = true;

  try {
    const result = await loanHistoryRepository.list({
      page: 1,
      perPage: 500,
      sort: "-data_emprestimo",
      expand: "titulo,exemplar,pessoa",
    });

    history.value = result.items;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    history.value = [];
  } finally {
    historyLoading.value = false;
  }
}

function openDetail(copy: LibraryCopyRecord): void {
  detailCopy.value = copy;
}

function createCopy(): void {
  editingCopy.value = null;
  copyDialogOpen.value = true;
}

function editCopy(copy: LibraryCopyRecord): void {
  editingCopy.value = copy;
  copyDialogOpen.value = true;
}

function manageLoan(copy: LibraryCopyRecord): void {
  loanCopy.value = copy;
  loanDialogOpen.value = true;
}

function clearFilters(): void {
  search.value = "";
  status.value = "";
  format.value = "";
  edition.value = "";
  location.value = "";
}

async function handleSaved(): Promise<void> {
  copyDialogOpen.value = false;
  loanDialogOpen.value = false;
  editingCopy.value = null;
  loanCopy.value = null;

  await Promise.all([loadLibrary(), loadHistory()]);
}

async function handleCsvImported(): Promise<void> {
  csvDialogOpen.value = false;
  page.value = 1;
  await loadLibrary();
}

function changePage(nextPage: number): void {
  page.value = nextPage;
  void loadLibrary();
}

onMounted(() => Promise.all([loadLibrary(), loadHistory()]));
</script>

<template>
  <BasePageHeader
    eyebrow="Coleção física"
    title="Biblioteca"
    description="Exemplares, edições, localização, destinatários e empréstimos."
  >
    <template #actions>
      <button
        class="button button-secondary"
        type="button"
        :disabled="!items.length"
        @click="downloadLibraryCsv(items)"
      >
        Exportar CSV
      </button>
      <button
        class="button button-secondary"
        type="button"
        @click="csvDialogOpen = true"
      >
        Importar CSV
      </button>
      <button
        class="button button-primary"
        type="button"
        @click="createCopy"
      >
        ＋ Novo exemplar
      </button>
    </template>
  </BasePageHeader>

  <div v-if="error" class="form-alert form-alert-error" role="alert">
    {{ error }}
  </div>

  <section class="stats-grid compact-stats">
    <BaseMetricCard
      icon="▤"
      label="Exemplares"
      :value="dashboard.total"
      detail="nesta página"
    />
    <BaseMetricCard
      icon="◇"
      label="Disponíveis"
      :value="dashboard.available"
      detail="na coleção"
      tone="cyan"
    />
    <BaseMetricCard
      icon="↗"
      label="Emprestados"
      :value="dashboard.borrowed"
      detail="fora da coleção"
      tone="amber"
    />
    <BaseMetricCard
      icon="!"
      label="Em atraso"
      :value="dashboard.overdue"
      detail="devolução vencida"
      tone="pink"
    />
  </section>

  <section class="panel library-filters" aria-labelledby="library-filters-title">
    <div class="library-filter-header">
      <h2 id="library-filters-title">Pesquisar e filtrar</h2>
      <button
        class="button button-secondary"
        type="button"
        @click="clearFilters"
      >
        Limpar filtros
      </button>
    </div>

    <label class="form-field field-wide">
      <span>Pesquisa</span>
      <input
        v-model.trim="search"
        type="search"
        placeholder="Título, código interno ou código de barras"
      />
    </label>

    <label class="form-field">
      <span>Estado</span>
      <select v-model="status">
        <option value="">Todos</option>
        <option value="available">Disponíveis</option>
        <option value="borrowed">Emprestados</option>
      </select>
    </label>

    <label class="form-field">
      <span>Formato</span>
      <select v-model="format">
        <option value="">Todos</option>
        <option v-for="item in formats" :key="item.id" :value="item.id">
          {{ item.nome }}
        </option>
      </select>
    </label>

    <label class="form-field">
      <span>Tipo de edição</span>
      <select v-model="edition">
        <option value="">Todos</option>
        <option v-for="item in editions" :key="item.id" :value="item.id">
          {{ item.nome }}
        </option>
      </select>
    </label>

    <label class="form-field">
      <span>Localização</span>
      <input
        v-model.trim="location"
        placeholder="Estante, divisão ou caixa"
      />
    </label>
  </section>

  <p v-if="loading" class="page-loading" aria-live="polite">
    A carregar exemplares…
  </p>

  <BaseEmptyState
    v-else-if="!filteredItems.length"
    icon="▤"
    title="Sem exemplares"
    description="Não existem exemplares para os filtros selecionados."
  />

  <div v-else class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Formato</th>
          <th>Edição</th>
          <th>Códigos</th>
          <th>Localização</th>
          <th>Estado</th>
          <th><span class="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredItems" :key="item.id">
          <td>
            <button
              class="library-title-link"
              type="button"
              @click="openDetail(item)"
            >
              <strong>
                {{ item.expand?.titulo?.titulo || "Título desconhecido" }}
              </strong>
            </button>
            <small v-if="item.expand?.titulo?.ano">
              {{ item.expand.titulo.ano }}
            </small>
          </td>
          <td>{{ item.expand?.formato?.nome || "—" }}</td>
          <td>{{ item.expand?.tipo_edicao?.nome || "—" }}</td>
          <td>
            <small>{{ item.codigo_interno || "Sem código interno" }}</small>
            <small>{{ item.codigo_barras || "Sem código de barras" }}</small>
          </td>
          <td>{{ item.localizacao || "—" }}</td>
          <td>{{ item.emprestado ? "Emprestado" : "Disponível" }}</td>
          <td>
            <div class="library-row-actions">
              <button
                class="button button-secondary"
                type="button"
                @click="editCopy(item)"
              >
                Editar
              </button>
              <button
                class="button button-primary"
                type="button"
                @click="manageLoan(item)"
              >
                {{ item.emprestado ? "Gerir empréstimo" : "Emprestar" }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <BasePagination
    :page="page"
    :pages="pages"
    label="Paginação dos exemplares"
    @change="changePage"
  />

  <BorrowersPanel :items="history" />
  <LoanHistoryPanel :items="history" :loading="historyLoading" />

  <LibraryCsvDialog
    :open="csvDialogOpen"
    @close="csvDialogOpen = false"
    @imported="handleCsvImported"
  />

  <LibraryCopyDetailDialog
    :copy="detailCopy"
    @close="detailCopy = null"
    @edit="detailCopy = null; editCopy($event)"
    @changed="handleSaved"
  />

  <LibraryCopyDialog
    :open="copyDialogOpen"
    :copy="editingCopy"
    @close="copyDialogOpen = false"
    @saved="handleSaved"
  />

  <LibraryLoanDialog
    :open="loanDialogOpen"
    :copy="loanCopy"
    @close="loanDialogOpen = false"
    @saved="handleSaved"
  />
</template>
