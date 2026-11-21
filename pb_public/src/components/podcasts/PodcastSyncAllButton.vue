<!-- Mediario - Copyright (c) 2026 Zubiaks. See LICENSE.md. -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { streamRepository } from "@/domain/repositories";
import { syncPodcastFeed } from "@/domain/podcasts/sync";
import type { StreamRecord } from "@/types/records";

const emit = defineEmits<{ finished: [] }>();
const running = ref(false);
const cancelRequested = ref(false);
const completed = ref(0);
const total = ref(0);
const created = ref(0);
const updated = ref(0);
const skipped = ref(0);
const failed = ref(0);
const currentName = ref("");
const message = ref("");
const progress = computed(() => total.value ? Math.round((completed.value / total.value) * 100) : 0);

async function loadAllPodcasts(): Promise<StreamRecord[]> {
  const result: StreamRecord[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await streamRepository.list({
      page,
      perPage: 100,
      filter: 'tipo = "podcast" && ativo = true && cemiterio = false && rss_url != ""',
      sort: "ordem,nome",
    });
    result.push(...response.items);
    totalPages = response.totalPages || 1;
    page += 1;
  } while (page <= totalPages);
  return result;
}

async function run(): Promise<void> {
  running.value = true;
  cancelRequested.value = false;
  completed.value = created.value = updated.value = skipped.value = failed.value = 0;
  message.value = "";
  try {
    const podcasts = await loadAllPodcasts();
    total.value = podcasts.length;
    if (!podcasts.length) {
      message.value = "Não existem podcasts ativos com RSS configurado.";
      return;
    }
    for (const podcast of podcasts) {
      if (cancelRequested.value) break;
      currentName.value = podcast.nome;
      try {
        const result = await syncPodcastFeed(podcast);
        created.value += result.created;
        updated.value += result.updated;
        skipped.value += result.skipped;
      } catch {
        failed.value += 1;
      } finally {
        completed.value += 1;
      }
    }
    message.value = cancelRequested.value
      ? `Atualização cancelada após ${completed.value} de ${total.value} podcasts.`
      : `${completed.value} podcasts · ${created.value} novos · ${updated.value} atualizados · ${skipped.value} ignorados · ${failed.value} com erro`;
    emit("finished");
  } finally {
    currentName.value = "";
    running.value = false;
  }
}
</script>

<template>
  <div class="podcast-sync-all">
    <div class="podcast-sync-all-actions">
      <button class="button button-primary" type="button" :disabled="running" @click="run">
        {{ running ? `A atualizar ${completed}/${total}…` : "Atualizar todos os RSS" }}
      </button>
      <button v-if="running" class="button button-secondary" type="button" @click="cancelRequested = true">
        Cancelar após este podcast
      </button>
    </div>
    <div v-if="running" class="podcast-sync-all-progress" aria-live="polite">
      <div class="podcast-progress" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ width: `${progress}%` }" />
      </div>
      <small>{{ currentName || "A preparar…" }}</small>
    </div>
    <small v-if="message" class="field-hint" aria-live="polite">{{ message }}</small>
  </div>
</template>
