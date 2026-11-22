<!--
  Projeto: Mediário
  Ficheiro: src/components/diary/DiaryEntryDialog.vue
  Tipo: Diálogo Vue 3 com TypeScript
  Domínio: Diário

  Finalidade:
  Cria e edita sessões de consumo relacionadas com títulos, temporadas,
  episódios e plataformas.
-->
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { titleRepository } from "@/domain/repositories";
import {
  diaryEntryRepository,
  diaryEpisodeRepository,
  diaryPlatformRepository,
  seasonRepository,
} from "@/domain/diary/repository";
import {
  calculatePercentage,
  createDiaryEntryForm,
  hasErrors,
  validateDiaryEntry,
  type DiaryEntryErrors,
} from "@/domain/diary/validation";
import type {
  DiaryEntryRecord,
  EpisodeRecord,
  SeasonRecord,
} from "@/domain/diary/records";
import type { NamedRecord, TitleRecord } from "@/types/records";

const props = defineProps<{
  open: boolean;
  entry: DiaryEntryRecord | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [DiaryEntryRecord];
}>();

const form = ref(createDiaryEntryForm());
const errors = ref<DiaryEntryErrors>({});
const submitError = ref("");
const saving = ref(false);
const titleQuery = ref("");
const titleResults = ref<TitleRecord[]>([]);
const seasons = ref<SeasonRecord[]>([]);
const episodes = ref<EpisodeRecord[]>([]);
const platforms = ref<NamedRecord[]>([]);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => [props.open, props.entry] as const,
  async ([open, entry]) => {
    if (!open) return;
    form.value = createDiaryEntryForm(entry);
    errors.value = {};
    submitError.value = "";
    titleQuery.value = entry?.expand?.titulo?.titulo || "";
    platforms.value = (
      await diaryPlatformRepository.list({
        page: 1,
        perPage: 200,
        filter: "ativa = true",
        sort: "ordem,nome",
      })
    ).items;
    await loadRelations();
  },
  { immediate: true },
);

watch(titleQuery, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (value.trim().length < 2) {
    titleResults.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    const slash = String.fromCharCode(92);
    const escaped = value.trim().split(slash).join(slash + slash).split('"').join(slash + '"');
    titleResults.value = (
      await titleRepository.list({
        page: 1,
        perPage: 20,
        filter: `apagado = false && (titulo ~ "${escaped}" || titulo_original ~ "${escaped}")`,
        sort: "titulo",
      })
    ).items;
  }, 300);
});

watch(() => form.value.temporada, async () => {
  form.value.episodio = "";
  await loadEpisodes();
});

async function loadRelations(): Promise<void> {
  if (!form.value.titulo) {
    seasons.value = [];
    episodes.value = [];
    return;
  }
  seasons.value = (
    await seasonRepository.list({
      page: 1,
      perPage: 200,
      filter: `titulo = "${form.value.titulo}"`,
      sort: "numero",
    })
  ).items;
  await loadEpisodes();
}

async function loadEpisodes(): Promise<void> {
  if (!form.value.temporada) {
    episodes.value = [];
    return;
  }
  episodes.value = (
    await diaryEpisodeRepository.list({
      page: 1,
      perPage: 500,
      filter: `temporada = "${form.value.temporada}"`,
      sort: "numero",
    })
  ).items;
}

async function selectTitle(title: TitleRecord): Promise<void> {
  form.value.titulo = title.id;
  titleQuery.value = `${title.titulo}${title.ano ? ` (${title.ano})` : ""}`;
  titleResults.value = [];
  await loadRelations();
}

async function save(): Promise<void> {
  errors.value = validateDiaryEntry(form.value);
  submitError.value = "";
  await nextTick();
  if (hasErrors(errors.value)) return;

  saving.value = true;
  try {
    const payload = {
      ...form.value,
      iniciado_em: new Date(form.value.iniciado_em).toISOString(),
      terminado_em: form.value.terminado_em
        ? new Date(form.value.terminado_em).toISOString()
        : "",
      percentagem: calculatePercentage(
        form.value.progresso_seg,
        form.value.duracao_seg,
        form.value.completo,
      ),
      notas: form.value.notas.trim(),
    };
    const saved = props.entry
      ? await diaryEntryRepository.update(props.entry.id, payload)
      : await diaryEntryRepository.create(payload);
    emit("saved", saved);
  } catch (cause) {
    submitError.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="!saving && emit('close')">
      <section class="dialog-panel diary-entry-dialog" role="dialog" aria-modal="true" aria-labelledby="diary-entry-title">
        <form novalidate @submit.prevent="save">
          <div class="dialog-header">
            <div><p class="eyebrow">Diário</p><h2 id="diary-entry-title">{{ entry ? "Editar registo" : "Novo registo" }}</h2></div>
            <button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="emit('close')">×</button>
          </div>
          <div v-if="submitError" class="form-alert form-alert-error" role="alert">{{ submitError }}</div>
          <div class="form-grid">
            <label class="form-field field-wide"><span>Título *</span><input v-model.trim="titleQuery" type="search" :aria-invalid="errors.titulo ? 'true' : 'false'"/><small v-if="errors.titulo" class="field-error">{{ errors.titulo }}</small></label>
            <ul v-if="titleResults.length" class="diary-title-results field-wide"><li v-for="title in titleResults" :key="title.id"><button type="button" @click="selectTitle(title)">{{ title.titulo }} <span>{{ title.ano || "—" }}</span></button></li></ul>
            <label v-if="seasons.length" class="form-field"><span>Temporada</span><select v-model="form.temporada"><option value="">Sem temporada</option><option v-for="season in seasons" :key="season.id" :value="season.id">{{ season.numero }} · {{ season.nome || "Temporada" }}</option></select></label>
            <label v-if="episodes.length" class="form-field"><span>Episódio</span><select v-model="form.episodio"><option value="">Sem episódio</option><option v-for="episode in episodes" :key="episode.id" :value="episode.id">{{ episode.numero }} · {{ episode.titulo }}</option></select></label>
            <label class="form-field"><span>Início *</span><input v-model="form.iniciado_em" type="datetime-local"/></label>
            <label class="form-field"><span>Conclusão</span><input v-model="form.terminado_em" type="datetime-local"/><small v-if="errors.terminado_em" class="field-error">{{ errors.terminado_em }}</small></label>
            <label class="form-field"><span>Duração total (segundos)</span><input v-model.number="form.duracao_seg" type="number" min="0" step="1"/></label>
            <label class="form-field"><span>Progresso (segundos)</span><input v-model.number="form.progresso_seg" type="number" min="0" step="1"/><small v-if="errors.progresso_seg" class="field-error">{{ errors.progresso_seg }}</small></label>
            <label class="form-field"><span>Origem</span><input v-model.trim="form.origem" maxlength="200" placeholder="Casa, cinema, viagem…"/></label>
            <label class="form-field"><span>Plataforma</span><select v-model="form.plataforma"><option value="">Sem plataforma</option><option v-for="platform in platforms" :key="platform.id" :value="platform.id">{{ platform.nome }}</option></select></label>
            <label class="check-field"><input v-model="form.completo" type="checkbox"/> Sessão concluída</label>
            <label class="check-field"><input v-model="form.revisualizacao" type="checkbox"/> Revisualização</label>
            <label class="form-field field-wide"><span>Notas</span><textarea v-model="form.notas" rows="4" maxlength="5000"/></label>
          </div>
          <div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button><button class="button button-primary" type="submit" :disabled="saving">{{ saving ? "A guardar…" : "Guardar registo" }}</button></div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
