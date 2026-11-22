<!--
  Projeto: Mediário
  Versão do projeto: 0.3.0-alpha.1

  Ficheiro: src/components/iptv/M3uImportDialog.vue
  Versão do ficheiro: 3.0.0
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
  - Criar ou reutilizar categorias a partir de group-title.
  - Detetar duplicados dentro da própria playlist.
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
  iptvCategoryRepository,
  iptvChannelRepository,
  iptvSourceRepository,
} from "@/domain/repositories";
import { parseM3u, type M3uItem } from "@/domain/iptv/m3u";
import { findM3uDuplicate } from "@/domain/iptv/m3uDuplicate";
import {
  buildM3uImportPlan,
  type M3uImportMode,
} from "@/domain/iptv/m3uImportPlan";
import {
  addM3uImportHistory,
  downloadM3uReport,
  getM3uImportHistory,
  type M3uImportHistoryEntry,
} from "@/domain/iptv/m3uImportHistory";

import type {
  IptvCategoryRecord,
  IptvChannelRecord,
} from "@/types/records";

interface ImportFailure {
  name: string;
  message: string;
}

interface ImportSummary {
  imported: number;
  skipped: number;
  failed: number;
  failures: ImportFailure[];
  categoriesCreated: number;
  internalDuplicates: number;
  updated: number;
  unchanged: number;
  sourcesAdded: number;
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
const importMode = ref<M3uImportMode>("sync");
const history = ref<M3uImportHistoryEntry[]>(getM3uImportHistory());
const startedAt = ref(0);

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

const importPlan = computed(() =>
  buildM3uImportPlan(items.value, props.existing),
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
  importMode.value = "sync";
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

function normalizedKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function internalDuplicateKeys(entries: M3uItem[]): Set<M3uItem> {
  const seenUrls = new Set<string>();
  const seenTvgIds = new Set<string>();
  const duplicates = new Set<M3uItem>();

  for (const item of entries) {
    const url = item.url.trim();
    const tvgId = normalizedKey(item.tvgId);

    if (seenUrls.has(url) || (tvgId && seenTvgIds.has(tvgId))) {
      duplicates.add(item);
      continue;
    }

    seenUrls.add(url);
    if (tvgId) seenTvgIds.add(tvgId);
  }

  return duplicates;
}

async function loadCategoryMap(): Promise<Map<string, IptvCategoryRecord>> {
  const result = await iptvCategoryRepository.list({
    page: 1,
    perPage: 500,
    sort: "ordem,nome",
  });

  return new Map(
    result.items.map((category) => [normalizedKey(category.nome), category]),
  );
}

async function categoryFor(
  groupTitle: string,
  categories: Map<string, IptvCategoryRecord>,
): Promise<{ id?: string; created: boolean }> {
  const name = groupTitle.trim();
  if (!name) return { created: false };

  const key = normalizedKey(name);
  const existing = categories.get(key);
  if (existing) return { id: existing.id, created: false };

  const created = await iptvCategoryRepository.create({
    nome: name,
    ativo: true,
    ordem: 0,
  });
  categories.set(key, created);
  return { id: created.id, created: true };
}

function matchingChannel(item: M3uItem): IptvChannelRecord | undefined {
  if (item.tvgId) {
    const byTvgId = props.existing.find(
      (channel) => channel.tvg_id === item.tvgId,
    );
    if (byTvgId) return byTvgId;
  }

  return props.existing.find((channel) => channel.url_stream === item.url);
}

function channelPatch(
  channel: IptvChannelRecord,
  item: M3uItem,
  categoryId?: string,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if (item.name && item.name !== channel.nome) patch.nome = item.name;
  if (item.url && item.url !== channel.url_stream) patch.url_stream = item.url;
  if (item.tvgId && item.tvgId !== channel.tvg_id) patch.tvg_id = item.tvgId;
  if (item.tvgName && item.tvgName !== channel.tvg_name) patch.tvg_name = item.tvgName;
  if (item.tvgLogo && item.tvgLogo !== channel.tvg_logo_url) {
    patch.tvg_logo_url = item.tvgLogo;
  }
  if (categoryId && categoryId !== channel.categoria) patch.categoria = categoryId;
  if (fileName.value && fileName.value !== channel.playlist_origem) {
    patch.playlist_origem = fileName.value;
  }
  if (item.adult !== Boolean(channel.adulto)) patch.adulto = item.adult;

  return patch;
}

async function ensureSource(channelId: string, item: M3uItem): Promise<boolean> {
  const result = await iptvSourceRepository.list({
    page: 1,
    perPage: 200,
    filter: `canal_tv = "${channelId}"`,
  });

  if (result.items.some((source) => source.url === item.url)) return false;

  await iptvSourceRepository.create({
    canal_tv: channelId,
    url: item.url,
    rotulo: "Importado da playlist",
    tipo: sourceType(item.url),
    qualidade: "Desconhecida",
    prioridade: result.items.length,
    ativo: true,
  });

  return true;
}

async function run(): Promise<void> {
  const entries = [...selected.value];
  if (!entries.length) return;

  importing.value = true;
  startedAt.value = Date.now();
  progress.value = 0;
  batchTotal.value = entries.length;
  error.value = "";
  summary.value = null;

  let importedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  let skippedCount = 0;
  let categoriesCreated = 0;
  let sourcesAdded = 0;
  const failures: ImportFailure[] = [];
  const duplicateItems = internalDuplicateKeys(entries);

  try {
    const categories = await loadCategoryMap();

    for (const item of entries) {
      if (duplicateItems.has(item)) {
        skippedCount += 1;
        progress.value += 1;
        continue;
      }

      let createdChannel: IptvChannelRecord | null = null;

      try {
        const category = await categoryFor(item.groupTitle, categories);
        if (category.created) categoriesCreated += 1;

        const existing = matchingChannel(item);

        if (existing) {
          if (importMode.value === "create-only") {
            skippedCount += 1;
            continue;
          }

          let changed = false;

          if (importMode.value === "sync") {
            const patch = channelPatch(existing, item, category.id);
            changed = Object.keys(patch).length > 0;

            if (changed) {
              await iptvChannelRepository.update(existing.id, patch);
            }
          }

          const sourceAdded = await ensureSource(existing.id, item);
          if (sourceAdded) {
            sourcesAdded += 1;
            changed = true;
          }

          if (changed) updatedCount += 1;
          else unchangedCount += 1;
        } else {
          createdChannel = (await iptvChannelRepository.create({
            nome: item.name,
            url_stream: item.url,
            tvg_id: item.tvgId,
            tvg_name: item.tvgName,
            tvg_logo_url: item.tvgLogo,
            playlist_origem: fileName.value,
            adulto: item.adult,
            ativo: true,
            cemiterio: false,
            categoria: category.id,
            qualidade: "Desconhecida",
          })) as IptvChannelRecord;

          await iptvSourceRepository.create({
            canal_tv: createdChannel.id,
            url: item.url,
            rotulo: "Importado da playlist",
            tipo: sourceType(item.url),
            qualidade: "Desconhecida",
            prioridade: 0,
            ativo: true,
          });
          importedCount += 1;
        }
      } catch (cause) {
        let message = cause instanceof Error ? cause.message : String(cause);

        if (createdChannel?.id) {
          try {
            await iptvChannelRepository.delete(createdChannel.id);
          } catch (rollbackCause) {
            const rollbackMessage = rollbackCause instanceof Error
              ? rollbackCause.message
              : String(rollbackCause);
            message += ` O canal criado não pôde ser removido: ${rollbackMessage}`;
          }
        }

        failures.push({ name: item.name, message });
      } finally {
        progress.value += 1;
      }
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    summary.value = {
      imported: importedCount,
      updated: updatedCount,
      unchanged: unchangedCount,
      skipped: skippedCount,
      failed: failures.length,
      failures,
      categoriesCreated,
      internalDuplicates: duplicateItems.size,
      sourcesAdded,
    };

    const historyEntry: M3uImportHistoryEntry = {
      id: `${Date.now()}-${fileName.value}`,
      date: new Date().toISOString(),
      fileName: fileName.value || "playlist.m3u",
      mode: importMode.value,
      durationMs: Date.now() - startedAt.value,
      ...summary.value,
    };
    history.value = addM3uImportHistory(historyEntry);
    importing.value = false;
  }

  const changedCount = importedCount + updatedCount;
  if (changedCount > 0) emit("imported", changedCount);
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

        <fieldset
          v-if="items.length && !summary"
          class="m3u-import-mode"
          :disabled="importing"
        >
          <legend>Modo de importação</legend>

          <label>
            <input v-model="importMode" type="radio" value="sync" />
            Sincronizar metadados e fontes
          </label>

          <label>
            <input v-model="importMode" type="radio" value="sources-only" />
            Adicionar apenas fontes em falta
          </label>

          <label>
            <input v-model="importMode" type="radio" value="create-only" />
            Criar apenas canais novos
          </label>
        </fieldset>

        <section
          v-if="items.length && !summary"
          class="m3u-plan"
          aria-labelledby="m3u-plan-title"
          aria-live="polite"
        >
          <h3 id="m3u-plan-title">Plano da importação</h3>
          <p>
            <strong>{{ importPlan.newChannels }}</strong> novos ·
            <strong>{{ importPlan.matchedChannels }}</strong> correspondentes ·
            <strong>{{ importPlan.internalDuplicates }}</strong> duplicados internos ·
            <strong>{{ importPlan.invalid }}</strong> inválidos
          </p>
        </section>

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
            <strong>{{ summary.imported }}</strong> criadas ·
            <strong>{{ summary.updated }}</strong> atualizadas ·
            <strong>{{ summary.unchanged }}</strong> sem alterações
          </p>
          <p>
            <strong>{{ summary.skipped }}</strong> ignoradas ·
            <strong>{{ summary.failed }}</strong> falhadas ·
            <strong>{{ summary.sourcesAdded }}</strong> fontes adicionadas
          </p>
          <p>
            <strong>{{ summary.categoriesCreated }}</strong> categorias criadas ·
            <strong>{{ summary.internalDuplicates }}</strong> duplicados internos
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

          <button
            class="button button-secondary"
            type="button"
            @click="downloadM3uReport(history[0], 'json')"
          >
            Exportar JSON
          </button>

          <button
            class="button button-secondary"
            type="button"
            @click="downloadM3uReport(history[0], 'csv')"
          >
            Exportar CSV
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
        <details v-if="history.length" class="m3u-history">
          <summary>Histórico recente ({{ history.length }})</summary>
          <ol>
            <li v-for="entry in history" :key="entry.id">
              <strong>{{ entry.fileName }}</strong>
              <span>{{ new Date(entry.date).toLocaleString("pt-PT") }}</span>
              <span>{{ entry.imported }} criadas · {{ entry.updated }} atualizadas · {{ entry.failed }} falhadas</span>
            </li>
          </ol>
        </details>
      </section>
    </div>
  </Teleport>
</template>
