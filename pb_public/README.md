# Media Vault Next — Vue 3 + TypeScript

Starter oficial da reconstrução do frontend, reutilizando o PocketBase e a base de dados atuais.

## Stack

- Vue 3
- TypeScript 5.9.2 em modo `strict` (compatível com `vue-tsc`)
- Vite
- Vue Router
- PocketBase JavaScript SDK
- CSS próprio

Sem Pinia, Axios, Bootstrap ou biblioteca visual nesta fase.

## Requisitos

- Node.js 22.12 ou superior
- PocketBase em `http://127.0.0.1:8090`

## Instalar

```powershell
cd D:\media-vault-vue
Copy-Item .env.example .env
npm install
npm audit
npm run type-check
npm run build
npm run dev
```

## Princípios

- Componentes Vue não fazem queries PocketBase diretamente; usam repositórios.
- Parsers e regras de negócio ficam em TypeScript puro.
- Pinia entra apenas quando existir estado global real.
- Versões npm estáveis por padrão; beta/nightly/canary apenas com ADR.

## Compatibilidade TypeScript

O projeto fixa TypeScript em `5.9.2`. Não atualizar para TypeScript 7 enquanto `vue-tsc` depender do subpath `typescript/lib/tsc`. Antes de atualizar, testar numa branch com `npm run type-check` e `npm run build`.
