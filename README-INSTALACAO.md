# Mediário v0.2.0-alpha.1 — pacote consolidado

Este pacote consolida o estado mais recente da gestão VOD e da integração **Onde ver** no detalhe dos títulos.

## Copiar

Copia o conteúdo deste pacote para a raiz Git atual do frontend:

```text
D:\Mediário\pb_public
```

Aceita substituir ficheiros existentes. O pacote não contém `pb_data`, credenciais, `node_modules`, `dist` nem o executável PocketBase.

## Import de estilos

Confirma em `src/main.ts`:

```ts
import "@/styles/vod-management.css";
```

Mantém também os imports do catálogo e da lixeira já existentes.

## Rotas necessárias

Confirma no router:

```ts
{ path: "/vod/novo", name: "vod-create", component: () => import("@/views/VodCreateView.vue") },
{ path: "/vod/:id/editar", name: "vod-edit", component: () => import("@/views/VodEditView.vue") },
{ path: "/vod", name: "vod", component: () => import("@/views/VodView.vue") },
```

## Validação obrigatória

```powershell
cd "D:\Mediário\pb_public"
npm audit
npm run type-check
npm run build
```

## Teste funcional

1. Criar uma oferta VOD.
2. Tentar criar uma oferta duplicada.
3. Filtrar por provider, país, modalidade e qualidade.
4. Desativar e voltar a ativar.
5. Verificar **Onde ver** no detalhe do título.
6. Eliminar uma oferta escrevendo o provider.

Só depois destes testes `v0.2.0-alpha.1` deve ser marcada como concluída.
