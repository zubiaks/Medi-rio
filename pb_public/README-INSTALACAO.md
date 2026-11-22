# Biblioteca física — Fases 4 e 5

Este pacote acrescenta:

- empréstimos agrupados por pessoa;
- contagem de activos e atrasados;
- próxima devolução por destinatário;
- importação CSV com pré-visualização;
- exportação CSV em UTF-8;
- validação linha a linha e continuação após falhas.

## Integração em LibraryView.vue

Importar `BorrowersPanel`, `LibraryCsvDialog` e `downloadLibraryCsv`. Renderizar o painel antes do histórico global, acrescentar os botões Importar CSV e Exportar CSV no cabeçalho e recarregar a biblioteca depois da importação.

O pacote não altera o esquema PocketBase.
