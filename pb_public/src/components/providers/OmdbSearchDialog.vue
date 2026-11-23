<!-- Mediário | OMDb 0.8.0, Fase 8B: associação e aplicação controlada. -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { titleRepository } from "@/domain/repositories";
import { externalSourceRepository } from "@/domain/providers/repository";
import { writeAuditLog } from "@/domain/providers/audit";
import { prepareProtectedSync } from "@/domain/providers/protectedSync";
import {
  loadOmdbDetails,
  searchOmdb,
  type OmdbDetails,
  type OmdbSearchResult,
  type OmdbType,
} from "@/domain/providers/omdbClient";
import {
  buildOmdbDifferences,
  buildSelectedOmdbPayload,
  selectEmptyOmdbFields,
  type OmdbEnrichmentField,
} from "@/domain/providers/omdbEnrichment";
import { omdbSourcePayload } from "@/domain/providers/omdbSource";
import OmdbRatingsPanel from "./OmdbRatingsPanel.vue";
import type { SyncJobRecord } from "@/domain/providers/records";
import type { ExternalSourceRecord } from "@/domain/providers/records";
import type { TitleRecord } from "@/types/records";

const props = defineProps<{
  open: boolean;
  existing: ExternalSourceRecord[];
}>();
const emit = defineEmits<{
  close: [];
  saved: [ExternalSourceRecord];
}>();

const query = ref("");
const type = ref<OmdbType>("");
const year = ref("");
const results = ref<OmdbSearchResult[]>([]);
const selectedResult = ref<OmdbSearchResult | null>(null);
const details = ref<OmdbDetails | null>(null);
const titleQuery = ref("");
const titleResults = ref<TitleRecord[]>([]);
const selectedTitle = ref<TitleRecord | null>(null);
const selectedFields = ref<OmdbEnrichmentField[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const success = ref("");
let titleTimer: ReturnType<typeof setTimeout> | undefined;

const differences = computed(() =>
  selectedTitle.value && details.value
    ? buildOmdbDifferences(selectedTitle.value, details.value)
    : [],
);

watch(() => props.open, (open) => {
  if (!open) return;
  query.value = "";
  type.value = "";
  year.value = "";
  results.value = [];
  selectedResult.value = null;
  details.value = null;
  titleQuery.value = "";
  titleResults.value = [];
  selectedTitle.value = null;
  selectedFields.value = [];
  error.value = "";
  success.value = "";
});

watch(titleQuery, (value) => {
  if (titleTimer) clearTimeout(titleTimer);
  if (value.trim().length < 2) {
    titleResults.value = [];
    return;
  }
  titleTimer = setTimeout(async () => {
    const escaped = value.trim().replaceAll("\\", "\\\\").replaceAll('"', '\\"');
    titleResults.value = (await titleRepository.list({
      page: 1,
      perPage: 20,
      filter: `apagado = false && (titulo ~ "${escaped}" || titulo_original ~ "${escaped}")`,
      sort: "titulo",
    })).items;
  }, 300);
});

async function runSearch(): Promise<void> {
  if (query.value.trim().length < 2) {
    error.value = "Escreve pelo menos dois caracteres.";
    return;
  }
  loading.value = true;
  error.value = "";
  success.value = "";
  selectedResult.value = null;
  details.value = null;
  selectedTitle.value = null;
  try {
    const response = await searchOmdb(query.value.trim(), type.value, year.value);
    results.value = response.results;
    if (!response.results.length) {
      error.value = response.message || "Nenhum resultado encontrado.";
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function chooseResult(item: OmdbSearchResult): Promise<void> {
  selectedResult.value = item;
  selectedTitle.value = null;
  selectedFields.value = [];
  titleQuery.value = item.title;
  loading.value = true;
  error.value = "";
  try {
    details.value = await loadOmdbDetails(item.imdb_id);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

function chooseTitle(title: TitleRecord): void {
  selectedTitle.value = title;
  titleQuery.value = `${title.titulo}${title.ano ? ` (${title.ano})` : ""}`;
  titleResults.value = [];
  selectedFields.value = selectEmptyOmdbFields(
    details.value ? buildOmdbDifferences(title, details.value) : [],
  );
}

function display(value: unknown): string {
  return value === null || value === undefined || value === ""
    ? "Sem valor"
    : String(value);
}

async function jobScheduled(job: SyncJobRecord): Promise<void> {
  if (!selectedTitle.value) return;
  await writeAuditLog({
    entidade: "titulos",
    entidade_id: selectedTitle.value.id,
    entidade_nome: selectedTitle.value.titulo,
    acao: "sincronizar",
    origem: "interface",
    sucesso: true,
    detalhes: {
      provider: "omdb",
      operacao: "agendamento",
      sync_job_id: job.id,
    },
  });
}

async function apply(): Promise<void> {
  if (!selectedTitle.value || !details.value || !selectedFields.value.length) return;
  saving.value = true;
  error.value = "";
  success.value = "";
  try {
    const duplicate = props.existing.find((item) =>
      item.provider === "omdb" &&
      item.external_id === details.value?.imdb_id &&
      item.titulo !== selectedTitle.value?.id,
    );
    if (duplicate) {
      throw new Error("Este IMDb ID já está associado a outro título.");
    }

    const protection = await prepareProtectedSync(
      selectedTitle.value,
      "aplicar ratings OMDb",
      selectedFields.value,
    );
    selectedTitle.value = protection.current;
    const payload = buildSelectedOmdbPayload(details.value, selectedFields.value);
    await titleRepository.update(selectedTitle.value.id, {
      ...payload,
      fonte_principal:
        (selectedTitle.value as unknown as Record<string, unknown>).fonte_principal || "omdb",
      ultima_sincronizacao: new Date().toISOString(),
      sync_estado: "atualizado",
      sync_erro: "",
    });

    const sourcePayload = omdbSourcePayload(selectedTitle.value.id, details.value);
    const existingSource = props.existing.find((item) =>
      item.provider === "omdb" && item.titulo === selectedTitle.value?.id,
    );
    const savedSource = existingSource
      ? await externalSourceRepository.update(existingSource.id, sourcePayload)
      : await externalSourceRepository.create(sourcePayload);

    await writeAuditLog({
      entidade: "titulos",
      entidade_id: selectedTitle.value.id,
      entidade_nome: selectedTitle.value.titulo,
      acao: "sincronizar",
      origem: "interface",
      sucesso: true,
      detalhes: {
        provider: "omdb",
        imdb_id: details.value.imdb_id,
        campos_aplicados: selectedFields.value,
        valores_novos: payload,
      },
    });

    success.value = "Ratings OMDb aplicados com sucesso.";
    emit("saved", savedSource);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="!saving && emit('close')">
      <section class="dialog-panel omdb-search-dialog" role="dialog" aria-modal="true" aria-labelledby="omdb-search-title">
        <div class="dialog-header">
          <div><p class="eyebrow">Provider OMDb</p><h2 id="omdb-search-title">Associar e aplicar ratings</h2></div>
          <button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="emit('close')">×</button>
        </div>
        <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>
        <div v-if="success" class="form-alert form-alert-success" role="status">{{ success }}</div>
        <form class="omdb-search-form" @submit.prevent="runSearch">
          <label class="form-field"><span>Pesquisa OMDb</span><input v-model.trim="query" type="search" required /></label>
          <label class="form-field"><span>Tipo</span><select v-model="type"><option value="">Todos</option><option value="movie">Filme</option><option value="series">Série</option><option value="episode">Episódio</option></select></label>
          <label class="form-field"><span>Ano</span><input v-model.trim="year" inputmode="numeric" pattern="\d{4}" maxlength="4" /></label>
          <button class="button button-primary" type="submit" :disabled="loading || saving">{{ loading ? "A pesquisar…" : "Pesquisar" }}</button>
        </form>
        <div v-if="results.length" class="omdb-result-grid">
          <button v-for="item in results" :key="item.imdb_id" type="button" class="omdb-result-card" :class="{ 'is-selected': selectedResult?.imdb_id === item.imdb_id }" @click="chooseResult(item)">
            <img v-if="item.poster_url" :src="item.poster_url" :alt="`Poster de ${item.title}`" loading="lazy" />
            <span v-else class="tmdb-poster-fallback" aria-hidden="true">◇</span>
            <strong>{{ item.title }}</strong><small>{{ item.year }} · {{ item.type }}</small><code>{{ item.imdb_id }}</code>
          </button>
        </div>
        <section v-if="details" class="omdb-association">
          <h3>Selecionar título do catálogo</h3>
          <label class="form-field"><span>Título existente *</span><input v-model.trim="titleQuery" type="search" /></label>
          <ul v-if="titleResults.length" class="provider-title-results"><li v-for="title in titleResults" :key="title.id"><button type="button" @click="chooseTitle(title)">{{ title.titulo }}<span>{{ title.ano || "—" }}</span></button></li></ul>
          <p v-if="selectedTitle">Selecionado: <strong>{{ selectedTitle.titulo }}</strong></p>
        </section>
        <section v-if="selectedTitle && details" class="omdb-comparison">
          <div class="tmdb-enrichment-header"><div><p class="eyebrow">Pré-visualização</p><h3>Comparar ratings e identificadores</h3></div><button class="button button-secondary" type="button" @click="selectedFields = selectEmptyOmdbFields(differences)">Selecionar campos vazios</button></div>
          <p v-if="!differences.length" class="form-alert">Não existem diferenças aplicáveis.</p>
          <div v-else class="tmdb-difference-list"><label v-for="item in differences" :key="item.field" class="tmdb-difference-row"><input v-model="selectedFields" type="checkbox" :value="item.field" /><span class="tmdb-difference-label"><strong>{{ item.label }}</strong><small>{{ item.empty ? "Campo vazio" : "Valor já preenchido" }}</small></span><span><small>Atual</small>{{ display(item.currentValue) }}</span><span><small>OMDb</small>{{ display(item.proposedValue) }}</span></label></div>
          <div class="form-actions"><button class="button button-primary" type="button" :disabled="saving || !selectedFields.length" @click="apply">{{ saving ? "A aplicar…" : `Aplicar ${selectedFields.length} campo(s)` }}</button></div>
        </section>
        <OmdbRatingsPanel
          v-if="selectedTitle && details"
          :title="selectedTitle"
          :details="details"
          :disabled="saving"
          @scheduled="jobScheduled"
        />
        <div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Fechar</button></div>
      </section>
    </div>
  </Teleport>
</template>
