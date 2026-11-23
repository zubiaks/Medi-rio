# ZIP 11A — autenticação, sessão, perfil e funções

## Conteúdo

- migração da coleção de autenticação `users`;
- estados `ativo`, `pendente` e `bloqueado`;
- funções `admin`, `editor`, `utilizador` e `leitor`;
- login, logout e recuperação de palavra-passe;
- restauro e validação da sessão no arranque;
- perfil, avatar e alteração da palavra-passe;
- matriz de permissões;
- guards globais do Vue Router;
- páginas 403, login, recuperação e perfil;
- menu de sessão reutilizável.

## Primeiro administrador

O registo público fica desativado. Depois da migração:

1. abre o painel administrativo do PocketBase;
2. entra na coleção `users`;
3. cria a primeira conta;
4. define `estado = ativo`;
5. define `role = admin`;
6. confirma o email manualmente, caso a verificação esteja ativa.

Contas existentes sem `estado` continuam a poder autenticar para evitar bloqueio durante a migração. No entanto, sem `role` não recebem permissões técnicas. Atualiza todas as contas existentes após instalar.

## Recuperação de palavra-passe

O envio real de email depende da configuração SMTP do PocketBase. A interface responde sempre com uma mensagem neutra para não revelar se uma conta existe.

A URL de reposição deve apontar para:

```text
http://127.0.0.1:8090/reset-password?token={TOKEN}
```

Ajusta o domínio na configuração de email para produção.

## Router

As rotas `login`, `reset-password`, `profile` e `forbidden` são adicionadas dinamicamente em `main.ts`. Todas as restantes rotas ficam privadas por omissão.

Para autorização fina, usa `meta.permission`:

```ts
{
  path: "/manutencao",
  component: () => import("@/views/MaintenanceView.vue"),
  meta: { permission: "maintenance.use" },
}
```

Rotas públicas adicionais precisam de:

```ts
meta: { public: true }
```

## Menu de sessão

O componente `AuthSessionMenu.vue` está pronto para ser colocado no cabeçalho ou na navegação principal.
