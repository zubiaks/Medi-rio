# Arquitetura final do marco Providers

## Providers

Responsável por fontes externas e enriquecimento individual:

- pesquisa e detalhe TMDB;
- metadados;
- relações;
- créditos;
- temporadas e episódios;
- aliases;
- imagens;
- versões;
- diagnóstico individual.

## Manutenção

Responsável por operações globais:

- fila e execução individual;
- execução em lote;
- recuperação;
- tarefas bloqueadas;
- métricas;
- relatórios;
- limites operacionais.

## Segurança

- chave TMDB apenas no PocketBase;
- alterações manuais protegidas por comparação e snapshots;
- automação backend desativada por predefinição;
- histórico preservado em sync_jobs, audit_log e titulos_versoes.
