<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { ref, watch } from "vue";
const props=defineProps<{open:boolean;title:string;saving?:boolean}>();
const emit=defineEmits<{close:[];confirm:[string]}>();
const reason=ref("");
watch(()=>props.open,(open)=>{if(open)reason.value=""});
</script>
<template>
  <div v-if="open" class="dialog-backdrop" @click.self="emit('close')">
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="archive-title">
      <h2 id="archive-title">Enviar para a lixeira</h2>
      <p>O título <strong>{{ title }}</strong> desaparecerá do catálogo, mas poderá ser restaurado.</p>
      <label class="form-field"><span>Motivo opcional</span><textarea v-model="reason" rows="3" maxlength="500"/></label>
      <div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button><button class="button button-danger" type="button" :disabled="saving" @click="emit('confirm',reason)">{{saving?'A arquivar…':'Enviar para a lixeira'}}</button></div>
    </section>
  </div>
</template>
