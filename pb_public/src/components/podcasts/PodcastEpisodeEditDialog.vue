<!-- Mediario - Copyright (c) 2026 Zubiaks. See LICENSE.md. -->
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { episodeRepository } from "@/domain/repositories";
import type { PodcastEpisodeRecord } from "@/types/records";

type Episode = PodcastEpisodeRecord & {
  imagem?: string;
  favorito?: boolean;
  descarregado?: boolean;
  ultima_escuta_em?: string;
};

const props = defineProps<{ episode: Episode | null }>();
const emit = defineEmits<{ close: []; saved: [Episode] }>();
const favorito = ref(false);
const descarregado = ref(false);
const ouvidoAte = ref<number | null>(null);
const ouvidoCompleto = ref(false);
const ultimaEscutaEm = ref("");
const imageFile = ref<File | null>(null);
const removeImage = ref(false);
const saving = ref(false);
const error = ref("");
const firstControl = ref<HTMLInputElement | null>(null);

function inputDate(value?: string): string {
  return value?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || "";
}
function pocketBaseDate(value: string): string | null {
  return value ? `${value} 00:00:00.000Z` : null;
}

watch(() => props.episode, async (item) => {
  favorito.value = item?.favorito === true;
  descarregado.value = item?.descarregado === true;
  ouvidoAte.value = item?.ouvido_ate_seg ?? null;
  ouvidoCompleto.value = item?.ouvido_completo === true;
  ultimaEscutaEm.value = inputDate(item?.ultima_escuta_em);
  imageFile.value = null;
  removeImage.value = false;
  error.value = "";
  if (item) {
    await nextTick();
    firstControl.value?.focus();
  }
}, { immediate: true });

function selectImage(event: Event): void {
  imageFile.value = (event.target as HTMLInputElement).files?.[0] || null;
  if (imageFile.value) removeImage.value = false;
}

async function save(): Promise<void> {
  if (!props.episode) return;
  saving.value = true;
  error.value = "";
  try {
    const payload: Record<string, unknown> = {
      favorito: favorito.value,
      descarregado: descarregado.value,
      ouvido_ate_seg: ouvidoAte.value,
      ouvido_completo: ouvidoCompleto.value,
      ultima_escuta_em: pocketBaseDate(ultimaEscutaEm.value),
    };
    if (imageFile.value) payload.imagem = imageFile.value;
    else if (removeImage.value) payload.imagem = null;

    const updated = await episodeRepository.update(props.episode.id, payload) as Episode;
    emit("saved", updated);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}
function close(): void { if (!saving.value) emit("close"); }
</script>

<template>
  <Teleport to="body">
    <div v-if="episode" class="dialog-backdrop" @click.self="close">
      <section
        class="dialog-panel podcast-edit-dialog episode-state-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="episode-state-title"
        @keydown.esc="close"
      >
        <h2 id="episode-state-title">Editar estado do episódio</h2>
        <p class="field-hint">
          O título, a descrição, o áudio, a data e a imagem remota vêm do RSS e podem ser atualizados na próxima sincronização.
        </p>
        <h3>{{ episode.titulo }}</h3>
        <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>

        <div class="episode-state-grid">
          <label class="check-field">
            <input ref="firstControl" v-model="favorito" type="checkbox" /> Favorito
          </label>
          <label class="check-field">
            <input v-model="descarregado" type="checkbox" /> Descarregado
          </label>
          <label class="check-field">
            <input v-model="ouvidoCompleto" type="checkbox" /> Ouvido completamente
          </label>
          <label class="form-field">
            <span>Ouvido até (segundos)</span>
            <input v-model.number="ouvidoAte" type="number" min="0" step="1" />
          </label>
          <label class="form-field">
            <span>Última escuta</span>
            <input v-model="ultimaEscutaEm" type="date" />
          </label>
          <label class="form-field">
            <span>Imagem local opcional</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" @change="selectImage" />
            <small class="field-hint">Esta imagem local tem prioridade sobre a imagem remota do RSS.</small>
          </label>
          <label v-if="episode.imagem" class="check-field">
            <input v-model="removeImage" type="checkbox" :disabled="Boolean(imageFile)" /> Remover imagem local atual
          </label>
        </div>

        <div class="form-actions">
          <button class="button button-secondary" type="button" :disabled="saving" @click="close">Cancelar</button>
          <button class="button button-primary" type="button" :disabled="saving" @click="save">
            {{ saving ? "A guardar…" : "Guardar estado" }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
