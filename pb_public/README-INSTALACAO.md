# Instalar avisos de copyright

## 1. Pré-requisito jurídico

Antes de executar o script, substitui `LICENSE.md` pelo texto oficial integral da **PolyForm Noncommercial License 1.0.0** e regista a data e o commit da transição. O aviso curto nos ficheiros não substitui a licença completa.

## 2. Copiar

Copia para a raiz do projeto:

```text
D:\Mediário\COPYRIGHT.md
D:\Mediário\docs\COPYRIGHT-HEADERS.md
D:\Mediário\scripts\adicionar-copyright.ps1
```

## 3. Testar sem alterar

```powershell
cd "D:\Mediário"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\adicionar-copyright.ps1" -WhatIf
```

## 4. Aplicar

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\adicionar-copyright.ps1"
```

O script:

- adiciona avisos a `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`, `.css`, `.vue`, `.ps1`, `.bat` e `.cmd`;
- não altera JSON;
- ignora ficheiros que já tenham o aviso;
- funciona mesmo com a pasta `Mediário` contendo acento;
- procura `pb_public/src`, `pb_hooks`, `pb_migrations` e `scripts`.

## 5. Rever

```powershell
git diff --stat
git diff -- pb_public/src/main.ts
```

## 6. Validar

```powershell
cd "D:\Mediário\pb_public"
npm audit
npm run type-check
npm run build
```

## 7. Commit

Ver `COMMIT-GITHUB-DESKTOP.md`.
