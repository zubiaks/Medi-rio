$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "pb_public")

npm run type-check
if ($LASTEXITCODE -ne 0) { throw "Falhou: type-check" }

npx vitest run src/domain/auth/permissions.spec.ts
if ($LASTEXITCODE -ne 0) { throw "Falhou: testes de permissões" }

npm run build
if ($LASTEXITCODE -ne 0) { throw "Falhou: build" }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "Falhou: diff" }

Write-Host "ZIP 11A validado." -ForegroundColor Green
