# ZIP 2 — ativação das Fases 6Q, 6R, 6S e 6T

## 6Q — executor backend

O hook `41_provider_tmdb_automation.pb.js` fica instalado, mas sem efeito enquanto não existir:

```text
app_settings.chave = tmdb_backend_automation_enabled
app_settings.valor = true
```

O cron é executado a cada cinco minutos e processa no máximo cinco tarefas. Nesta entrega, o trabalhador valida títulos e conclui tarefas para revisão manual. Não altera campos do catálogo automaticamente.

## 6R — imagens locais

A interface exige colar explicitamente o URL TMDB escolhido. Limites:

- poster: 5 MB;
- backdrop: 5 MB;
- logótipo: 2 MB.

## 6S — catálogo global

Apenas cria tarefas pendentes para títulos associados ao TMDB e nos estados `nunca`, `desatualizado` ou `erro`. Não executa nem aplica metadados.

## 6T — descoberta

Apresenta até 20 recomendações ou títulos semelhantes. Não cria títulos automaticamente.
