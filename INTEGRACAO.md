# Integrar Atualizar todos os RSS

1. Copiar `src/components/podcasts/PodcastSyncAllButton.vue` e `src/domain/podcasts/sync.ts` para os mesmos caminhos do projeto.
2. Acrescentar o conteúdo de `podcasts-sync-all.css` ao final de `src/styles/podcasts.css`.
3. Em `PodcastsView.vue`, importar:

```ts
import PodcastSyncAllButton from "@/components/podcasts/PodcastSyncAllButton.vue";
```

4. Dentro de `BasePageHeader`, adicionar:

```vue
<template #actions>
  <PodcastSyncAllButton @finished="loadEpisodes" />
</template>
```

Exemplo:

```vue
<BasePageHeader
  eyebrow="Áudio"
  title="Podcasts"
  :description="`${podcastTotal} podcasts na biblioteca`"
>
  <template #actions>
    <PodcastSyncAllButton @finished="loadEpisodes" />
  </template>
</BasePageHeader>
```

O processamento é sequencial, inclui apenas podcasts ativos, não arquivados e com RSS configurado, e pode ser cancelado depois do feed atual.
