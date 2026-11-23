# Integração opcional da vista SearchView no router

O ZIP acumulado não contém `src/router/index.ts`, por isso a Fase 9.3 já funciona em Providers através de `Ctrl+K`, `/` e do botão Pesquisa global.

Para criar uma rota dedicada quando integrares o router completo, acrescenta:

```ts
{
  path: "/pesquisa",
  name: "Pesquisa",
  component: () => import("@/views/SearchView.vue"),
}
```

E uma entrada de navegação para `/pesquisa`.

A vista `SearchView.vue` já está incluída e pronta. Não substituas o router inteiro apenas para acrescentar esta rota.
