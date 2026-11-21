<!--
  Ficheiro: src/components/live/GridSizeSlider.vue
  Tipo: Controlo Vue acessível.
  Função: Ajusta dinamicamente a largura dos cartões da grelha.
-->
<script setup lang="ts">
const model = defineModel<number>({ required: true });
</script>
<template>
  <label class="grid-slider">
    <span aria-hidden="true">−</span>
    <span class="sr-only">Tamanho dos cartões</span>
    <input v-model.number="model" type="range" min="170" max="420" step="10" aria-label="Tamanho dos cartões da grelha" />
    <span aria-hidden="true">＋</span>
    <output aria-live="polite">{{ model }} px</output>
  </label>
</template>
<style scoped>
.grid-slider{display:flex;align-items:center;gap:.5rem;min-width:250px;padding:.45rem .7rem;border:1px solid var(--line);border-radius:.85rem;background:var(--surface)}
.grid-slider input{min-width:120px;flex:1;accent-color:var(--primary)}
.grid-slider output{min-width:52px;color:var(--muted);font-size:.76rem;text-align:right}
@media(max-width:700px){.grid-slider{width:100%}}
</style>
