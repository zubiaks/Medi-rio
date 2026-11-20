<!--
  Mediario
  Copyright (c) 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import { computed,ref,watch } from "vue";
const props=defineProps<{open:boolean;title:string;saving?:boolean}>();
const emit=defineEmits<{close:[];confirm:[]}>();
const confirmation=ref("");
const matches=computed(()=>confirmation.value===props.title);
watch(()=>props.open,(open)=>{if(open)confirmation.value=""});
</script>
<template>
  <div v-if="open" class="dialog-backdrop" @click.self="emit('close')">
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <h2 id="delete-title">Eliminar definitivamente</h2>
      <p>Esta ação não pode ser anulada. Escreve <strong>{{title}}</strong> para confirmar.</p>
      <label class="form-field"><span>Nome do título</span><input v-model="confirmation" autocomplete="off"/></label>
      <div class="form-actions"><button class="button button-secondary" type="button" :disabled="saving" @click="emit('close')">Cancelar</button><button class="button button-danger" type="button" :disabled="saving||!matches" @click="emit('confirm')">{{saving?'A eliminar…':'Eliminar definitivamente'}}</button></div>
    </section>
  </div>
</template>
