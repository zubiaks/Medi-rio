<!--
  Projeto: Mediário
  Caminho: src/components/providers/TmdbProtectionNotice.vue
  Versão do ficheiro: 1.0.0
  Tipo: Componente Vue 3
  Domínio: Providers / proteção de sincronização
  Finalidade: Informar sobre snapshots automáticos e controlo de concorrência.
  Autor: Zubiaks <zubiaks@hotmail.com>
  Licença: PolyForm Noncommercial License 1.0.0
-->
<template>
  <aside class="tmdb-protection-notice" aria-labelledby="tmdb-protection-title">
    <span class="tmdb-protection-icon" aria-hidden="true">✓</span>
    <div>
      <strong id="tmdb-protection-title">Sincronização protegida</strong>
      <p>
        Antes de alterar o título, o Mediário confirma que os dados não mudaram
        desde a pré-visualização e cria automaticamente uma versão recuperável.
      </p>
    </div>
  </aside>
</template>
