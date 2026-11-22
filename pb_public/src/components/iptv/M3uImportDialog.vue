<!--
  Projeto: Mediário
  Versão do projeto: 0.3.0-alpha.1

  Ficheiro: src/components/iptv/M3uImportDialog.vue
  Versão do ficheiro: 2.2.0
  Tipo: Diálogo Vue 3 com TypeScript
  Domínio: IPTV
  Estado: Em desenvolvimento
  Última revisão: 2026-11-22

  Finalidade:
  Lê, pré-visualiza, filtra, seleciona e importa canais IPTV a partir
  de playlists M3U ou M3U8.

  Entradas:
  - open: controla a apresentação do diálogo.
  - existing: canais IPTV existentes, usados para detetar duplicados.

  Saídas e eventos:
  - close: solicita o fecho do diálogo.
  - imported: informa quantos canais foram importados com sucesso.

  Regras:
  - Não importar entradas inválidas.
  - Não importar duplicados fortes por URL ou TVG-ID.
  - Continuar o lote depois de falhas individuais.
  - Remover o canal criado quando a criação da fonte falhar.
  - Apresentar um resumo final de importados, ignorados e falhados.
  - Permitir iniciar outra importação sem fechar o diálogo.
  - Reiniciar o estado quando o diálogo voltar a abrir.
  - Preservar os nomes reais dos campos PocketBase.

  Autor: Zubiaks
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import {
  iptvChannelRepository,
  iptvSourceRepository,
} from "@/domain/repositories";
import { parseM3u, type M3uItem } from "@/domain/iptv/m3u";
import { findM3uDuplicate } from "@/domain/iptv/m3uDuplicate";

import type { IptvChannelRecord } from "@/types/records";

interface ImportFailure {
  name: string;
  message: string;
}

interface ImportSummary {
  imported: number;
  skipped: number;
  failed: number;
  failures: ImportFailure[];
}

const props = defineProps<{
  open: boolean;
  existing: IptvChannelRecord[];
}>();

const emit = defineEmits<{
  close: [];
  imported: [count: number];
}>();

const firstInput = ref<HTMLInputElement | null>(null);
const items = ref<M3uItem[]>([]);
const fileName = ref("");
const error = ref("");
const importing = ref(false);
const progress = ref(0);
const batchTotal = ref(0);
const query = ref("");
const summary = ref<ImportSummary | null>(null);

const visible = computed(() => {
  const normalizedQuery = query.value.toLocaleLowerCase("pt-PT");

  return items.value.filter((item) => {
    if (!normalizedQuery) return true;

    return [item.name, item.groupTitle, item.tvgId].some((value) =>
      value.toLocaleLowerCase("pt-PT").includes(normalizedQuery),
    );
  });
});

const selected = computed(() =>
  items.value.filter((item) => item.selected && !item.errors.length),
);

const invalidCount = computed(() =>
  items.value.filter((item) => item.errors.length).length,
);

function reset(): void {
  items.value = [];
  fileName.value = "";
  error.value = "";
  importing.value = false;
  progress.value = 0;
  batchTotal.value = 0;
  query.value = "";
  summary.value = null;
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;

    reset();
    await nextTick();
    firstInput.value?.focus();
  },
);

async function readFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  fileName.value = file.name;
  error.value = "";
  progress.value = 0;
  batchTotal.value = 0;
  summary.value = null;

  try {
    items.value = parseM3u(await file.text());
  } catch (cause) {
    items.value = [];
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

function selectAll(value: boolean): void {
  for (const item of visible.value) {
    item.selected = value && !item.errors.length;
  }
}

function sourceType(url: string): "hls" | "http" {
  return /\.m3u8(?:$|[?#])/i.test(url) ? "hls" : "http";
}

async function run(): Promise<void> {
  const entries = [...selected.value];

  if (!entries.length) return;

  importing.value = true;
  progress.value = 0;
  batchTotal.value = entries.length;
  error.value = "";
  summary.value = null;

  let importedCount = 0;
  let skippedCount = 0;
  const failures: ImportFailure[] = [];

  for (const item of entries) {
    const duplicate = findM3uDuplicate(item, props.existing);

    if (duplicate.kind && duplicate.kind !== "name") {
      skippedCount += 1;
      progress.value += 1;
      continue;
    }

    let channel: IptvChannelRecord | null = null;

    try {
      channel = (await iptvChannelRepository.create({
        nome: item.name,
        url_stream: item.url,
        tvg_id: item.tvgId,
        tvg_name: item.tvgName,
        tvg_logo_url: item.tvgLogo,
        playlist_origem: fileName.value,
        adulto: item.adult,
        ativo: true,
        cemiterio: false,
        qualidade: "Desconhecida",
      })) as IptvChannelRecord;

      await iptvSourceRepository.create({
        canal_tv: channel.id,
        url: item.url,
        rotulo: "Importado da playlist",
        tipo: sourceType(item.url),
        qualidade: "Desconhecida",
        prioridade: 0,
        ativo: true,
      });

      importedCount += 1;
    } catch (cause) {
      let message = cause instanceof Error ? cause.message : String(cause);

      if (channel?.id) {
        try {
          await iptvChannelRepository.delete(channel.id);
        } catch (rollbackCause) {
          const rollbackMessage =
            rollbackCause instanceof Error
              ? rollbackCause.message
              : String(rollbackCause);

          message +=
            ` O canal criado não pôde ser removido: ${rollbackMessage}`;
        }
      }

      failures.push({
        name: item.name,
        message,
      });
    } finally {
      progress.value += 1;
    }
  }

  summary.value = {
    imported: importedCount,
    skipped: skippedCount,
    failed: failures.length,
    failures,
  };

  importing.value = false;

  if (importedCount > 0) {
    emit("imported", importedCount);
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="dialog-backdrop"
      @click.self="!importing && emit('close')"
    >
      <section
        class="dialog-panel m3u-import"
        role="dialog"
        aria-modal="true"
        aria-labelledby="m3u-title"
        @keydown.esc.prevent="!importing && emit('close')"
      >
        <div class="dialog-header">
          <div>
            <p class="eyebrow">IPTV</p>
            <h2 id="m3u-title">Importar playlist M3U</h2>
          </div>

          <button
            class="icon-button"
            type="button"
            aria-label="Fechar importador"
            :disabled="importing"
            @click="emit('close')"
          >
            ×
          </button>
        </div>

        <label class="form-field">
          <span>Playlist M3U ou M3U8</span>
          <input
            ref="firstInput"
            type="file"
            accept=".m3u,.m3u8,application/vnd.apple.mpegurl,audio/x-mpegurl"
            :disabled="importing"
            @change="readFile"
          />
        </label>

        <div
          v-if="error"
          class="form-alert form-alert-error"
          role="alert"
        >
          {{ error }}
        </div>

        <section
          v-if="summary"
          class="m3u-result"
          aria-labelledby="m3u-result-title"
          aria-live="polite"
        >
          <h3 id="m3u-result-title">Resultado da importação</h3>
          <p>
            <strong>{{ summary.imported }}</strong> importadas ·
            <strong>{{ summary.skipped }}</strong> ignoradas ·
            <strong>{{ summary.failed }}</strong> falhadas
          </p>

          <details v-if="summary.failures.length">
            <summary>Ver falhas</summary>
            <ul>
              <li
                v-for="failure in summary.failures"
                :key="`${failure.name}-${failure.message}`"
              >
                <strong>{{ failure.name }}:</strong>
                {{ failure.message }}
              </li>
            </ul>
          </details>

          <button
            class="button button-secondary"
            type="button"
            @click="reset"
          >
            Importar outra playlist
          </button>
        </section>

        <template v-if="items.length && !summary">
          <div class="m3u-summary" aria-live="polite">
            <strong>{{ items.length }} entradas</strong>
            <span>{{ selected.length }} selecionadas</span>
            <span>{{ invalidCount }} inválidas</span>
          </div>

          <div class="m3u-toolbar">
            <input
              v-model.trim="query"
              type="search"
              placeholder="Pesquisar nome, grupo ou TVG-ID"
              :disabled="importing"
            />

            <button
              class="button button-secondary"
              type="button"
              :disabled="importing"
              @click="selectAll(true)"
            >
              Selecionar visíveis
            </button>

            <button
              class="button button-secondary"
              type="button"
              :disabled="importing"
              @click="selectAll(false)"
            >
              Limpar visíveis
            </button>
          </div>

          <div class="m3u-list">
            <label
              v-for="item in visible"
              :key="`${item.url}-${item.name}`"
              class="m3u-row"
            >
              <input
                v-model="item.selected"
                type="checkbox"
                :disabled="importing || Boolean(item.errors.length)"
              />

              <span>
                <strong>{{ item.name }}</strong>
                <small>
                  {{ item.groupTitle || "Sem grupo" }} ·
                  {{ item.tvgId || "Sem TVG-ID" }}
                </small>
                <code>{{ item.url }}</code>
                <small
                  v-if="item.errors.length"
                  class="field-error"
                >
                  {{ item.errors.join(" · ") }}
                </small>
              </span>
            </label>
          </div>

          <progress
            v-if="importing"
            :value="progress"
            :max="batchTotal"
          >
            {{ progress }} de {{ batchTotal }}
          </progress>

          <div class="form-actions">
            <button
              class="button button-secondary"
              type="button"
              :disabled="importing"
              @click="emit('close')"
            >
              Cancelar
            </button>

            <button
              class="button button-primary"
              type="button"
              :disabled="importing || !selected.length"
              @click="run"
            >
              {{ importing ? "A importar…" : `Importar ${selected.length}` }}
            </button>
          </div>
        </template>
      </section>
    </div>
  </Teleport>
</template>
