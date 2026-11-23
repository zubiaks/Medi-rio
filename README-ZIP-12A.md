# ZIP 12A — persistência das listas e migração local

Cria as coleções `listas`, `listas_itens` e `listas_atividades`, todas com propriedade por utilizador e regras privadas.

## Migração

No dashboard de Listas aparece `Migrar listas para a conta`:

1. exporta uma cópia JSON de segurança;
2. pré-visualiza listas, itens e duplicados;
3. migra apenas as listas sem duplicado de nome e tipo;
4. cria itens e atividade `migrated`;
5. mantém o `localStorage` intacto.

Uma falha durante os itens tenta eliminar a lista remota parcial. O processo pode ser repetido porque listas já existentes são ignoradas.

## Visibilidade

A migração cria todas as listas como `privada`. `partilhada` está reservada para uma fase futura com membros explícitos. Listas `publica` podem ser consultadas por contas autenticadas conforme as regras da instalação.
