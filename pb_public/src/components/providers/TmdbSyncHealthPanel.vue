<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbSyncHealthPanel.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3 com TypeScript
  Domínio: Providers / diagnóstico TMDB
  Finalidade: Apresentar cobertura e incoerências depois da sincronização.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed } from "vue";
import type { TitleRecord } from "@/types/records";
import type { TmdbDetails } from "@/domain/providers/tmdbClient";
import { buildTmdbSyncHealth } from "@/domain/providers/tmdbSyncHealth";
const props = defineProps<{ title: TitleRecord; details?: TmdbDetails | null; loading?: boolean }>();
const emit = defineEmits<{ refresh: [] }>();
const report = computed(() => buildTmdbSyncHealth(props.title, props.details));
</script>
<template>
  <section class="tmdb-sync-health" aria-labelledby="tmdb-sync-health-title">
    <div class="tmdb-sync-health-header">
      <div>
        <p class="eyebrow">Diagnóstico pós-sincronização</p>
        <h3 id="tmdb-sync-health-title">Qualidade dos metadados</h3>
      </div>
      <div class="tmdb-sync-score" :class="`is-${report.tone}`">
        <strong>{{ report.score }}%</strong>
        <small>{{ report.completed }} de {{ report.total }} verificações</small>
      </div>
    </div>
    <div class="tmdb-sync-progress" role="progressbar" aria-label="Cobertura dos metadados" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="report.score"><span :style="{ width: `${report.score}%` }" /></div>
    <ul class="tmdb-sync-checks">
      <li v-for="item in report.items" :key="item.key" :class="`is-${item.tone}`">
        <span aria-hidden="true">{{ item.ok ? "✓" : "!" }}</span>
        <div><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></div>
      </li>
    </ul>
    <div class="form-actions"><button class="button button-secondary" type="button" :disabled="loading" @click="emit('refresh')">{{ loading ? "A atualizar…" : "Atualizar diagnóstico" }}</button></div>
  </section>
</template>
