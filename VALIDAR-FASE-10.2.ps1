$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "pb_public")
npm run type-check
if ($LASTEXITCODE -ne 0) { throw "Falhou: type-check" }
npx vitest run src/domain/lists/personalLists.spec.ts src/domain/lists/smartLists.spec.ts src/domain/lists/listPhase102.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Falhou: testes" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Falhou: build" }
git diff --check
if ($LASTEXITCODE -ne 0) { throw "Falhou: diff" }
Write-Host "Fase 10.2 validada." -ForegroundColor Green
