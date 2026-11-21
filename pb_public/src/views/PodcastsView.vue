<!--
  Mediario
  Copyright (c) 2026 Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import PodcastSyncButton from "@/components/podcasts/PodcastSyncButton.vue";
import PodcastEditDialog from "@/components/podcasts/PodcastEditDialog.vue";
import PodcastEpisodeEditDialog from "@/components/podcasts/PodcastEpisodeEditDialog.vue";
import { episodeRepository, streamRepository } from "@/domain/repositories";
import { pb } from "@/infrastructure/pocketbase/client";
import type { PodcastEpisodeRecord, StreamRecord } from "@/types/records";
import PodcastSyncAllButton from "@/components/podcasts/PodcastSyncAllButton.vue";
import PodcastPagination from "@/components/podcasts/PodcastPagination.vue";

type Episode = PodcastEpisodeRecord & {
  imagem?: string;
  link?: string;
  favorito?: boolean;
  ultima_escuta_em?: string;
  explicito?: unknown;
  expand?: { podcast?: StreamRecord };
};

const podcasts = ref<StreamRecord[]>([]);
const podcastPage = ref(1);
const podcastPages = ref(1);
const podcastTotal = ref(0);
const podcastSearch = ref("");
const selectedPodcast = ref<StreamRecord | null>(null);
const episodes = ref<Episode[]>([]);
const episodePage = ref(1);
const episodePages = ref(1);
const episodeTotal = ref(0);
const episodeSearch = ref("");
const listenedFilter = ref("");
const explicitFilter = ref("");
const favoriteFilter = ref("");
const episodeView = ref<"grid" | "list" | "compact">("grid");
const detailEpisode = ref<Episode | null>(null);
const editPodcast = ref<StreamRecord | null>(null);
const editEpisode = ref<Episode | null>(null);
const showEpisodeImages = ref(false);
const loadingPodcasts = ref(true);
const loadingEpisodes = ref(true);
const error = ref("");
const audio = ref<HTMLAudioElement | null>(null);
const activeEpisodeId = ref("");
let podcastTimer: ReturnType<typeof setTimeout> | undefined;
let episodeTimer: ReturnType<typeof setTimeout> | undefined;
let lastSavedSecond = -1;

const episodeFilterCount = computed(() => [episodeSearch.value, listenedFilter.value, explicitFilter.value, favoriteFilter.value].filter(Boolean).length);
const escapeFilter = (value: string) => value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

function podcastImage(item?: StreamRecord): string {
  if (!item) return "";
  if (item.logo) return pb.files.getURL(item, item.logo, { thumb: "300x300" });
  return item.logo_url || "";
}
function podcastName(item: Episode): string { return item.expand?.podcast?.nome || "Podcast"; }
function episodeImage(item: Episode): string {
  if (item.imagem) return pb.files.getURL(item, item.imagem, { thumb: "300x300" });
  return item.imagem_url || podcastImage(item.expand?.podcast);
}
function formatDate(value?: string): string {
  if (!value) return "Data desconhecida";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium" }).format(date);
}
function formatDuration(value?: number): string {
  if (!value) return "Duração desconhecida";
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
}
function explicitValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["true", "yes", "1", "explicit"].includes(value.toLowerCase());
  if (value && typeof value === "object") return explicitValue(Object.values(value as Record<string, unknown>)[0]);
  return false;
}
function descriptionDocument(value?: string): Document {
  return new DOMParser().parseFromString(value || "", "text/html");
}
function plainDescription(value?: string): string {
  if (!value) return "Este episódio não possui uma descrição.";
  return descriptionDocument(value).body.textContent?.trim() || "Este episódio não possui uma descrição.";
}
function shortDescription(value?: string): string {
  const content = plainDescription(value);
  return content.length > 220 ? `${content.slice(0, 217).trimEnd()}…` : content;
}
function descriptionImages(value?: string): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  return Array.from(descriptionDocument(value).images)
    .map((image) => image.getAttribute("src")?.trim() || "")
    .filter((url) => {
      if (!/^https?:\/\//i.test(url) || seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .slice(0, 12);
}
const detailImages = computed(() => descriptionImages(detailEpisode.value?.descricao));
function progressPercent(item: Episode): number {
  if (item.ouvido_completo) return 100;
  if (!item.duracao_seg || !item.ouvido_ate_seg) return 0;
  return Math.min(100, Math.round((item.ouvido_ate_seg / item.duracao_seg) * 100));
}

async function loadPodcasts(): Promise<void> {
  loadingPodcasts.value = true;
  error.value = "";
  try {
    const terms = ['tipo = "podcast"', "cemiterio = false"];
    if (podcastSearch.value.trim()) {
      const q = escapeFilter(podcastSearch.value.trim());
      terms.push(`(nome ~ "${q}" || rss_url ~ "${q}")`);
    }
    const page = await streamRepository.list({ page: podcastPage.value, perPage: 18, filter: terms.join(" && "), sort: "ordem,nome" });
    podcasts.value = page.items;
    podcastPages.value = page.totalPages || 1;
    podcastTotal.value = page.totalItems;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loadingPodcasts.value = false; }
}

function buildEpisodeFilter(): string {
  const terms: string[] = [];
  if (selectedPodcast.value) terms.push(`podcast = "${selectedPodcast.value.id}"`);
  if (episodeSearch.value.trim()) {
    const q = escapeFilter(episodeSearch.value.trim());
    terms.push(`(titulo ~ "${q}" || descricao ~ "${q}")`);
  }
  if (listenedFilter.value === "unheard") terms.push("ouvido_completo = false && ouvido_ate_seg = 0");
  if (listenedFilter.value === "progress") terms.push("ouvido_completo = false && ouvido_ate_seg > 0");
  if (listenedFilter.value === "heard") terms.push("ouvido_completo = true");
  if (favoriteFilter.value === "yes") terms.push("favorito = true");
  if (favoriteFilter.value === "no") terms.push("favorito = false");
  return terms.join(" && ");
}

async function loadEpisodes(): Promise<void> {
  loadingEpisodes.value = true;
  error.value = "";
  try {
    const page = await episodeRepository.list({ page: episodePage.value, perPage: 12, filter: buildEpisodeFilter(), sort: "-publicado_em", expand: "podcast" });
    let values = page.items as Episode[];
    if (explicitFilter.value === "yes") values = values.filter((item) => explicitValue(item.explicito));
    if (explicitFilter.value === "no") values = values.filter((item) => !explicitValue(item.explicito));
    episodes.value = values;
    episodePages.value = page.totalPages || 1;
    episodeTotal.value = page.totalItems;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : String(cause); }
  finally { loadingEpisodes.value = false; }
}

function selectPodcast(item: StreamRecord): void { selectedPodcast.value = item; episodePage.value = 1; void loadEpisodes(); }
function showRecent(): void { selectedPodcast.value = null; episodePage.value = 1; void loadEpisodes(); }
function clearEpisodeFilters(): void { episodeSearch.value = listenedFilter.value = explicitFilter.value = favoriteFilter.value = ""; episodePage.value = 1; void loadEpisodes(); }
function openEpisode(item: Episode): void {
  detailEpisode.value = item;
  showEpisodeImages.value = false;
}
function closeEpisode(): void {
  detailEpisode.value = null;
  showEpisodeImages.value = false;
}
function podcastSaved(updated: StreamRecord): void {
  selectedPodcast.value = updated;
  podcasts.value = podcasts.value.map((item) => item.id === updated.id ? updated : item);
  editPodcast.value = null;
}
function episodeSaved(updated: Episode): void {
  episodes.value = episodes.value.map((item) => item.id === updated.id ? { ...item, ...updated } : item);
  if (detailEpisode.value?.id === updated.id) detailEpisode.value = { ...detailEpisode.value, ...updated };
  editEpisode.value = null;
}
async function toggleFavorite(item: Episode): Promise<void> { item.favorito = !item.favorito; await episodeRepository.update(item.id, { favorito: item.favorito }); }

async function saveProgress(item: Episode, complete = false): Promise<void> {
  if (!audio.value) return;
  const second = Math.floor(audio.value.currentTime);
  if (!complete && second === lastSavedSecond) return;
  lastSavedSecond = second;
  item.ouvido_ate_seg = second;
  item.ouvido_completo = complete;
  await episodeRepository.update(item.id, { ouvido_ate_seg: second, ouvido_completo: complete, ultima_escuta_em: new Date().toISOString() });
}
async function play(item: Episode): Promise<void> {
  if (!item.audio_url) return;
  if (activeEpisodeId.value === item.id && audio.value && !audio.value.paused) { audio.value.pause(); await saveProgress(item); return; }
  audio.value?.pause();
  const player = new Audio(item.audio_url);
  audio.value = player;
  activeEpisodeId.value = item.id;
  lastSavedSecond = -1;
  player.currentTime = item.ouvido_ate_seg || 0;
  player.addEventListener("timeupdate", () => {
    if (item.duracao_seg && item.duracao_seg - player.currentTime <= 15) void saveProgress(item, true);
    else if (Math.floor(player.currentTime) % 15 === 0) void saveProgress(item);
  });
  player.addEventListener("ended", () => void saveProgress(item, true));
  await player.play();
}

watch(podcastSearch, () => { clearTimeout(podcastTimer); podcastTimer = setTimeout(() => { podcastPage.value = 1; void loadPodcasts(); }, 300); });
watch([episodeSearch, listenedFilter, explicitFilter, favoriteFilter], () => { clearTimeout(episodeTimer); episodeTimer = setTimeout(() => { episodePage.value = 1; void loadEpisodes(); }, 300); });
onMounted(() => { void Promise.all([loadPodcasts(), loadEpisodes()]); });
onBeforeUnmount(() => { clearTimeout(podcastTimer); clearTimeout(episodeTimer); audio.value?.pause(); });
</script>

<template>
  <BasePageHeader eyebrow="Áudio" title="Podcasts" :description="`${podcastTotal} podcasts na biblioteca`" />
  <div v-if="error" class="form-alert form-alert-error" role="alert">{{ error }}</div>

  <section class="podcast-library" aria-labelledby="podcast-library-title">
    <div class="section-heading"><div><p class="eyebrow">Biblioteca</p><h2 id="podcast-library-title">Os teus podcasts</h2></div></div>
    <label class="form-field podcast-search"><span>Pesquisar podcasts</span><input v-model.trim="podcastSearch" type="search" placeholder="Nome ou endereço RSS" /></label>
    <div v-if="loadingPodcasts" class="page-loading"><span class="loader" /></div>
    <div v-else-if="podcasts.length" class="podcast-grid">
      <button v-for="item in podcasts" :key="item.id" class="podcast-card" :class="{ 'is-selected': selectedPodcast?.id === item.id }" type="button" @click="selectPodcast(item)">
        <span class="podcast-art"><img v-if="podcastImage(item)" :src="podcastImage(item)" :alt="`Capa de ${item.nome}`" /><span v-else aria-hidden="true">◉</span></span>
        <span class="podcast-card-copy"><strong>{{ item.nome }}</strong><small>{{ item.rss_url || "Sem feed RSS" }}</small></span>
      </button>
    </div>
    <BaseEmptyState v-else icon="◉" title="Sem podcasts" description="Ainda não existem feeds RSS na biblioteca." />
    <PodcastPagination
      :page="podcastPage"
      :pages="podcastPages"
      label="Paginação dos podcasts"
      @change="podcastPage = $event; loadPodcasts()"
    />
  </section>

  <article v-if="selectedPodcast" class="panel selected-podcast-detail">
    <div class="selected-podcast-cover"><img v-if="podcastImage(selectedPodcast)" :src="podcastImage(selectedPodcast)" :alt="`Capa de ${selectedPodcast.nome}`" /><span v-else aria-hidden="true">◉</span></div>
    <div class="selected-podcast-main"><p class="eyebrow">Podcast selecionado</p><h2>{{ selectedPodcast.nome }}</h2><dl class="selected-podcast-facts"><div><dt>Episódios</dt><dd>{{ episodeTotal }}</dd></div><div><dt>Estado</dt><dd>{{ selectedPodcast.ativo === false ? "Inativo" : "Ativo" }}</dd></div><div><dt>Feed</dt><dd>{{ selectedPodcast.rss_url ? "RSS configurado" : "Sem RSS" }}</dd></div></dl><div class="selected-podcast-actions"><button class="button button-secondary" type="button" @click="editPodcast = selectedPodcast">Editar podcast</button><PodcastSyncButton :podcast="selectedPodcast" @synced="loadEpisodes" /><a v-if="selectedPodcast.rss_url" class="button button-secondary" :href="selectedPodcast.rss_url" target="_blank" rel="noopener noreferrer">Abrir RSS</a><button class="button button-secondary" type="button" @click="showRecent">Ver todos os recentes</button></div></div>
  </article>

  <section class="podcast-episodes" aria-labelledby="episode-list-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ selectedPodcast ? selectedPodcast.nome : "Atualizações" }}</p>
        <h2 id="episode-list-title">{{ selectedPodcast ? "Episódios do podcast" : "Episódios recentes" }}</h2>
      </div>
      <div class="view-switch" role="group" aria-label="Vista dos episódios">
        <button type="button" :class="{ 'is-active': episodeView === 'grid' }" :aria-pressed="episodeView === 'grid'" @click="episodeView = 'grid'">▦ Grelha</button>
        <button type="button" :class="{ 'is-active': episodeView === 'list' }" :aria-pressed="episodeView === 'list'" @click="episodeView = 'list'">☰ Lista</button>
        <button type="button" :class="{ 'is-active': episodeView === 'compact' }" :aria-pressed="episodeView === 'compact'" @click="episodeView = 'compact'">≡ Compacta</button>
      </div>
    </div>
    <div class="panel podcast-episode-filters"><label class="form-field field-wide"><span>Pesquisar episódios</span><input v-model.trim="episodeSearch" type="search" placeholder="Título ou descrição" /></label><label class="form-field"><span>Estado</span><select v-model="listenedFilter"><option value="">Todos</option><option value="unheard">Não ouvidos</option><option value="progress">Em progresso</option><option value="heard">Ouvidos</option></select></label><label class="form-field"><span>Explícito</span><select v-model="explicitFilter"><option value="">Todos</option><option value="yes">Sim</option><option value="no">Não</option></select></label><label class="form-field"><span>Favoritos</span><select v-model="favoriteFilter"><option value="">Todos</option><option value="yes">Favoritos</option><option value="no">Não favoritos</option></select></label><button v-if="episodeFilterCount" class="button button-secondary" type="button" @click="clearEpisodeFilters">Limpar filtros ({{ episodeFilterCount }})</button></div>
    <div v-if="loadingEpisodes" class="page-loading"><span class="loader" /></div>
    <div v-else-if="episodes.length" class="podcast-episode-collection" :class="`is-${episodeView}`">
      <article v-for="episode in episodes" :key="episode.id" class="podcast-episode-card">
        <div class="podcast-episode-image"><img v-if="episodeImage(episode)" :src="episodeImage(episode)" :alt="`Imagem de ${episode.titulo}`" /><span v-else aria-hidden="true">◉</span></div>
        <div class="podcast-episode-body"><div class="podcast-episode-title-row"><div><p class="eyebrow">{{ podcastName(episode) }}</p><h3>{{ episode.titulo }}</h3></div><button class="favorite-button" type="button" :aria-label="episode.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'" @click="toggleFavorite(episode)">{{ episode.favorito ? "★" : "☆" }}</button></div><p v-if="episodeView !== 'compact'" class="podcast-episode-summary">{{ shortDescription(episode.descricao) }}</p><p class="podcast-episode-meta">{{ formatDate(episode.publicado_em) }} · {{ formatDuration(episode.duracao_seg) }} <span v-if="explicitValue(episode.explicito)" class="detail-badge detail-badge-danger">Explícito</span></p><div class="podcast-progress" role="progressbar" :aria-valuenow="progressPercent(episode)" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progressPercent(episode)}%` }" /></div><div class="podcast-episode-actions"><button class="button button-primary" type="button" :disabled="!episode.audio_url" @click="play(episode)">{{ activeEpisodeId === episode.id && audio && !audio.paused ? "Pausar" : "Reproduzir" }}</button><button class="button button-secondary" type="button" @click="openEpisode(episode)">Ler episódio</button><button class="button button-secondary" type="button" @click="editEpisode = episode">Estado</button><a v-if="episode.link" class="button button-secondary" :href="episode.link" target="_blank" rel="noopener noreferrer">Página oficial</a></div></div>
      </article>
    </div>
    <BaseEmptyState v-else icon="◉" title="Sem episódios" description="Não existem episódios para estes filtros." />
    <PodcastPagination
      :page="episodePage"
      :pages="episodePages"
      label="Paginação dos episódios"
      @change="episodePage = $event; loadEpisodes()"
    />
  </section>

  <Teleport to="body">
    <div v-if="detailEpisode" class="episode-detail-backdrop" @click.self="closeEpisode">
      <article class="episode-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="episode-detail-title"><button class="icon-button episode-detail-close" type="button" aria-label="Fechar episódio" @click="closeEpisode">×</button><div class="episode-detail-header"><div class="episode-detail-art"><img v-if="episodeImage(detailEpisode)" :src="episodeImage(detailEpisode)" :alt="`Imagem de ${detailEpisode.titulo}`" /><span v-else aria-hidden="true">◉</span></div><div><p class="eyebrow">{{ podcastName(detailEpisode) }}</p><h2 id="episode-detail-title">{{ detailEpisode.titulo }}</h2><p class="podcast-episode-meta">{{ formatDate(detailEpisode.publicado_em) }} · {{ formatDuration(detailEpisode.duracao_seg) }}</p></div></div><div class="episode-detail-content">{{ plainDescription(detailEpisode.descricao) }}</div>
        <div v-if="detailImages.length" class="episode-detail-media">
          <button class="button button-secondary" type="button" :aria-expanded="showEpisodeImages" @click="showEpisodeImages = !showEpisodeImages">
            {{ showEpisodeImages ? "Ocultar imagens" : `Mostrar imagens (${detailImages.length})` }}
          </button>
          <div v-if="showEpisodeImages" class="episode-detail-gallery">
            <a v-for="(image, index) in detailImages" :key="image" :href="image" target="_blank" rel="noopener noreferrer" class="episode-detail-image-link">
              <img :src="image" :alt="`Imagem ${index + 1} do episódio`" loading="lazy" decoding="async" />
              <span>Abrir original</span>
            </a>
          </div>
        </div>
        <div class="podcast-episode-actions"><button class="button button-primary" type="button" :disabled="!detailEpisode.audio_url" @click="play(detailEpisode)">Reproduzir</button><button class="button button-secondary" type="button" @click="editEpisode = detailEpisode">Editar estado</button><a v-if="detailEpisode.link" class="button button-secondary" :href="detailEpisode.link" target="_blank" rel="noopener noreferrer">Página oficial</a></div></article>
    </div>
  </Teleport>
  <PodcastEditDialog :podcast="editPodcast" @close="editPodcast = null" @saved="podcastSaved" />
  <PodcastEpisodeEditDialog :episode="editEpisode" @close="editEpisode = null" @saved="episodeSaved" />
</template>
