# Segurança da integração TMDB

- A chave v3 permanece em `app_settings` e é lida apenas pelo hook PocketBase.
- O frontend comunica exclusivamente com `/api/mediario/providers/tmdb/*`.
- A chave não deve aparecer em respostas, logs, auditoria, metadata_extra ou localStorage.
- `app_settings` deve deixar de ter regras públicas quando a autenticação do frontend for concluída.
- Os URLs externos são guardados como texto, nunca como HTML.
- Alterações de catálogo exigem seleção explícita e snapshot quando aplicável.
- Tarefas em lote são sequenciais, limitadas e canceláveis entre pedidos.
