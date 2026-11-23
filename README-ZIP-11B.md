# ZIP 11B — regras de coleções e hooks protegidos

## Regras aplicadas

- `app_settings`: leitura apenas por administradores; nenhuma escrita direta do cliente.
- `audit_log`: leitura apenas por administradores; nenhuma escrita, alteração ou eliminação direta do cliente.
- `sync_jobs`: administradores e editores podem consultar, criar e atualizar; só administradores eliminam.
- `titulos_versoes`: administradores e editores consultam e criam; versões permanecem imutáveis; só administradores eliminam.
- `fontes_externas`: qualquer conta autenticada consulta; administradores e editores escrevem.
- catálogo principal: qualquer conta autenticada consulta; administradores e editores escrevem.

Coleções de catálogo abrangidas quando existem:

```text
titulos
pessoas
creditos
temporadas
episodios
titulos_alternativos
colecoes
streams
```

A migração ignora coleções inexistentes, permitindo instalar o ZIP em esquemas parciais.

## Hooks

- TMDB: apenas `admin` e `editor`, máximo de 40 pedidos por utilizador e por minuto.
- OMDb: apenas `admin` e `editor`, máximo de 30 pedidos por utilizador e por minuto.
- Configuração e credenciais: apenas `admin`, máximo de 20 operações por utilizador e por minuto.
- Contas pendentes ou bloqueadas são recusadas.
- Pedidos anónimos recebem erro de autenticação.

Os limites são guardados em memória e reiniciam quando o PocketBase reinicia. São uma proteção local básica; uma futura instalação exposta à Internet deve ainda usar um proxy como Caddy ou Nginx com rate limiting persistente.

## Router

Mesmo sem metadados no router acumulado:

- `/manutencao` exige `maintenance.use`;
- `/providers` exige `providers.use`.

Outras rotas podem usar `meta.permission` normalmente.

## Atenção à auditoria

A escrita direta em `audit_log` fica fechada. Fluxos antigos que ainda escrevam auditoria diretamente pelo SDK devem ser migrados para hooks backend antes de depender desse registo. A proteção dos dados tem prioridade sobre manter escrita de auditoria controlada apenas pelo cliente.
