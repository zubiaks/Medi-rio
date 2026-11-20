# Commit no GitHub Desktop

## Summary

```text
legal: adicionar avisos de copyright ao código
```

## Description

```text
O que mudou:
- adicionados avisos de copyright aos ficheiros de código do Mediário;
- identificada a autoria de Zubiaks;
- referenciada a PolyForm Noncommercial License 1.0.0;
- indicado que utilização comercial exige autorização escrita;
- adicionada documentação sobre os formatos de cabeçalho;
- adicionado script idempotente para aplicar e verificar os avisos;
- ficheiros JSON e dependências de terceiros permanecem inalterados.

Licenciamento:
- o aviso curto não substitui LICENSE.md;
- dependências de terceiros mantêm as respetivas licenças;
- versões anteriores mantêm a licença sob a qual foram publicadas;
- a transição aplica-se às versões futuras após o commit de alteração.

Base de dados:
- sem alterações ao schema;
- sem alterações aos records;
- sem alterações a pb_data.

Validação:
- npm audit;
- npm run type-check;
- npm run build;
- revisão do git diff antes do commit.
```
