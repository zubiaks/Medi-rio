<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BaseMetricCard from "@/components/base/BaseMetricCard.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import { exemplarRepository } from "@/domain/repositories";
const total = ref(0); const borrowed = ref(0); const items = ref<Array<Record<string, unknown>>>([]);
onMounted(async () => { const [page, count] = await Promise.all([exemplarRepository.list({ perPage: 30, sort: "-updated", expand: "titulo,formato,tipo_edicao" }).catch(() => null), exemplarRepository.count("emprestado=true").catch(() => 0)]); if (page) { items.value = page.items; total.value = page.totalItems; } borrowed.value = count; });
</script>
<template><BasePageHeader eyebrow="Coleção física" title="Biblioteca" description="Exemplares, formatos, edições, localização e empréstimos."><template #actions><button class="button button-primary">＋ Novo exemplar</button></template></BasePageHeader><section class="stats-grid compact-stats"><BaseMetricCard icon="▤" label="Exemplares" :value="total" detail="na coleção"/><BaseMetricCard icon="↗" label="Emprestados" :value="borrowed" detail="fora da coleção" tone="amber"/><BaseMetricCard icon="◇" label="Formatos" value="—" detail="físicos e digitais" tone="cyan"/><BaseMetricCard icon="€" label="Valor" value="—" detail="avaliação futura" tone="pink"/></section><BaseEmptyState v-if="!items.length" icon="▤" title="Sem exemplares" description="Regista as cópias físicas e digitais que possuis."/><div v-else class="table-wrap"><table><thead><tr><th>Record</th><th>Localização</th><th>Estado</th></tr></thead><tbody><tr v-for="item in items" :key="String(item.id)"><td>{{ item.id }}</td><td>{{ item.localizacao || '—' }}</td><td>{{ item.emprestado ? 'Emprestado' : 'Disponível' }}</td></tr></tbody></table></div></template>
