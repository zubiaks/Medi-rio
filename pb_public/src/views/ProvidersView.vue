<!--
  Projeto: Mediário
  Caminho: src/views/ProvidersView.vue
  Versão do ficheiro: 2.0.0
  Tipo: Página Vue 3 com TypeScript
  Domínio: Providers
  Finalidade: Gerir fontes externas e iniciar enriquecimento individual.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import ProviderDashboard from "@/components/providers/ProviderDashboard.vue";
import ExternalSourceDialog from "@/components/providers/ExternalSourceDialog.vue";
import TmdbSearchDialog from "@/components/providers/TmdbSearchDialog.vue";
import OmdbSearchDialog from "@/components/providers/OmdbSearchDialog.vue";
import {
  externalSourceRepository,
  syncJobRepository,
} from "@/domain/providers/repository";
import type {
  ExternalSourceRecord,
  SyncJobRecord,
} from "@/domain/providers/records";

const sources = ref<ExternalSourceRecord[]>([]);
const jobs = ref<SyncJobRecord[]>([]);
const loading = ref(true);
const error = ref("");
const search = ref("");
const provider = ref("");
const dialogOpen = ref(false);
const tmdbOpen = ref(false);
const omdbOpen = ref(false);
const editing = ref<ExternalSourceRecord | null>(null);

const providers = computed(() =>
  [...new Set(sources.value.map((item) => item.provider))].sort(),
);

const filtered = computed(() => {
  const query = search.value.toLocaleLowerCase("pt-PT");
  return sources.value.filter((item) =>
    (!provider.value || item.provider === provider.value) &&
    (!query || `${item.expand?.titulo?.titulo || ""} ${item.provider} ${item.external_id} ${item.tipo_externo || ""}`
      .toLocaleLowerCase("pt-PT")
      .includes(query)),
  );
});

async function load(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    const [sourceResult, jobResult] = await Promise.all([
      externalSourceRepository.list({
        page: 1,
        perPage: 500,
        sort: "provider,external_id",
        expand: "titulo",
      }),
      syncJobRepository.list({
        page: 1,
        perPage: 200,
        sort: "-iniciado_em",
      }),
    ]);
    sources.value = sourceResult.items;
    jobs.value = jobResult.items;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

function createSource(): void {
  editing.value = null;
  dialogOpen.value = true;
}

function editSource(source: ExternalSourceRecord): void {
  editing.value = source;
  dialogOpen.value = true;
}

async function saved(): Promise<void> {
  dialogOpen.value = false;
  tmdbOpen.value = false;
  editing.value = null;
  await load();
}

onMounted(load);
</script>

<template>
  <BasePageHeader
    eyebrow="Integrações externas"
    title="Providers"
    description="Fontes externas e enriquecimento individual do catálogo. As operações globais estão em Manutenção."
  >
    <template #actions>
      <RouterLink class="button button-secondary" to="/manutencao">Manutenção</RouterLink>
      <button class="button button-secondary" type="button" @click="tmdbOpen = true">Pesquisar TMDB</button>
      <button class="button button-secondary" type="button" @click="omdbOpen = true">Pesquisar OMDb</button>
      <button class="button button-primary" type="button" @click="createSource">＋ Nova fonte externa</button>
    </template>
  </BasePageHeader>

  <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
  <ProviderDashboard :sources="sources" :jobs="jobs" />

  <section class="panel provider-filters">
    <label class="form-field"><span>Pesquisar</span><input v-model.trim="search" type="search" placeholder="Título, provider ou identificador" /></label>
    <label class="form-field"><span>Provider</span><select v-model="provider"><option value="">Todos</option><option v-for="item in providers" :key="item" :value="item">{{ item }}</option></select></label>
  </section>

  <p v-if="loading" class="page-loading">A carregar fontes externas…</p>
  <BaseEmptyState v-else-if="!filtered.length" icon="◇" title="Sem fontes externas" description="Ainda não existem fontes para estes filtros." />
  <div v-else class="table-wrap"><table><thead><tr><th>Título</th><th>Provider</th><th>Identificador</th><th>Tipo</th><th>Principal</th><th>Última sincronização</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody><tr v-for="source in filtered" :key="source.id"><td>{{ source.expand?.titulo?.titulo || source.titulo }}</td><td>{{ source.provider }}</td><td>{{ source.external_id }}</td><td>{{ source.tipo_externo || "—" }}</td><td>{{ source.principal ? "Sim" : "Não" }}</td><td>{{ source.ultima_sincronizacao ? new Date(source.ultima_sincronizacao).toLocaleString("pt-PT") : "Nunca" }}</td><td><div class="library-row-actions"><a v-if="source.external_url" class="button button-secondary" :href="source.external_url" target="_blank" rel="noopener noreferrer">Abrir</a><button class="button button-secondary" type="button" @click="editSource(source)">Editar</button></div></td></tr></tbody></table></div>

  <TmdbSearchDialog :open="tmdbOpen" :existing="sources" @close="tmdbOpen = false" @saved="saved" />
  <OmdbSearchDialog :open="omdbOpen" :existing="sources" @close="omdbOpen = false" @saved="saved" />
  <ExternalSourceDialog :open="dialogOpen" :source="editing" :existing="sources" @close="dialogOpen = false" @saved="saved" />
</template>
