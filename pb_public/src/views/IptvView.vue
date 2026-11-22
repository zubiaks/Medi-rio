<!-- Projeto: Mediário | Ficheiro: src/views/IptvView.vue | Versão: 3.0.0 -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import ChannelCard from "@/components/iptv/ChannelCard.vue";
import ChannelDetailDialog from "@/components/iptv/ChannelDetailDialog.vue";
import ChannelEditDialog from "@/components/iptv/ChannelEditDialog.vue";
import ChannelFilters from "@/components/iptv/ChannelFilters.vue";
import GridSizeSlider from "@/components/iptv/GridSizeSlider.vue";
import IptvBulkActions from "@/components/iptv/IptvBulkActions.vue";
import IptvEpgManager from "@/components/iptv/IptvEpgManager.vue";
import M3uImportDialog from "@/components/iptv/M3uImportDialog.vue";
import { countryRepository, iptvCategoryRepository, iptvChannelRepository, iptvSourceRepository, languageRepository, tagRepository } from "@/domain/repositories";
import { usedCategories, usedCountries, usedQualities } from "@/domain/iptv/filterOptions";
import { usedPlaylists } from "@/domain/iptv/playlistOptions";
import { defaults, loadIptvPreferences, resetIptvPreferences, saveIptvPreferences, type IptvViewMode } from "@/domain/iptv/libraryPreferences";
import type { IptvCategoryRecord, IptvChannelRecord, IptvSourceRecord, NamedRecord } from "@/types/records";

const CHANNELS_PER_PAGE=18,MIN_GRID_CARD_WIDTH=170,MAX_GRID_CARD_WIDTH=420;
const viewOptions: Array<{ value: IptvViewMode; label: string }> = [{value:"grid",label:"▦ Grelha"},{value:"logos",label:"▦ Logos"},{value:"list",label:"☰ Lista"},{value:"compact",label:"≡ Compacta"},{value:"text",label:"¶ Texto"}];
const initial=loadIptvPreferences();
const channels=ref<IptvChannelRecord[]>([]),allChannels=ref<IptvChannelRecord[]>([]);
const page=ref(1),pages=ref(1),total=ref(0),loading=ref(true),error=ref("");
const search=ref(""),country=ref(""),category=ref(""),quality=ref(""),status=ref(""),favorite=ref(""),playlist=ref("");
const view=ref<IptvViewMode>(initial.view),gridCardWidth=ref(Math.min(MAX_GRID_CARD_WIDTH,Math.max(MIN_GRID_CARD_WIDTH,initial.gridWidth))),hideLogos=ref(initial.hideLogos),sort=ref(initial.sort);
const countries=ref<NamedRecord[]>([]),languages=ref<NamedRecord[]>([]),tags=ref<NamedRecord[]>([]),categories=ref<IptvCategoryRecord[]>([]);
const selectedChannel=ref<IptvChannelRecord|null>(null),editingChannel=ref<IptvChannelRecord|null>(null),channelSources=ref<IptvSourceRecord[]>([]),sourcesLoading=ref(false),importDialogOpen=ref(false);
const selectedIds=ref(new Set<string>()),selectionMode=ref(false);let filterTimer:ReturnType<typeof setTimeout>|undefined;
const countryOptions=computed(()=>usedCountries(allChannels.value,countries.value));
const categoryOptions=computed(()=>usedCategories(allChannels.value,categories.value));
const qualityOptions=computed(()=>usedQualities(allChannels.value));
const playlistOptions=computed(()=>usedPlaylists(allChannels.value));
const selectedChannels=computed(()=>allChannels.value.filter(x=>selectedIds.value.has(x.id)));
const filterCount=computed(()=>[search.value,country.value,category.value,quality.value,status.value,favorite.value,playlist.value].filter(Boolean).length);
const channelCountDescription=computed(()=>total.value===1?"1 canal configurado":`${total.value} canais configurados`);
function escapeFilter(value: string): string {
  const slash = String.fromCharCode(92);
  return value
    .split(slash)
    .join(slash + slash)
    .split('"')
    .join(slash + '"');
}
function buildChannelFilter(){const t=["cemiterio = false"],q=search.value.trim();if(q){const x=escapeFilter(q);t.push(`(nome ~ "${x}" || tvg_name ~ "${x}" || tvg_id ~ "${x}" || epg_id ~ "${x}" || playlist_origem ~ "${x}")`)}if(country.value)t.push(`pais = "${escapeFilter(country.value)}"`);if(category.value)t.push(`categoria = "${escapeFilter(category.value)}"`);if(quality.value)t.push(`qualidade = "${escapeFilter(quality.value)}"`);if(status.value)t.push(`ativo = ${status.value==="active"}`);if(favorite.value)t.push(`favorito = ${favorite.value==="yes"}`);if(playlist.value==="__none__")t.push(`playlist_origem = ""`);else if(playlist.value)t.push(`playlist_origem = "${escapeFilter(playlist.value)}"`);return t.join(" && ")}
async function loadLibrary(){loading.value=true;error.value="";try{const r=await iptvChannelRepository.list({page:page.value,perPage:CHANNELS_PER_PAGE,filter:buildChannelFilter(),sort:sort.value,expand:"pais,categoria,idiomas,tags"});channels.value=r.items;pages.value=r.totalPages||1;total.value=r.totalItems}catch(c){error.value=c instanceof Error?c.message:String(c);channels.value=[];pages.value=1;total.value=0}finally{loading.value=false}}
async function loadAllChannels(){const out:IptvChannelRecord[]=[];let p=1,max=1;do{const r=await iptvChannelRepository.list({page:p,perPage:500,filter:"cemiterio = false",sort:"nome",expand:"pais,categoria,idiomas,tags"});out.push(...r.items);max=r.totalPages||1;p++}while(p<=max);allChannels.value=out}
async function loadLookups(){const[c,k,l,t]=await Promise.all([countryRepository.list({page:1,perPage:250,filter:"ativo = true",sort:"ordem,nome"}),iptvCategoryRepository.list({page:1,perPage:500,filter:"ativo = true",sort:"ordem,nome"}),languageRepository.list({page:1,perPage:100,filter:"ativo = true",sort:"ordem,nome"}),tagRepository.list({page:1,perPage:200,filter:"ativo = true",sort:"ordem,nome"})]);countries.value=c.items;categories.value=k.items;languages.value=l.items;tags.value=t.items}
async function openChannel(channel:IptvChannelRecord){selectedChannel.value=channel;channelSources.value=[];sourcesLoading.value=true;try{channelSources.value=(await iptvSourceRepository.list({page:1,perPage:100,filter:`canal_tv = "${channel.id}"`,sort:"prioridade"})).items}finally{sourcesLoading.value=false}}
function updateChannel(channel:IptvChannelRecord){channels.value=channels.value.map(x=>x.id===channel.id?channel:x);allChannels.value=allChannels.value.map(x=>x.id===channel.id?channel:x);if(selectedChannel.value?.id===channel.id)selectedChannel.value=channel}
function toggle(channel:IptvChannelRecord){const next=new Set(selectedIds.value);next.has(channel.id)?next.delete(channel.id):next.add(channel.id);selectedIds.value=next}
function selectPage(){selectedIds.value=new Set([...selectedIds.value,...channels.value.map(x=>x.id)]);selectionMode.value=true}
function clearSelection(){selectedIds.value=new Set();selectionMode.value=false}
async function bulkCompleted(updated:IptvChannelRecord[],failed:string[]){updated.forEach(updateChannel);if(updated.some(x=>x.cemiterio))await Promise.all([loadAllChannels(),loadLibrary()]);if(failed.length)error.value=failed.join(" · ");clearSelection()}
function clearFilters(){search.value="";country.value="";category.value="";quality.value="";status.value="";favorite.value="";playlist.value="";page.value=1;void loadLibrary()}
function resetPreferences(){const p=resetIptvPreferences();view.value=p.view;gridCardWidth.value=p.gridWidth;hideLogos.value=p.hideLogos;sort.value=p.sort}
async function handleM3uImported(count:number){if(count<=0)return;page.value=1;await Promise.all([loadLookups(),loadAllChannels(),loadLibrary()])}
watch([view,gridCardWidth,hideLogos,sort],()=>saveIptvPreferences({view:view.value,gridWidth:gridCardWidth.value,hideLogos:hideLogos.value,sort:sort.value}));
watch([search,country,category,quality,status,favorite,playlist,sort],()=>{if(filterTimer)clearTimeout(filterTimer);filterTimer=setTimeout(()=>{page.value=1;void loadLibrary()},250)});
onMounted(async()=>{try{await Promise.all([loadLookups(),loadAllChannels()]);await loadLibrary()}catch(c){error.value=c instanceof Error?c.message:String(c);loading.value=false}});
</script>

<template>
<BasePageHeader eyebrow="Televisão IP" title="IPTV" :description="channelCountDescription"><template #actions><IptvEpgManager :channels="allChannels"/><button class="button button-primary" type="button" @click="importDialogOpen=true">⇩ Importar M3U</button></template></BasePageHeader>
<div v-if="error" class="form-alert form-alert-error" role="alert">{{error}}</div>
<ChannelFilters v-model:search="search" v-model:country="country" v-model:category="category" v-model:quality="quality" v-model:status="status" v-model:favorite="favorite" v-model:playlist="playlist" :countries="countryOptions" :categories="categoryOptions" :qualities="qualityOptions" :playlists="playlistOptions" :count="filterCount" @clear="clearFilters"/>
<div class="section-heading"><div><p class="eyebrow">Biblioteca</p><h2>Canais IPTV</h2></div><div class="live-view-tools"><GridSizeSlider v-if="view==='grid'||view==='logos'" v-model="gridCardWidth"/><label class="check-field"><input v-model="hideLogos" type="checkbox"/> Esconder logótipos</label><button class="button button-secondary" type="button" @click="selectionMode=!selectionMode">{{selectionMode?'Terminar seleção':'Selecionar'}}</button><button class="button button-secondary" type="button" @click="selectPage">Selecionar página</button><button class="button button-secondary" type="button" @click="resetPreferences">Repor vista</button><div class="view-switch" role="group" aria-label="Vista dos canais IPTV"><button v-for="option in viewOptions" :key="option.value" type="button" :class="{'is-active':view===option.value}" :aria-pressed="view===option.value" @click="view=option.value">{{option.label}}</button></div></div></div>
<IptvBulkActions v-if="selectedChannels.length" :channels="selectedChannels" :categories="categories" :countries="countries" @completed="bulkCompleted" @clear="clearSelection"/>
<div v-if="loading" class="page-loading" aria-live="polite"><span class="loader" aria-hidden="true"/><span class="sr-only">A carregar canais IPTV.</span></div>
<div v-else-if="channels.length" class="live-collection" :class="`is-${view}`" :style="view==='grid'||view==='logos'?{gridTemplateColumns:`repeat(auto-fill,minmax(min(${view==='logos'?Math.max(120,gridCardWidth*.65):gridCardWidth}px,100%),1fr))`}:undefined"><ChannelCard v-for="channel in channels" :key="channel.id" :channel="channel" :view="view" :selected="selectedIds.has(channel.id)" :selectable="selectionMode" :hide-logo="hideLogos" @toggle="toggle" @open="openChannel" @edit="editingChannel=$event"/></div>
<BaseEmptyState v-else icon="▣" title="Sem canais IPTV" description="Não existem canais IPTV para os filtros selecionados."/>
<BasePagination :page="page" :pages="pages" label="Paginação dos canais IPTV" @change="page=$event;loadLibrary()"/>
<M3uImportDialog :open="importDialogOpen" :existing="allChannels" @close="importDialogOpen=false" @imported="handleM3uImported"/>
<ChannelDetailDialog :channel="selectedChannel" :links="channelSources" :loading="sourcesLoading" @close="selectedChannel=null" @edit="editingChannel=$event" @links-changed="channelSources=$event" @channel-changed="updateChannel"/>
<ChannelEditDialog :channel="editingChannel" :countries="countries" :languages="languages" :tags="tags" :categories="categories" @close="editingChannel=null" @saved="updateChannel($event);editingChannel=null" @archived="clearSelection();loadAllChannels();loadLibrary()"/>
</template>

<style scoped>.live-view-tools{display:flex;align-items:center;justify-content:flex-end;gap:.65rem;flex-wrap:wrap}.live-collection.is-logos{gap:.65rem}.live-collection.is-list,.live-collection.is-compact,.live-collection.is-text{grid-template-columns:1fr}@media(max-width:700px){.live-view-tools{align-items:stretch;flex-direction:column;width:100%}}</style>
