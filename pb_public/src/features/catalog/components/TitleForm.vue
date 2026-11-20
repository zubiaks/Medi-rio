<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw, watch } from "vue";
import {
  createEmptyTitleForm,
  type TitleFormData,
  type TitleValidationErrors,
} from "@/domain/catalog/models";
import { validateTitleForm } from "@/domain/catalog/validation";
import type { ExistingTitleImages } from "@/domain/catalog/images";
import { loadCatalogLookups } from "@/features/lookups/catalogLookups";
import type { CatalogLookups } from "@/types/lookups";
import ImageUploadField from "./ImageUploadField.vue";
import LookupMultiSelect from "./LookupMultiSelect.vue";

const emit = defineEmits<{
  submit: [TitleFormData];
  dirtyChange: [boolean];
}>();

const props = withDefaults(
  defineProps<{
    saving?: boolean;
    initialValue?: TitleFormData | null;
    submitLabel?: string;
    cancelTo?: string;
    existingImages?: ExistingTitleImages;
  }>(),
  {
    saving: false,
    initialValue: null,
    submitLabel: "Guardar título",
    cancelTo: "/catalogo",
    existingImages: () => ({}),
  },
);

const form = ref<TitleFormData>(createEmptyTitleForm());
const baseline = ref("");
const errors = ref<TitleValidationErrors>({});
const validationMessage = ref("");
const lookups = ref<CatalogLookups | null>(null);
const loadError = ref("");

const types = computed(
  () =>
    lookups.value?.tipos.filter(
      (item) => !form.value.midiaId || item.parentId === form.value.midiaId,
    ) ?? [],
);

function copyForm(value: TitleFormData): TitleFormData {
  const raw = toRaw(value);

  return {
    ...raw,
    paisIds: [...raw.paisIds],
    idiomaIds: [...raw.idiomaIds],
    generoIds: [...raw.generoIds],
    tagIds: [...raw.tagIds],
    plataformaIds: [...raw.plataformaIds],
    companhiaIds: [...raw.companhiaIds],
    categoriaFonteIds: [...raw.categoriaFonteIds],
  };
}

function signature(value: TitleFormData): string {
  const copy = copyForm(value);

  return JSON.stringify({
    ...copy,
    posterFile: copy.posterFile
      ? `${copy.posterFile.name}:${copy.posterFile.size}:${copy.posterFile.lastModified}`
      : null,
    backdropFile: copy.backdropFile
      ? `${copy.backdropFile.name}:${copy.backdropFile.size}:${copy.backdropFile.lastModified}`
      : null,
    logoFile: copy.logoFile
      ? `${copy.logoFile.name}:${copy.logoFile.size}:${copy.logoFile.lastModified}`
      : null,
  });
}

function applyInitialValue(value?: TitleFormData | null): void {
  form.value = copyForm(value ?? createEmptyTitleForm());
  errors.value = {};
  validationMessage.value = "";
  baseline.value = signature(form.value);
  emit("dirtyChange", false);
}

watch(() => props.initialValue, applyInitialValue, {
  immediate: true,
  deep: true,
});

watch(
  form,
  (value) => emit("dirtyChange", signature(value) !== baseline.value),
  { deep: true },
);

watch(
  () => form.value.midiaId,
  () => {
    if (!form.value.tipoId || !lookups.value) return;

    const selectedType = lookups.value.tipos.find(
      (item) => item.id === form.value.tipoId,
    );

    if (
      selectedType?.parentId &&
      selectedType.parentId !== form.value.midiaId
    ) {
      form.value.tipoId = "";
    }
  },
);

onMounted(async () => {
  try {
    lookups.value = await loadCatalogLookups();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});

function markImageForRemoval(field: "poster" | "backdrop" | "logo"): void {
  if (field === "poster") form.value.removePoster = true;
  if (field === "backdrop") form.value.removeBackdrop = true;
  if (field === "logo") form.value.removeLogo = true;
}

async function focusFirstInvalidField(): Promise<void> {
  await nextTick();

  const firstError = document.querySelector<HTMLElement>(
    ".title-form .field-error",
  );

  if (!firstError) return;

  const container = firstError.closest<HTMLElement>(
    ".form-field, .image-upload-field, .lookup-multi-select",
  );

  const control = container?.querySelector<HTMLElement>(
    "input, select, textarea, button",
  );

  control?.focus();
  firstError.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function submit(): Promise<void> {
  validationMessage.value = "";
  errors.value = validateTitleForm(form.value);

  const errorCount = Object.keys(errors.value).length;

  if (errorCount > 0) {
    validationMessage.value = `Corrige ${errorCount} campo${
      errorCount === 1 ? "" : "s"
    } antes de guardar.`;

    await focusFirstInvalidField();
    return;
  }

  emit("submit", copyForm(form.value));
}
</script>

<template>
  <section v-if="!lookups && !loadError" class="page-loading">
    <span class="loader" />
    <p>A carregar campos…</p>
  </section>

  <div v-else-if="loadError" class="empty-state">
    <strong>Erro ao carregar lookups</strong>
    <p>{{ loadError }}</p>
  </div>

  <form
    v-else-if="lookups"
    class="title-form"
    novalidate
    @submit.prevent="submit"
  >
    <div
      v-if="validationMessage"
      class="form-alert form-alert-error"
      role="alert"
      aria-live="assertive"
    >
      <strong>Não foi possível guardar.</strong>
      <p>{{ validationMessage }}</p>
      <ul>
        <li v-for="(message, field) in errors" :key="field">
          {{ message }}
        </li>
      </ul>
    </div>

    <fieldset>
      <legend>Identificação</legend>
      <div class="form-grid">
        <label class="form-field field-wide" for="title-name">
          <span>Título *</span>
          <input
            id="title-name"
            v-model.trim="form.titulo"
            name="titulo"
            maxlength="300"
            autocomplete="off"
          />
          <small v-if="errors.titulo" class="field-error">
            {{ errors.titulo }}
          </small>
        </label>

        <label class="form-field" for="title-original">
          <span>Título original</span>
          <input
            id="title-original"
            v-model.trim="form.tituloOriginal"
            name="titulo_original"
            maxlength="300"
          />
        </label>

        <label class="form-field" for="title-year">
          <span>Ano</span>
          <input
            id="title-year"
            v-model.number="form.ano"
            name="ano"
            type="number"
            min="1800"
            max="2100"
          />
          <small v-if="errors.ano" class="field-error">
            {{ errors.ano }}
          </small>
        </label>

        <label class="form-field" for="title-media">
          <span>Mídia *</span>
          <select id="title-media" v-model="form.midiaId" name="midia">
            <option value="">Selecionar…</option>
            <option
              v-for="item in lookups.midias"
              :key="item.id"
              :value="item.id"
            >
              {{ item.label }}
            </option>
          </select>
          <small v-if="errors.midiaId" class="field-error">
            {{ errors.midiaId }}
          </small>
        </label>

        <label class="form-field" for="title-type">
          <span>Tipo</span>
          <select id="title-type" v-model="form.tipoId" name="tipo">
            <option value="">Selecionar…</option>
            <option v-for="item in types" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="form-field" for="title-state">
          <span>Estado</span>
          <select id="title-state" v-model="form.estadoId" name="estado">
            <option value="">Selecionar…</option>
            <option
              v-for="item in lookups.estados"
              :key="item.id"
              :value="item.id"
            >
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="form-field" for="title-release">
          <span>Data de lançamento</span>
          <input
            id="title-release"
            v-model="form.dataLancamento"
            name="data_lancamento"
            type="date"
          />
        </label>

        <label class="form-field" for="title-age-rating">
          <span>Classificação etária</span>
          <input
            id="title-age-rating"
            v-model.trim="form.classificacaoEtaria"
            name="classificacao_etaria"
            maxlength="40"
          />
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Imagens</legend>
      <div class="image-fields">
        <ImageUploadField
          v-model="form.posterFile"
          v-model:url="form.posterUrl"
          label="Poster"
          aspect="poster"
          :existing-url="form.removePoster ? '' : props.existingImages.poster"
          :error="errors.posterFile"
          :url-error="errors.posterUrl"
          :max-width="1200"
          :max-height="1800"
          :max-bytes="5 * 1024 * 1024"
          @remove="markImageForRemoval('poster')"
        />

        <ImageUploadField
          v-model="form.backdropFile"
          v-model:url="form.backdropUrl"
          label="Backdrop"
          aspect="backdrop"
          :existing-url="form.removeBackdrop ? '' : props.existingImages.backdrop"
          :error="errors.backdropFile"
          :url-error="errors.backdropUrl"
          :max-width="1920"
          :max-height="1080"
          :max-bytes="5 * 1024 * 1024"
          @remove="markImageForRemoval('backdrop')"
        />

        <ImageUploadField
          v-model="form.logoFile"
          v-model:url="form.logoUrl"
          label="Logo"
          aspect="logo"
          accept="image/png,image/webp,image/avif"
          :existing-url="form.removeLogo ? '' : props.existingImages.logo"
          :error="errors.logoFile"
          :url-error="errors.logoUrl"
          :max-width="1600"
          :max-height="600"
          :max-bytes="2 * 1024 * 1024"
          preserve-png
          @remove="markImageForRemoval('logo')"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Descrição</legend>
      <div class="form-grid">
        <label class="form-field field-wide" for="title-tagline">
          <span>Tagline</span>
          <input
            id="title-tagline"
            v-model.trim="form.tagline"
            name="tagline"
            maxlength="500"
          />
        </label>

        <label class="form-field field-wide" for="title-synopsis">
          <span>Sinopse</span>
          <textarea
            id="title-synopsis"
            v-model="form.sinopse"
            name="sinopse"
            rows="7"
          />
        </label>

        <label class="form-field field-wide" for="title-notes">
          <span>Notas pessoais</span>
          <textarea
            id="title-notes"
            v-model="form.notasPessoais"
            name="notas_pessoais"
            rows="4"
            maxlength="20000"
          />
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Relações</legend>
      <div class="form-grid">
        <LookupMultiSelect
          v-model="form.generoIds"
          name="generos"
          label="Géneros"
          :options="lookups.generos"
        />
        <LookupMultiSelect
          v-model="form.tagIds"
          name="tags"
          label="Tags"
          :options="lookups.tags"
        />
        <LookupMultiSelect
          v-model="form.idiomaIds"
          name="idiomas"
          label="Idiomas"
          :options="lookups.idiomas"
        />
        <LookupMultiSelect
          v-model="form.paisIds"
          name="paises"
          label="Países"
          :options="lookups.paises"
        />
        <LookupMultiSelect
          v-model="form.plataformaIds"
          name="plataformas"
          label="Plataformas"
          :options="lookups.plataformas"
        />
        <LookupMultiSelect
          v-model="form.companhiaIds"
          name="companhias"
          label="Companhias"
          :options="lookups.companhias"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Métricas e IDs</legend>
      <div class="form-grid">
        <label class="form-field" for="title-rating">
          <span>Avaliação</span>
          <input
            id="title-rating"
            v-model.number="form.rating"
            name="rating"
            type="number"
            min="0"
            max="10"
            step=".1"
          />
          <small v-if="errors.rating" class="field-error">
            {{ errors.rating }}
          </small>
        </label>

        <label class="form-field" for="title-duration">
          <span>Duração (min)</span>
          <input
            id="title-duration"
            v-model.number="form.duracaoMin"
            name="duracao_min"
            type="number"
            min="0"
          />
        </label>

        <label class="form-field" for="title-pages">
          <span>Páginas</span>
          <input
            id="title-pages"
            v-model.number="form.paginas"
            name="paginas"
            type="number"
            min="0"
          />
        </label>

        <label class="form-field" for="title-hours">
          <span>Horas jogadas</span>
          <input
            id="title-hours"
            v-model.number="form.horasJogadas"
            name="horas_jogadas"
            type="number"
            min="0"
            step=".1"
          />
        </label>

        <label class="form-field" for="title-tmdb">
          <span>TMDB ID</span>
          <input
            id="title-tmdb"
            v-model.number="form.tmdbId"
            name="tmdb_id"
            type="number"
            min="1"
          />
          <small v-if="errors.tmdbId" class="field-error">
            {{ errors.tmdbId }}
          </small>
        </label>

        <label class="form-field" for="title-tmdb-type">
          <span>Tipo TMDB</span>
          <select
            id="title-tmdb-type"
            v-model="form.tipoTmdb"
            name="tipo_tmdb"
          >
            <option value="">Selecionar…</option>
            <option value="movie">Filme</option>
            <option value="tv">Televisão</option>
          </select>
        </label>

        <label class="form-field" for="title-imdb">
          <span>IMDb ID</span>
          <input
            id="title-imdb"
            v-model.trim="form.imdbId"
            name="imdb_id"
            maxlength="20"
            placeholder="tt1234567"
          />
          <small v-if="errors.imdbId" class="field-error">
            {{ errors.imdbId }}
          </small>
        </label>

        <label class="check-field" for="title-adult">
          <input
            id="title-adult"
            v-model="form.adulto"
            name="adulto"
            type="checkbox"
          />
          Conteúdo adulto
        </label>

        <label class="check-field" for="title-canonical">
          <input
            id="title-canonical"
            v-model="form.canonico"
            name="canonico"
            type="checkbox"
          />
          Entrada canónica
        </label>
      </div>
    </fieldset>

    <div class="form-actions">
      <RouterLink class="button button-secondary" :to="props.cancelTo">
        Cancelar
      </RouterLink>
      <button class="button button-primary" :disabled="props.saving">
        {{ props.saving ? "A guardar…" : props.submitLabel }}
      </button>
    </div>
  </form>
</template>
