$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "pb_public")
npm run type-check
if ($LASTEXITCODE -ne 0) { throw "Falhou: type-check" }
npx vitest run src/domain/search/globalSearch.spec.ts src/domain/search/searchDetails.spec.ts src/domain/search/searchPhase92.spec.ts src/domain/search/searchPhase93.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Falhou: testes" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Falhou: build" }
git diff --check
if ($LASTEXITCODE -ne 0) { throw "Falhou: diff" }
Write-Host "Fase 9.3 validada." -ForegroundColor Green
