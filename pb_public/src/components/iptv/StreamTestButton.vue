<!--
  Ficheiro: src/components/iptv/StreamTestButton.vue
  Tipo: Ação Vue.
  Função: Testa uma fonte no browser e grava o estado em stream_links.
-->
<script setup lang="ts">
import { ref } from "vue";import { iptvSourceRepository } from "@/domain/repositories";import { testStreamInBrowser } from "@/domain/iptv/browserTest";import type { StreamLinkRecord } from "@/types/records";
const props=defineProps<{link:StreamLinkRecord}>();const emit=defineEmits<{tested:[StreamLinkRecord]}>();const running=ref(false),message=ref("");async function run(){running.value=true;message.value="";try{const result=await testStreamInBrowser(props.link);message.value=result.message;const updated=await iptvSourceRepository.update(props.link.id,{ultimo_teste_em:result.testedAt,ultimo_estado:result.state,metadata_extra:{...(typeof props.link.metadata_extra==='object'&&props.link.metadata_extra?props.link.metadata_extra:{}),ultimo_teste_browser:{elapsed_ms:result.elapsedMs,content_type:result.contentType,message:result.message}}});emit("tested",updated as StreamLinkRecord)}catch(c){message.value=c instanceof Error?c.message:String(c)}finally{running.value=false}}
</script>
<template><div class="stream-test-action"><button class="button button-secondary" type="button" :disabled="running" @click="run">{{running?'A testar…':'Testar'}}</button><small v-if="message" aria-live="polite">{{message}}</small></div></template>
