<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbDialogProgress.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / fluxo TMDB
  Finalidade: Apresentar o progresso do fluxo sem permitir saltos inválidos.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import {
  TMDB_DIALOG_STEPS,
  type TmdbDialogStep,
} from "@/domain/providers/tmdbDialogWorkflow";

defineProps<{
  current: TmdbDialogStep;
  completed: TmdbDialogStep[];
}>();
</script>

<template>
  <ol class="tmdb-dialog-progress" aria-label="Progresso da associação TMDB">
    <li
      v-for="(step, index) in TMDB_DIALOG_STEPS"
      :key="step.id"
      :class="{
        'is-current': current === step.id,
        'is-completed': completed.includes(step.id),
      }"
      :aria-current="current === step.id ? 'step' : undefined"
    >
      <span aria-hidden="true">
        {{ completed.includes(step.id) ? "✓" : index + 1 }}
      </span>
      <strong>{{ step.label }}</strong>
    </li>
  </ol>
</template>
