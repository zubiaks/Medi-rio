<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import{computed,onBeforeUnmount,ref,watch}from"vue";import{resizeImageFile}from"@/domain/catalog/imageResize";
const file=defineModel<File|null>({required:true});const url=defineModel<string>("url",{required:true});
const props=withDefaults(defineProps<{label:string;existingUrl?:string;error?:string;urlError?:string;aspect?:"poster"|"backdrop"|"logo";maxWidth:number;maxHeight:number;maxBytes:number;accept?:string;preservePng?:boolean}>(),{existingUrl:"",error:"",urlError:"",aspect:"poster",accept:"image/jpeg,image/png,image/webp,image/avif",preservePng:false});
const emit=defineEmits<{remove:[]}>();const objectUrl=ref(""),processing=ref(false),processError=ref("");
const preview=computed(()=>objectUrl.value||url.value.trim()||props.existingUrl||"");
function revoke(){if(objectUrl.value){URL.revokeObjectURL(objectUrl.value);objectUrl.value=""}}
async function choose(event:Event){const input=event.target as HTMLInputElement;const selected=input.files?.[0]||null;if(!selected)return;processing.value=true;processError.value="";revoke();try{const resized=await resizeImageFile(selected,{maxWidth:props.maxWidth,maxHeight:props.maxHeight,quality:.85,preservePng:props.preservePng});if(resized.size>props.maxBytes)throw new Error(`A imagem processada excede ${(props.maxBytes/1024/1024).toFixed(0)} MiB.`);file.value=resized;objectUrl.value=URL.createObjectURL(resized)}catch(e){file.value=null;processError.value=e instanceof Error?e.message:String(e)}finally{processing.value=false;input.value=""}}
function remove(){revoke();file.value=null;url.value="";emit("remove")}
watch(file,v=>{if(!v)revoke()});onBeforeUnmount(revoke);
</script>
<template><div class="image-upload-field"><span class="image-upload-label">{{label}}</span><div class="image-preview" :class="`image-preview-${aspect}`"><img v-if="preview" :src="preview" :alt="`Pré-visualização de ${label}`" @error="processError='Não foi possível carregar a imagem desta URL.'"><span v-else>Sem imagem</span></div><label class="form-field"><span>URL externa</span><input v-model.trim="url" :name="`${aspect}_url`" type="url" placeholder="https://…" autocomplete="url"><small v-if="urlError" class="field-error">{{urlError}}</small></label><label class="button button-secondary image-file-button"><input class="sr-only" type="file" :accept="accept" :disabled="processing" @change="choose">{{processing?'A processar…':'Escolher ficheiro'}}</label><small v-if="file">{{file.name}} · {{(file.size/1024/1024).toFixed(2)}} MiB</small><small v-if="error||processError" class="field-error">{{error||processError}}</small><small>Ficheiro local tem prioridade sobre URL.</small><button v-if="preview||file||url" class="button button-secondary" type="button" @click="remove">Remover imagem</button></div></template>
