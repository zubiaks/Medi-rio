# ZIP 2 — Fases 6Q, 6R, 6S e 6T

## Instalação

Extrair sobre `D:\Mediário` depois de instalar e validar o ZIP 1.

## Segurança

- A automação backend está desativada por predefinição.
- A sincronização global apenas cria tarefas.
- A descoberta é apenas de leitura.
- As imagens locais exigem seleção e URL explícitos.
- Não existe importação automática de recomendações.

## Testes

```powershell
Set-Location "D:\Mediário\pb_public"
npx vitest run src/domain/providers/tmdbZip2.spec.ts
npm run type-check
npm run build
git diff --check
```

Reiniciar o PocketBase devido aos hooks novos:

```powershell
Stop-Process -Name pocketbase -Force
Set-Location "D:\Mediário"
.\pocketbase.exe serve
```
