# Fase 10.0 — Coleções e listas

Primeira entrega do marco `v0.10.0-beta.1`.

Inclui listas manuais e estrutura para listas inteligentes, fixação, ordenação, remoção, adição a partir da pesquisa global e exportação/importação JSON.

## Decisão de arquitetura

Esta primeira fase usa `localStorage` para evitar criar coleções PocketBase sem confirmar o esquema final e as regras de autenticação. Os limites são 50 listas e 500 itens por lista.

A Fase 10.1 deverá ligar listas inteligentes ao motor de pesquisa e preparar persistência PocketBase opcional.
