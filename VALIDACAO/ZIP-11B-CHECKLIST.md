# ZIP 11B — checklist de segurança

## Antes
- [ ] Fazer backup de `pb_data`.
- [ ] Confirmar uma conta `admin` ativa.
- [ ] Confirmar uma conta `editor`, `utilizador` e `leitor` para testes.

## Coleções
- [ ] Anónimo não lê `titulos`.
- [ ] Leitor consulta `titulos`, mas não cria nem altera.
- [ ] Utilizador consulta catálogo, mas não edita.
- [ ] Editor cria e altera catálogo.
- [ ] Editor não elimina `sync_jobs`.
- [ ] Admin lê `app_settings`.
- [ ] Editor não lê `app_settings`.
- [ ] Nenhuma conta cria `audit_log` diretamente.
- [ ] Versões de títulos não podem ser alteradas depois de criadas.

## Hooks
- [ ] Pedido TMDB sem token devolve 401.
- [ ] Leitor e utilizador recebem 403 no TMDB e OMDb.
- [ ] Editor usa pesquisa TMDB e OMDb.
- [ ] Editor recebe 403 na configuração de credenciais.
- [ ] Admin gere e testa credenciais.
- [ ] Conta bloqueada recebe 403.
- [ ] Limites por minuto devolvem 429 quando excedidos.

## Interface
- [ ] `/manutencao` recusa utilizador e leitor.
- [ ] `/providers` recusa utilizador e leitor.
- [ ] Admin e editor abrem providers.
- [ ] Sessão expirada volta ao login.
