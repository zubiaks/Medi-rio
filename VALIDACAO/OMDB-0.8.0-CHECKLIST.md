# OMDb 0.8.0 — checklist de encerramento

## Configuração

- [ ] TMDB e OMDb aparecem em Configuração dos providers.
- [ ] Credenciais existentes aparecem apenas mascaradas.
- [ ] Substituir chave limpa o input.
- [ ] Remover chave exige confirmação.
- [ ] Testar ligação não revela a credencial.
- [ ] Ativar/desativar e limites ficam persistidos.

## Fluxo individual

- [ ] Pesquisa por título, tipo e ano.
- [ ] Detalhe por IMDb ID.
- [ ] Associação ao título Mediário.
- [ ] Apenas campos vazios ficam pré-selecionados.
- [ ] Snapshot criado antes da aplicação.
- [ ] Conflito por `updated` bloqueia a escrita.
- [ ] Fonte externa OMDb criada ou atualizada.
- [ ] IMDb, Rotten Tomatoes e Metacritic aparecem separadamente.
- [ ] Diagnóstico identifica IMDb ID incoerente.

## Operação

- [ ] Agendamento cria tarefa OMDb pendente.
- [ ] Execução individual prepara revisão sem aplicar dados.
- [ ] Lote respeita o máximo de 25 tarefas.
- [ ] Cancelamento para depois da tarefa atual.
- [ ] Falhas, parciais e canceladas podem ser repetidas.
- [ ] Métricas TMDB e OMDb aparecem separadamente.
- [ ] Auditoria não contém chaves ou URLs com `apikey`.

## Validação automática

```powershell
Set-Location "D:\Mediário"
.\VALIDAR-OMDB-0.8.0.ps1
```

Depois:

```powershell
Set-Location "D:\Mediário\pb_public"
npm run test
npm run audit:prod
git diff --check
```
