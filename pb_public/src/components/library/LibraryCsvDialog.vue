<!--
  Projeto: Mediário
  Ficheiro: src/components/library/LibraryCsvDialog.vue
  Tipo: Diálogo Vue 3 com TypeScript.
  Domínio: Biblioteca física.

  Finalidade:
  Importa exemplares a partir de CSV, apresenta uma pré-visualização,
  ignora linhas inválidas e continua depois de falhas individuais.

  Nota:
  Os campos de relação devem conter identificadores PocketBase válidos.
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import { libraryCopyRepository } from "@/domain/library/repository";
import {
  parseLibraryCsv,
  type CsvCopyRow,
} from "@/domain/library/csvInventory";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  close: [];
  imported: [number];
}>();

const rows = ref<CsvCopyRow[]>([]);
const running = ref(false);
const progress = ref(0);
const failures = ref<string[]>([]);

const validRows = computed(() => rows.value.filter((row) => !row.erros.length));

async function readFile(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  rows.value = file ? parseLibraryCsv(await file.text()) : [];
  failures.value = [];
}

async function importRows(): Promise<void> {
  running.value = true;
  progress.value = 0;
  failures.value = [];
  let imported = 0;

  for (const row of validRows.value) {
    try {
      await libraryCopyRepository.create({
        titulo: row.titulo,
        formato: row.formato,
        tipo_edicao: row.tipo_edicao,
        numero_copia: row.numero_copia,
        codigo_interno: row.codigo_interno,
        codigo_barras: row.codigo_barras,
        estado_fisico: row.estado_fisico,
        regiao: row.regiao,
        localizacao: row.localizacao,
        selado: row.selado,
        steelbook: row.steelbook,
        notas: row.notas,
        emprestado: false,
      });
      imported += 1;
    } catch (cause) {
      failures.value.push(
        `Linha ${row.linha}: ${cause instanceof Error ? cause.message : String(cause)}`,
      );
    } finally {
      progress.value += 1;
    }
  }

  running.value = false;
  emit("imported", imported);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="dialog-backdrop"
      @click.self="!running && emit('close')"
    >
      <section
        class="dialog-panel library-csv-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-csv-title"
      >
        <div class="dialog-header">
          <div>
            <p class="eyebrow">Inventário</p>
            <h2 id="library-csv-title">Importar exemplares por CSV</h2>
          </div>
          <button
            class="icon-button"
            type="button"
            aria-label="Fechar"
            :disabled="running"
            @click="emit('close')"
          >×</button>
        </div>

        <p class="field-hint">
          Os campos título, formato e tipo de edição devem conter os
          identificadores PocketBase. A primeira linha deve identificar as
          colunas.
        </p>

        <label class="form-field">
          <span>Ficheiro CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            :disabled="running"
            @change="readFile"
          />
        </label>

        <p v-if="rows.length">
          <strong>{{ validRows.length }}</strong> linhas válidas ·
          <strong>{{ rows.length - validRows.length }}</strong> inválidas
        </p>

        <div v-if="rows.length" class="table-wrap csv-preview">
          <table>
            <thead>
              <tr>
                <th>Linha</th>
                <th>Título</th>
                <th>Código interno</th>
                <th>Localização</th>
                <th>Validação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.linha">
                <td>{{ row.linha }}</td>
                <td>{{ row.titulo || "—" }}</td>
                <td>{{ row.codigo_interno || "—" }}</td>
                <td>{{ row.localizacao || "—" }}</td>
                <td>{{ row.erros.join("; ") || "Válida" }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul
          v-if="failures.length"
          class="form-alert form-alert-error"
          role="alert"
        >
          <li v-for="failure in failures" :key="failure">{{ failure }}</li>
        </ul>

        <p v-if="running" aria-live="polite">
          A importar {{ progress }} de {{ validRows.length }}…
        </p>

        <div class="form-actions">
          <button
            class="button button-secondary"
            type="button"
            :disabled="running"
            @click="emit('close')"
          >Cancelar</button>
          <button
            class="button button-primary"
            type="button"
            :disabled="running || !validRows.length"
            @click="importRows"
          >Importar {{ validRows.length }} exemplares</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
