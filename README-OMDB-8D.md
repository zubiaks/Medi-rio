# OMDb 0.8.0 — Fase 8D

Adiciona execução individual de tarefas OMDb em Manutenção.

A execução:

1. valida a tarefa pendente;
2. passa a tarefa para `em_execucao`;
3. carrega o título e o detalhe OMDb pelo IMDb ID;
4. conclui ou falha a tarefa;
5. guarda o resultado apenas em `sessionStorage`;
6. abre o fluxo normal de revisão quando o diálogo OMDb for usado.

Nenhum campo do catálogo é aplicado automaticamente.
