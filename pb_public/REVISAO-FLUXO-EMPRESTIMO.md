# Revisão do fluxo de empréstimo

## Fonte de verdade
- `exemplares.emprestado` indica o estado atual.
- `emprestado_a`, `data_emprestimo` e `data_prevista` descrevem o empréstimo ativo.
- `historico_emprestimos` guarda o ciclo histórico.

## Operações
1. **Emprestar**: recusa exemplar já emprestado ou histórico ativo duplicado; atualiza exemplar; cria histórico; faz rollback do exemplar se o histórico falhar.
2. **Renovar**: atualiza a previsão no exemplar e no histórico; incrementa `renovacoes`; faz rollback da previsão do exemplar se o histórico falhar.
3. **Devolver**: limpa os campos ativos do exemplar; fecha o histórico com data e conservação; restaura o exemplar se o histórico falhar.

## Assunção material
O esquema lista `historico_emprestimos.estado`, mas não documenta as opções permitidas. O lote usa `emprestado` e `devolvido`. Se o campo PocketBase for `select`, essas opções têm de existir no Dashboard.

## Limite técnico
O SDK usado não fornece transação atómica multi-coleção neste repositório. O lote usa rollback compensatório e apresenta uma mensagem explícita se o rollback também falhar.
