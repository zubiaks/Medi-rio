# Revisão do lote 2 contra o esquema PocketBase 1.0.0

## Corrigido
- `formato` deixou de ser obrigatório porque o documento lista o campo, mas não declara obrigatoriedade.
- Removida a criação automática de `historico_emprestimos` ao guardar o exemplar. Essa criação duplicava históricos em cada edição e assumia o valor `estado = emprestado`, que não está documentado como enum válido.
- Erros PocketBase passam para um alerta de submissão, sem reutilizar incorretamente o erro de `notas`.
- Teste de acessibilidade passa a simular formatos, edições e pessoas, sem acesso real ao PocketBase.

## Mantido
Todos os 19 campos documentados de `exemplares`, os lookups `formatos_fisicos`, `tipos_edicao` e `pessoas`, e a tipagem de `historico_emprestimos`.

## Próximo lote
O empréstimo e a devolução devem ser implementados como fluxo transacional separado, com prevenção de histórico ativo duplicado, renovação e devolução.
