# Mediário — Fase 6P: validação integral e encerramento TMDB

## Âmbito

Esta fase não acrescenta outro provider. Valida o conjunto TMDB das Fases 4, 5 e 6A–6O.

## Validação automática obrigatória

Executar em `D:\Mediário\pb_public`:

```powershell
npm run type-check
npm run test
npm run build
npm run audit:prod
git diff --check
```

Teste de encerramento focado:

```powershell
npx vitest run src/domain/providers/tmdbClosure.spec.ts
```

## Verificações funcionais

1. Pesquisa `Alien` e confirma resultados.
2. Consulta o detalhe `movie/348`.
3. Compara metadados sem substituir campos manuais por omissão.
4. Aplica relações no modo Acrescentar.
5. Repete créditos e confirma ausência de duplicados.
6. Importa uma temporada duas vezes e confirma atualização, não duplicação.
7. Importa títulos alternativos e confirma `fonte = tmdb`.
8. Seleciona poster, backdrop e logótipo sem alterar os campos file.
9. Cria snapshot, altera um campo e restaura apenas esse campo.
10. Simula conflito no campo `updated` e confirma bloqueio.
11. Agenda, executa e recupera uma tarefa TMDB.
12. Executa um lote com cancelamento cooperativo.
13. Marca uma tarefa bloqueada como falha.
14. Exporta recuperação CSV e relatório CSV/JSON.
15. Confirma auditoria sem chaves, tokens ou autorização.

## Critérios de encerramento

- Suite completa aprovada.
- Build de produção aprovado.
- Nenhum URL contém marcação `<a href` nos ficheiros fonte.
- Nenhuma chave TMDB aparece no frontend, localStorage, audit_log ou metadata_extra.
- Nenhuma operação substitui campos manuais sem seleção explícita.
- Nenhum teste funcional cria duplicados em fontes, créditos, temporadas, episódios ou títulos alternativos.
- `sync_jobs` preserva o histórico ao repetir tarefas.
- `titulos_versoes` permite recuperação seletiva.

## Limitação assumida

Os limites guardados em `tmdb_operational_settings` ficam centralizados e validados. Os módulos existentes mantêm os limites conservadores compilados nesta entrega. A aplicação dinâmica de todos os limites no backend deverá ser feita quando o executor persistente do PocketBase for implementado.
