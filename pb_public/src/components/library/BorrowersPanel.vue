<!--
  Projeto: Mediário
  Ficheiro: src/components/library/BorrowersPanel.vue
  Tipo: Componente Vue 3 com TypeScript.
  Domínio: Biblioteca física.

  Finalidade:
  Apresenta os empréstimos agrupados por pessoa, com totais activos,
  atrasos, próxima devolução e total histórico.

  Dependências:
  - src/domain/library/borrowerSummary.ts
  - src/domain/library/records.ts
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { buildBorrowerSummaries } from "@/domain/library/borrowerSummary";
import type { LoanHistoryRecord } from "@/domain/library/records";

const props = defineProps<{
  items: LoanHistoryRecord[];
}>();

const query = ref("");

const summaries = computed(() => {
  const normalizedQuery = query.value.toLocaleLowerCase("pt-PT");

  return buildBorrowerSummaries(props.items).filter(
    (item) =>
      !normalizedQuery ||
      item.name.toLocaleLowerCase("pt-PT").includes(normalizedQuery),
  );
});

function formatDate(value?: string): string {
  return value
    ? new Intl.DateTimeFormat("pt-PT").format(new Date(value))
    : "—";
}
</script>

<template>
  <section class="panel borrower-panel" aria-labelledby="borrower-title">
    <div class="library-filter-header">
      <div>
        <p class="eyebrow">Destinatários</p>
        <h2 id="borrower-title">Empréstimos por pessoa</h2>
      </div>

      <label class="form-field">
        <span>Pesquisar pessoa</span>
        <input v-model.trim="query" type="search" />
      </label>
    </div>

    <p v-if="!summaries.length">
      Não existem destinatários para apresentar.
    </p>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Pessoa</th>
            <th>Activos</th>
            <th>Em atraso</th>
            <th>Próxima devolução</th>
            <th>Total histórico</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in summaries" :key="item.personId">
            <td>{{ item.name }}</td>
            <td>{{ item.active }}</td>
            <td>
              <strong v-if="item.overdue">{{ item.overdue }}</strong>
              <span v-else>0</span>
            </td>
            <td>{{ formatDate(item.nextDue) }}</td>
            <td>{{ item.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
