# OMDb 0.8.0 — Fase 8C

Inclui normalização de ratings IMDb, Rotten Tomatoes e Metacritic, diagnóstico de cobertura e agendamento de tarefas OMDb em `sync_jobs`.

A tarefa criada usa:

- `tipo = atualizacao`
- `provider = omdb`
- `entidade = titulos`
- `estado = pendente`
- `total = 1`

A fase agenda a atualização, mas não executa nem aplica dados automaticamente.
