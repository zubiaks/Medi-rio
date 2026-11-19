<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
import { pb } from "@/infrastructure/pocketbase/client";
import { titleRepository } from "@/domain/repositories";
import type { TitleRecord } from "@/types/records";

type Named = { id:string; nome?:string; nome_singular?:string };
type Detail = TitleRecord & { titulo_original?:string; data_lancamento?:string; classificacao_etaria?:string; sinopse?:string; tagline?:string; notas_pessoais?:string; duracao_min?:number; paginas?:number; horas_jogadas?:number; tmdb_id?:number; tipo_tmdb?:string; imdb_id?:string; canonico?:boolean; adulto?:boolean; expand?:Record<string,Named|Named[]> };
const route=useRoute(),record=ref<Detail|null>(null),loading=ref(true),error=ref("");
const created=computed(()=>route.query.created==="1");
const expand="midia,tipo,estado,generos,tags,idiomas,pais_origem,plataformas,companhias";
const names=(v:Named|Named[]|undefined)=>!v?[]:(Array.isArray(v)?v:[v]).map(x=>x.nome||x.nome_singular||x.id);
const fileUrl=(field:"poster"|"backdrop"|"logo")=>record.value?.[field]?pb.files.getURL(record.value,record.value[field] as string):"";
const date=(v?:string)=>{if(!v)return"—";const d=new Date(v);return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat("pt-PT",{dateStyle:"long"}).format(d)};
async function load(){loading.value=true;error.value="";try{record.value=await titleRepository.get(String(route.params.id),{expand}) as Detail}catch(e){error.value=e instanceof Error?e.message:String(e)}finally{loading.value=false}}
onMounted(load);
</script>
<template>
<section v-if="loading" class="page-loading"><span class="loader"/><p>A carregar título…</p></section>
<BaseEmptyState v-else-if="error" icon="!" title="Não foi possível abrir o título" :description="error"><button class="button button-secondary" @click="load">Voltar a tentar</button></BaseEmptyState>
<template v-else-if="record">
<div v-if="created" class="form-alert form-alert-success">Título criado com sucesso.</div>
<BasePageHeader eyebrow="Catálogo" :title="record.titulo" :description="record.tagline||record.titulo_original||'Detalhe do título'"><template #actions><RouterLink class="button button-secondary" to="/catalogo">← Catálogo</RouterLink><RouterLink class="button button-primary" :to="`/catalogo/${record.id}/editar`">Editar</RouterLink></template></BasePageHeader>
<section class="title-detail"><aside class="title-poster"><img v-if="fileUrl('poster')" :src="fileUrl('poster')" :alt="`Poster de ${record.titulo}`"><div v-else class="poster-placeholder"><span>▶</span><small>Sem poster</small></div></aside><div class="title-main">
<div class="title-badges"><span v-if="record.expand?.midia" class="detail-badge detail-badge-primary">{{names(record.expand.midia)[0]}}</span><span v-if="record.expand?.tipo" class="detail-badge">{{names(record.expand.tipo)[0]}}</span><span v-if="record.expand?.estado" class="detail-badge detail-badge-success">{{names(record.expand.estado)[0]}}</span><span v-if="record.adulto" class="detail-badge detail-badge-danger">Adulto</span></div>
<dl class="title-facts"><div><dt>Ano</dt><dd>{{record.ano||"—"}}</dd></div><div><dt>Lançamento</dt><dd>{{date(record.data_lancamento)}}</dd></div><div><dt>Classificação</dt><dd>{{record.classificacao_etaria||"—"}}</dd></div><div><dt>Avaliação</dt><dd>{{record.rating??"—"}}</dd></div><div><dt>Duração</dt><dd>{{record.duracao_min?`${record.duracao_min} min`:"—"}}</dd></div><div><dt>Páginas</dt><dd>{{record.paginas||"—"}}</dd></div><div><dt>Horas jogadas</dt><dd>{{record.horas_jogadas??"—"}}</dd></div><div><dt>Canónico</dt><dd>{{record.canonico?"Sim":"Não"}}</dd></div></dl>
<article v-if="record.sinopse" class="detail-section"><h2>Sinopse</h2><p class="detail-copy">{{record.sinopse}}</p></article><article v-if="record.notas_pessoais" class="detail-section"><h2>Notas pessoais</h2><p class="detail-copy">{{record.notas_pessoais}}</p></article></div></section>
<section class="detail-grid"><article class="panel"><h2>Classificação e relações</h2><div class="relation-groups"><template v-for="key in ['generos','tags','idiomas','pais_origem','plataformas','companhias']" :key="key"><div v-if="names(record.expand?.[key]).length"><h3>{{key.replace('_',' ')}}</h3><div class="chip-list"><span v-for="item in names(record.expand?.[key])" :key="item" class="chip">{{item}}</span></div></div></template></div></article><article class="panel"><h2>Identificadores externos</h2><dl class="external-ids"><div><dt>TMDB</dt><dd>{{record.tmdb_id||"—"}}</dd></div><div><dt>Tipo TMDB</dt><dd>{{record.tipo_tmdb||"—"}}</dd></div><div><dt>IMDb</dt><dd>{{record.imdb_id||"—"}}</dd></div><div><dt>Record</dt><dd><code>{{record.id}}</code></dd></div></dl></article></section>
</template>
</template>
