<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">import{onMounted,ref}from"vue";import{availabilityRepository}from"@/domain/repositories";import{isExpired,money,qualityLabel,typeLabel}from"@/domain/vod/format";import type{AvailabilityRecord}from"@/types/records";const props=defineProps<{titleId:string}>();const items=ref<AvailabilityRecord[]>([]),loading=ref(true),error=ref("");async function load(){loading.value=true;try{items.value=(await availabilityRepository.list({perPage:100,filter:`titulo = "${props.titleId}" && ativo = true`,sort:"provider_nome",expand:"pais"})).items}catch(e){error.value=e instanceof Error?e.message:String(e)}finally{loading.value=false}}onMounted(load);</script>
<template><section class="panel title-vod"><div class="section-heading"><div><p class="eyebrow">Disponibilidade</p><h2>Onde ver</h2></div><RouterLink class="button button-secondary" :to="{name:'vod-create',query:{titulo:titleId}}">＋ Adicionar</RouterLink></div><p v-if="loading">A carregar ofertas…</p><p v-else-if="error" class="field-error">{{error}}</p><p v-else-if="!items.length">Ainda não existem ofertas ativas para este título.</p><div v-else class="title-vod-list"><article v-for="item in items" :key="item.id" class="title-vod-item" :class="{'is-expired':isExpired(item.data_fim)}"><div><strong>{{item.provider_nome}}</strong><small>{{typeLabel(item.tipo)}} · {{qualityLabel(item.qualidade)}}</small></div><span>{{money(item.preco,item.moeda)||(item.incluido_subscricao?'Incluído':'—')}}</span><a v-if="item.url" class="button button-secondary" :href="item.url" target="_blank" rel="noopener noreferrer">Abrir</a><RouterLink class="button button-secondary" :to="`/vod/${item.id}/editar`">Editar</RouterLink></article></div></section></template>
