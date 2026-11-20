<!--
  MediÃ¡rio
  Copyright Â© 2026 Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->
<script setup lang="ts">
import BaseEmptyState from "@/components/base/BaseEmptyState.vue";
import BasePageHeader from "@/components/base/BasePageHeader.vue";
defineProps<{ title: string; description: string }>();
</script>
<template><BasePageHeader :title="title" :description="description"/><BaseEmptyState icon="◇" title="Página preparada" description="Esta área será migrada e testada de forma incremental a partir do projeto anterior."/></template>
