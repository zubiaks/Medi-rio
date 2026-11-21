<!--
  Mediario
  Copyright (c) 2026 Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { ref } from "vue";
import { syncPodcastFeed, type PodcastSyncResult } from "@/domain/podcasts/sync";
import type { StreamRecord } from "@/types/records";

const props = defineProps<{ podcast: StreamRecord }>();
const emit = defineEmits<{ synced: [PodcastSyncResult] }>();
const syncing = ref(false);
const message = ref("");
const error = ref("");

async function sync(): Promise<void> {
  syncing.value = true;
  message.value = "";
  error.value = "";
  try {
    const result = await syncPodcastFeed(props.podcast);
    message.value = `${result.created} novos · ${result.updated} atualizados · ${result.skipped} ignorados`;
    emit("synced", result);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    syncing.value = false;
  }
}
</script>

<template>
  <div class="podcast-sync">
    <button class="button button-primary" type="button" :disabled="syncing || !podcast.rss_url" @click="sync">
      {{ syncing ? "A atualizar RSS…" : "Atualizar RSS" }}
    </button>
    <small v-if="message" class="field-hint" aria-live="polite">{{ message }}</small>
    <small v-if="error" class="field-error" role="alert">{{ error }}</small>
  </div>
</template>
