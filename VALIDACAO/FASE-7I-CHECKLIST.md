# Fase 7I — encerramento de Providers e Manutenção

## Validação automática

```powershell
Set-Location "D:\Mediário"
.\VALIDAR-FASE-7.ps1
```

Depois dos testes focados:

```powershell
Set-Location "D:\Mediário\pb_public"
npm run test
npm run audit:prod
git diff --check
```

## Validação funcional obrigatória

- [ ] Providers abre sem erro e lista fontes externas.
- [ ] Manutenção abre nas áreas Visão geral e Operações TMDB.
- [ ] Pesquisa TMDB devolve filmes e séries.
- [ ] Indicador mostra Pesquisar, Resultado, Catálogo e Rever.
- [ ] Workspace funciona por teclado com setas, Home e End.
- [ ] Temporadas aparece apenas para séries.
- [ ] Metadados preservam campos manuais por omissão.
- [ ] Relações funcionam em Acrescentar e Substituir.
- [ ] Créditos repetidos não criam duplicados.
- [ ] Temporadas e episódios repetidos são atualizados.
- [ ] Aliases repetidos são ignorados.
- [ ] Imagens externas e locais respeitam os limites.
- [ ] Snapshot e restauro seletivo funcionam.
- [ ] Conflitos pelo campo updated bloqueiam a escrita.
- [ ] Fecho com Escape pede confirmação quando necessário.
- [ ] Foco regressa ao botão que abriu o diálogo.
- [ ] Tarefas podem ser agendadas, executadas e recuperadas.
- [ ] Lotes podem ser cancelados depois da tarefa atual.
- [ ] Relatórios CSV e JSON são exportados.
- [ ] Automação backend continua opt-in.
- [ ] Audit log não contém chaves, tokens ou cabeçalhos Authorization.

## Critérios de aceitação

1. `npm run type-check` aprovado.
2. Testes Providers e suite completa aprovados.
3. `npm run build` aprovado.
4. `npm run audit:prod` sem vulnerabilidades críticas.
5. `git diff --check` aprovado.
6. Apenas `providers.css` é importado no `main.ts`.
7. Nenhum ficheiro fonte contém entidades HTML contaminadas.
8. Nenhum passo altera dados sem ação explícita, exceto automação opt-in.
