<!--
  Projeto: Mediário
  Ficheiro: src/components/library/LibraryLoanDialog.vue
  Versão do ficheiro: 2.0.0
  Tipo: Diálogo Vue 3 com TypeScript
  Domínio: Biblioteca física

  Finalidade:
  Inicia, renova e encerra empréstimos de exemplares físicos.

  Regras:
  - Emprestado e Atrasado são estados activos.
  - Perdido e Cancelado exigem notas.
  - A devolução distingue Devolvido de Danificado.
  - As alterações são delegadas ao serviço loanWorkflow.
-->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { NamedRecord } from "@/types/records";
import type {
  LibraryCopyRecord,
  LoanHistoryRecord,
} from "@/domain/library/records";
import {
  cancelLoan,
  findActiveLoan,
  markLoanLost,
  renewLoan,
  returnLoan,
  startLoan,
  syncLateStatus,
} from "@/domain/library/loanWorkflow";

type LoanOperation = "start" | "renew" | "return" | "lost" | "cancel";

const props = defineProps<{
  open: boolean;
  copy: LibraryCopyRecord | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [LibraryCopyRecord];
}>();

const peopleRepository = new PocketBaseRepository<NamedRecord>("pessoas");

const people = ref<NamedRecord[]>([]);
const history = ref<LoanHistoryRecord>();
const mode = ref<LoanOperation>("start");
const personId = ref("");
const loanDate = ref("");
const dueDate = ref("");
const closingDate = ref("");
const goodCondition = ref(true);
const notes = ref("");
const saving = ref(false);
const error = ref("");

const title = computed(() => {
  const titles: Record<LoanOperation, string> = {
    start: "Emprestar exemplar",
    renew: "Renovar empréstimo",
    return: "Registar devolução",
    lost: "Marcar como perdido",
    cancel: "Cancelar empréstimo",
  };

  return titles[mode.value];
});

const requiresClosingDate = computed(() =>
  ["return", "lost", "cancel"].includes(mode.value),
);

watch(
  () => [props.open, props.copy] as const,
  async ([open, copy]) => {
    if (!open || !copy) return;

    error.value = "";

    const peopleResult = await peopleRepository.list({
      page: 1,
      perPage: 500,
      filter: "ativo = true",
      sort: "nome",
    });

    people.value = peopleResult.items;
    history.value = copy.emprestado
      ? await findActiveLoan(copy.id)
      : undefined;

    if (history.value) {
      history.value = await syncLateStatus(history.value);
    }

    mode.value = copy.emprestado ? "renew" : "start";
    personId.value = copy.emprestado_a || "";
    loanDate.value =
      copy.data_emprestimo?.slice(0, 10) ||
      new Date().toISOString().slice(0, 10);
    dueDate.value = copy.data_prevista?.slice(0, 10) || "";
    closingDate.value = new Date().toISOString().slice(0, 10);
    goodCondition.value = true;
    notes.value = history.value?.notas || "";
  },
  { immediate: true },
);

async function save(): Promise<void> {
  if (!props.copy) return;

  saving.value = true;
  error.value = "";

  try {
    let result;

    if (mode.value === "start") {
      result = await startLoan(props.copy, {
        pessoa: personId.value,
        dataEmprestimo: loanDate.value,
        dataPrevista: dueDate.value,
        notas: notes.value,
      });
    } else if (!history.value) {
      throw new Error(
        "Não foi encontrado um empréstimo activo para esta operação.",
      );
    } else if (mode.value === "renew") {
      result = await renewLoan(props.copy, history.value, {
        dataPrevista: dueDate.value,
        notas: notes.value,
      });
    } else if (mode.value === "return") {
      result = await returnLoan(props.copy, history.value, {
        dataDevolucao: closingDate.value,
        bomEstado: goodCondition.value,
        notas: notes.value,
      });
    } else if (mode.value === "lost") {
      result = await markLoanLost(props.copy, history.value, {
        data: closingDate.value,
        notas: notes.value,
      });
    } else {
      result = await cancelLoan(props.copy, history.value, {
        data: closingDate.value,
        notas: notes.value,
      });
    }

    emit("saved", result.copy);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && copy"
      class="dialog-backdrop"
      @click.self="!saving && emit('close')"
    >
      <section
        class="dialog-panel library-loan-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-loan-title"
      >
        <form @submit.prevent="save">
          <div class="dialog-header">
            <div>
              <p class="eyebrow">
                {{ copy.expand?.titulo?.titulo || "Exemplar" }}
              </p>
              <h2 id="library-loan-title">{{ title }}</h2>
            </div>
            <button
              class="icon-button"
              type="button"
              aria-label="Fechar"
              :disabled="saving"
              @click="emit('close')"
            >×</button>
          </div>

          <div v-if="error" class="form-alert form-alert-error" role="alert">
            {{ error }}
          </div>

          <div
            v-if="copy.emprestado"
            class="view-switch"
            role="group"
            aria-label="Operação de empréstimo"
          >
            <button type="button" :class="{ 'is-active': mode === 'renew' }" @click="mode = 'renew'">Renovar</button>
            <button type="button" :class="{ 'is-active': mode === 'return' }" @click="mode = 'return'">Devolver</button>
            <button type="button" :class="{ 'is-active': mode === 'lost' }" @click="mode = 'lost'">Marcar como perdido</button>
            <button type="button" :class="{ 'is-active': mode === 'cancel' }" @click="mode = 'cancel'">Cancelar empréstimo</button>
          </div>

          <template v-if="mode === 'start'">
            <label class="form-field">
              <span>Pessoa *</span>
              <select v-model="personId" required>
                <option value="">Seleccionar pessoa</option>
                <option v-for="person in people" :key="person.id" :value="person.id">
                  {{ person.nome }}
                </option>
              </select>
            </label>
            <label class="form-field">
              <span>Data do empréstimo *</span>
              <input v-model="loanDate" type="date" required />
            </label>
          </template>

          <label v-if="!requiresClosingDate" class="form-field">
            <span>Devolução prevista *</span>
            <input v-model="dueDate" type="date" required />
          </label>

          <template v-else>
            <label class="form-field">
              <span>{{ mode === "return" ? "Data da devolução" : "Data de encerramento" }} *</span>
              <input v-model="closingDate" type="date" required />
            </label>
            <label v-if="mode === 'return'" class="check-field">
              <input v-model="goodCondition" type="checkbox" />
              Devolvido em bom estado
            </label>
          </template>

          <label class="form-field">
            <span>Notas</span>
            <textarea v-model="notes" rows="4" maxlength="5000" />
          </label>

          <div class="form-actions">
            <button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button>
            <button class="button button-primary" type="submit" :disabled="saving">{{ saving ? "A guardar…" : "Confirmar" }}</button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
