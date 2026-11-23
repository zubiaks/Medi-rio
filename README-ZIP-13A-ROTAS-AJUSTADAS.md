# ZIP 13A — rotas ajustadas ao código atual

Este pacote parte do ZIP 13A e usa o router e o App.vue enviados pelo projeto como base real.

## Preservado sem renomear

- `home`, `catalog`, `catalog-create`, `catalog-edit`, `catalog-detail`;
- `trash`, `vod-create`, `vod-edit`, `vod`;
- `podcasts`, `iptv`, redirecionamento `/tv`;
- `library`, `diary`, `providers`, `maintenance`;
- placeholders `colecoes`, `descobrir`, `reviews`, `definicoes`;
- `dev` e `not-found`;
- `createWebHashHistory`;
- foco de `#main-content` depois da navegação;
- `AppSidebar`, `AppTopbar`, estado do PocketBase e diálogo de criação.

## Acrescentado

- rotas reais `/pesquisa`, `/listas`, `/perfil`, `/administracao`;
- rotas públicas `/login` e `/reset-password`;
- rota `/403`;
- permissões por `meta.permission`;
- títulos por `meta.title`;
- breadcrumbs e restauro de scroll;
- página inicial por função;
- menu de sessão no shell;
- ações rápidas de criação visíveis apenas com `catalog.write`.
