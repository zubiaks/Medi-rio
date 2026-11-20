# Preparar a versão consolidada da `main`

O ficheiro `preparar-main.ps1` cria um ZIP reproduzível a partir do commit atual. O script inclui apenas ficheiros rastreados pelo Git e bloqueia a criação se encontrar alterações por commit ou conteúdo privado rastreado.

## Pré-condições

1. A raiz Git deve ser `D:\Mediário`.
2. O frontend deve estar em `D:\Mediário\pb_public`.
3. Todas as alterações devem estar em commits.
4. `pb_data`, `.credentials.xml`, `pocketbase.exe`, `node_modules`, `dist` e `.env` devem estar fora do Git.

## Executar

Guarda `preparar-main.ps1` em:

```text
D:\Mediário\scripts\preparar-main.ps1
```

Depois:

```powershell
cd "D:\Mediário"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\scripts\preparar-main.ps1
```

## Resultado

```text
D:\Mediário\releases\mediario-v0.2.0-alpha.1-main-candidate.zip
D:\Mediário\releases\mediario-v0.2.0-alpha.1-main-candidate.zip.sha256
```

O ZIP contém o código da branch e do commit indicados em `PACKAGE-MANIFEST.md`.

## Promover à `main`

Depois de validar o pacote e resolver o Pull Request:

1. fazer merge para `main`;
2. mudar localmente para `main`;
3. executar `git pull`;
4. voltar a executar o script sobre a `main`;
5. comparar o commit do manifesto com o commit online;
6. criar tag e Release apenas depois da checklist VOD aprovada.
