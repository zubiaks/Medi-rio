<!--
  Ficheiro: src/components/iptv/GridDensityControl.vue
  Tipo: Componente Vue acessível.
  Função: Permite escolher 2 a 6 cartões por linha na vista Grelha.
-->
<script setup lang="ts">
const model = defineModel<number>({ required: true });
const options = [
  { value: 2, label: "Muito grande" },
  { value: 3, label: "Grande" },
  { value: 4, label: "Média" },
  { value: 5, label: "Pequena" },
  { value: 6, label: "Compacta" },
];
</script>

<template>
  <fieldset class="grid-density-control">
    <legend>Tamanho dos cartões</legend>
    <div class="grid-density-buttons" role="radiogroup" aria-label="Tamanho dos cartões da grelha">
      <label v-for="option in options" :key="option.value" class="grid-density-option">
        <input v-model.number="model" type="radio" name="grid-columns" :value="option.value" />
        <span :title="`${option.label}: ${option.value} por linha`">{{ option.value }}</span>
      </label>
    </div>
    <small>{{ model }} por linha</small>
  </fieldset>
</template>
