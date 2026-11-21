<!-- Mediario - Copyright (c) 2026 Zubiaks. See LICENSE.md. -->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { streamRepository } from "@/domain/repositories";
import type { StreamRecord } from "@/types/records";

type PodcastRecord = StreamRecord & {
  external_id?: string;
  url_pagina?: string;
  pais?: string;
  idiomas?: string[];
  categoria?: string;
  tags?: string[];
  favorito?: boolean;
  adulto?: boolean;
  adulto_motivos?: unknown;
  ordem?: number;
  notas?: string;
  ultimo_teste_em?: string;
  ultimo_estado?: string;
  ultimo_erro?: string;
  ultima_sincronizacao?: string;
};

const props = defineProps<{ podcast: PodcastRecord | null }>();
const emit = defineEmits<{ close: []; saved: [PodcastRecord] }>();
const form = ref({
  nome: "", externalId: "", rssUrl: "", pageUrl: "", logoUrl: "", qualidade: "Desconhecida",
  ordem: null as number | null, notas: "", favorito: false, ativo: true, cemiterio: false, adulto: false,
});
const logoFile = ref<File | null>(null);
const removeLogo = ref(false);
const previewUrl = ref("");
const saving = ref(false);
const error = ref("");
const firstInput = ref<HTMLInputElement | null>(null);

function clearPreview(): void {
  if (previewUrl.value.startsWith("blob:")) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
}
function currentPreview(): string {
  if (previewUrl.value) return previewUrl.value;
  if (props.podcast?.logo_url) return props.podcast.logo_url;
  return "";
}
watch(() => props.podcast, async (item) => {
  clearPreview();
  form.value = {
    nome: item?.nome || "", externalId: item?.external_id || "", rssUrl: item?.rss_url || "",
    pageUrl: item?.url_pagina || "", logoUrl: item?.logo_url || "",
    qualidade: item?.qualidade || "Desconhecida", ordem: item?.ordem ?? null,
    notas: item?.notas || "", favorito: item?.favorito === true, ativo: item?.ativo !== false,
    cemiterio: item?.cemiterio === true, adulto: item?.adulto === true,
  };
  logoFile.value = null;
  removeLogo.value = false;
  error.value = "";
  if (item) { await nextTick(); firstInput.value?.focus(); }
}, { immediate: true });

function selectLogo(event: Event): void {
  clearPreview();
  logoFile.value = (event.target as HTMLInputElement).files?.[0] || null;
  if (logoFile.value) {
    previewUrl.value = URL.createObjectURL(logoFile.value);
    removeLogo.value = false;
  }
}
function validUrl(value: string): boolean {
  if (!value) return true;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol); }
  catch { return false; }
}
async function copyRss(): Promise<void> {
  if (form.value.rssUrl) await navigator.clipboard.writeText(form.value.rssUrl);
}
async function testFeed(): Promise<void> {
  error.value = "";
  if (!validUrl(form.value.rssUrl)) { error.value = "O endereço RSS não é válido."; return; }
  try {
    const response = await fetch(form.value.rssUrl, { headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await streamRepository.update(props.podcast!.id, { ultimo_teste_em: new Date().toISOString(), ultimo_estado: "ok", ultimo_erro: "" });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    error.value = `Não foi possível testar o feed: ${message}`;
    if (props.podcast) await streamRepository.update(props.podcast.id, { ultimo_teste_em: new Date().toISOString(), ultimo_estado: "offline", ultimo_erro: message });
  }
}
async function save(): Promise<void> {
  if (!props.podcast || !form.value.nome.trim()) return;
  if (!validUrl(form.value.rssUrl) || !validUrl(form.value.pageUrl) || !validUrl(form.value.logoUrl)) {
    error.value = "Os endereços devem começar por http:// ou https://."; return;
  }
  saving.value = true; error.value = "";
  try {
    const payload: Record<string, unknown> = {
      nome: form.value.nome.trim(), external_id: form.value.externalId.trim(), rss_url: form.value.rssUrl.trim(),
      url_pagina: form.value.pageUrl.trim(), logo_url: form.value.logoUrl.trim(), qualidade: form.value.qualidade,
      ordem: form.value.ordem, notas: form.value.notas.trim(), favorito: form.value.favorito,
      ativo: form.value.ativo, cemiterio: form.value.cemiterio, adulto: form.value.adulto,
    };
    if (logoFile.value) payload.logo = logoFile.value;
    else if (removeLogo.value) payload.logo = null;
    const updated = await streamRepository.update(props.podcast.id, payload) as PodcastRecord;
    emit("saved", updated);
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { saving.value = false; }
}
function close(): void { if (!saving.value) emit("close"); }
onBeforeUnmount(clearPreview);
</script>

<template>
  <Teleport to="body">
    <div v-if="podcast" class="dialog-backdrop" @click.self="close">
      <section class="dialog-panel podcast-edit-dialog podcast-edit-complete" role="dialog" aria-modal="true" aria-labelledby="podcast-edit-title" @keydown.esc="close">
        <div class="dialog-header"><div><p class="eyebrow">Biblioteca de podcasts</p><h2 id="podcast-edit-title">Editar podcast</h2></div><button class="icon-button" type="button" aria-label="Fechar" :disabled="saving" @click="close">×</button></div>
        <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>

        <div class="podcast-edit-layout">
          <aside class="podcast-edit-preview">
            <img v-if="currentPreview()" :src="currentPreview()" alt="Pré-visualização da capa" />
            <span v-else aria-hidden="true">◉</span>
          </aside>

          <div class="podcast-edit-fields">
            <fieldset><legend>Identificação</legend><div class="form-grid">
              <label class="form-field field-wide"><span>Nome *</span><input ref="firstInput" v-model.trim="form.nome" maxlength="300" /></label>
              <label class="form-field"><span>ID externo</span><input v-model.trim="form.externalId" maxlength="300" /></label>
              <label class="form-field"><span>Ordem</span><input v-model.number="form.ordem" type="number" min="0" step="1" /></label>
              <label class="form-field"><span>Qualidade</span><select v-model="form.qualidade"><option>Desconhecida</option><option>Audio</option><option>SD</option><option>HD</option><option>FHD</option><option>4K</option></select></label>
            </div></fieldset>

            <fieldset><legend>Feed e páginas</legend><div class="form-grid">
              <label class="form-field field-wide"><span>Feed RSS</span><input v-model.trim="form.rssUrl" type="url" maxlength="2000" placeholder="https://…" /></label>
              <div class="podcast-inline-actions"><button class="button button-secondary" type="button" :disabled="!form.rssUrl" @click="testFeed">Testar feed</button><button class="button button-secondary" type="button" :disabled="!form.rssUrl" @click="copyRss">Copiar RSS</button><a v-if="validUrl(form.rssUrl) && form.rssUrl" class="button button-secondary" :href="form.rssUrl" target="_blank" rel="noopener noreferrer">Abrir RSS</a></div>
              <label class="form-field field-wide"><span>Site oficial</span><input v-model.trim="form.pageUrl" type="url" maxlength="2000" placeholder="https://…" /></label>
            </div></fieldset>

            <fieldset><legend>Capa</legend><div class="form-grid">
              <label class="form-field field-wide"><span>URL externa</span><input v-model.trim="form.logoUrl" type="url" maxlength="2000" placeholder="https://…" /></label>
              <label class="form-field"><span>Ficheiro local</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" @change="selectLogo" /><small class="field-hint">Máximo: 5 MiB.</small></label>
              <label v-if="podcast.logo" class="check-field"><input v-model="removeLogo" type="checkbox" :disabled="Boolean(logoFile)" /> Remover capa local atual</label>
            </div></fieldset>

            <fieldset><legend>Estado e notas</legend><div class="form-grid">
              <label class="form-field field-wide"><span>Notas pessoais</span><textarea v-model="form.notas" rows="5" maxlength="5000" /></label>
              <label class="check-field"><input v-model="form.favorito" type="checkbox" /> Favorito</label>
              <label class="check-field"><input v-model="form.ativo" type="checkbox" /> Podcast ativo</label>
              <label class="check-field"><input v-model="form.adulto" type="checkbox" /> Conteúdo adulto</label>
              <label class="check-field"><input v-model="form.cemiterio" type="checkbox" /> Arquivado</label>
            </div></fieldset>
          </div>
        </div>

        <div class="podcast-diagnostics"><span>Última sincronização: {{ podcast.ultima_sincronizacao || "Nunca" }}</span><span>Último teste: {{ podcast.ultimo_teste_em || "Nunca" }}</span><span>Estado: {{ podcast.ultimo_estado || "desconhecido" }}</span></div>
        <div v-if="podcast.ultimo_erro" class="form-alert form-alert-error">{{ podcast.ultimo_erro }}</div>
        <div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="close">Cancelar</button><button class="button button-primary" type="button" :disabled="saving || !form.nome.trim()" @click="save">{{ saving ? "A guardar…" : "Guardar alterações" }}</button></div>
      </section>
    </div>
  </Teleport>
</template>
