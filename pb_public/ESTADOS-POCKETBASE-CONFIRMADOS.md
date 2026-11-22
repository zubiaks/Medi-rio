# Estados confirmados de `historico_emprestimos.estado`

O campo é `select`, escolha única, opcional, com valores exatos e sensíveis a maiúsculas:

- `Emprestado`
- `Atrasado`
- `Devolvido`
- `Perdido`
- `Danificado`
- `Cancelado`

O fluxo usa `Emprestado` ao iniciar, `Devolvido` numa devolução em bom estado e `Danificado` numa devolução assinalada como não estando em bom estado. `Atrasado` pode ser aplicado por manutenção quando `data_prevista` passou e `data_devolucao` está vazia. `Perdido` e `Cancelado` ficam para ações dedicadas. A coleção `estados` é genérica para progresso de títulos e não é a origem deste select.
