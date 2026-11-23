# Fase 9.4 — encerramento da Pesquisa e descoberta

## Resiliência
- [ ] Uma coleção indisponível não elimina resultados das outras coleções.
- [ ] A interface identifica as entidades que falharam.
- [ ] Correspondência exata aparece antes de correspondências parciais.
- [ ] Títulos recebem prioridade moderada sem ocultar outras entidades.

## Portabilidade
- [ ] Exportar cria um JSON versionado.
- [ ] Importar repõe no máximo 20 pesquisas.
- [ ] Ficheiros inválidos são recusados.
- [ ] A importação não contém resultados, credenciais ou conteúdos da base.

## Workspace acumulado
- [ ] Ctrl+K, Cmd+K e `/` abrem a pesquisa.
- [ ] O estado permanece no URL.
- [ ] Pesquisa, descoberta, detalhes, comparação e ações funcionam.
- [ ] A SearchView compila mesmo sem rota ativa.
- [ ] A pesquisa não chama TMDB nem OMDb.

## Validação final
```powershell
Set-Location "D:\Mediário"
.\VALIDAR-PESQUISA-9.0.ps1
```
