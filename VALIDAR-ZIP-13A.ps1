$ErrorActionPreference="Stop"
Set-Location (Join-Path $PSScriptRoot "pb_public")
npm run type-check
if($LASTEXITCODE -ne 0){throw "Falhou: type-check"}
npx vitest run src/domain/navigation/breadcrumbs.spec.ts src/domain/auth/permissions.spec.ts
if($LASTEXITCODE -ne 0){throw "Falhou: testes"}
npm run build
if($LASTEXITCODE -ne 0){throw "Falhou: build"}
git diff --check
if($LASTEXITCODE -ne 0){throw "Falhou: diff"}
Write-Host "ZIP 13A validado." -ForegroundColor Green
