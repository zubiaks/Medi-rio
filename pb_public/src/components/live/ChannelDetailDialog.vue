<!--
  Ficheiro: src/components/live/ChannelDetailDialog.vue
  Tipo: Diálogo Vue.
  Função: Mostra detalhes, gere fontes e abre o player do canal.
-->
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { pb } from "@/infrastructure/pocketbase/client";
import type { ChannelRecord, StreamLinkRecord } from "@/types/records";
import { qualityLabel } from "@/domain/live/format";
import StreamLinkManager from "./StreamLinkManager.vue";
import StreamPlayerDialog from "./StreamPlayerDialog.vue";

const props = defineProps<{
  channel: ChannelRecord | null;
  links: StreamLinkRecord[];
  loading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  edit: [ChannelRecord];
  linksChanged: [StreamLinkRecord[]];
  channelChanged: [ChannelRecord];
}>();

const closeButton = ref<HTMLButtonElement | null>(null);
const playerOpen = ref(false);

watch(
  () => props.channel,
  async (value) => {
    playerOpen.value = false;
    if (value) {
      await nextTick();
      closeButton.value?.focus();
    }
  },
);

function logo(channel: ChannelRecord): string {
  return channel.logo
    ? pb.files.getURL(channel, channel.logo, { thumb: "256x256" })
    : channel.tvg_logo_url || "";
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="channel"
      class="dialog-backdrop"
      @click.self="emit('close')"
    >
      <section
        class="dialog-panel channel-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="channel-detail-title"
        @keydown.esc="emit('close')"
      >
        <button
          ref="closeButton"
          class="icon-button channel-detail-close"
          type="button"
          aria-label="Fechar detalhe"
          @click="emit('close')"
        >
          ×
        </button>

        <header class="channel-detail-header">
          <div class="channel-detail-logo">
            <img
              v-if="logo(channel)"
              :src="logo(channel)"
              :alt="`Logótipo de ${channel.nome}`"
            />
            <span v-else aria-hidden="true">▣</span>
          </div>

          <div>
            <p class="eyebrow">
              {{ channel.expand?.categoria?.nome || "Canal TV" }}
            </p>
            <h2 id="channel-detail-title">{{ channel.nome }}</h2>
            <p>
              {{ qualityLabel(channel.qualidade) }} ·
              {{ channel.expand?.pais?.nome || "País desconhecido" }} ·
              {{ channel.ativo === false ? "Inativo" : "Ativo" }}
            </p>
            <button
              class="button button-primary"
              type="button"
              @click="emit('edit', channel)"
            >
              Editar canal
            </button>
          </div>
        </header>

        <section class="detail-section" aria-labelledby="channel-sources-title">
          <h3 id="channel-sources-title">Fontes disponíveis</h3>
          <div v-if="loading" class="page-loading" aria-live="polite">
            <span class="loader" aria-hidden="true" />
            <span class="sr-only">A carregar fontes.</span>
          </div>
          <StreamLinkManager
            v-else
            :channel="channel"
            :links="links"
            @changed="emit('linksChanged', $event)"
            @channel-changed="emit('channelChanged', $event)"
            @play="playerOpen = true"
          />
        </section>

        <details class="detail-section">
          <summary>Dados técnicos IPTV/XMLTV</summary>
          <dl class="channel-tech">
            <div><dt>TVG-ID</dt><dd>{{ channel.tvg_id || "—" }}</dd></div>
            <div><dt>TVG name</dt><dd>{{ channel.tvg_name || "—" }}</dd></div>
            <div><dt>EPG-ID</dt><dd>{{ channel.epg_id || "—" }}</dd></div>
            <div><dt>Playlist</dt><dd>{{ channel.playlist_origem || "—" }}</dd></div>
          </dl>
        </details>

        <StreamPlayerDialog
          :channel="channel"
          :links="links"
          :open="playerOpen"
          @close="playerOpen = false"
        />
      </section>
    </div>
  </Teleport>
</template>
