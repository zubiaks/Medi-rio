#Requires -Version 5.1
<#
.SYNOPSIS
  Reinstala as dependencias do Media Vault com a versao TypeScript compativel.
.NOTES
  TypeScript 5.9.2 e usado porque vue-tsc 3.3.x nao suporta TypeScript 7.
#>
param(
  [string]$ProjectDir = (Split-Path -Parent $PSScriptRoot)
)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $ProjectDir

Write-Host "Projeto: $ProjectDir" -ForegroundColor Cyan
Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"

if (Test-Path -LiteralPath "node_modules") {
  Write-Host "A remover node_modules antigo..." -ForegroundColor Yellow
  Remove-Item -LiteralPath "node_modules" -Recurse -Force
}
if (Test-Path -LiteralPath "package-lock.json") {
  Write-Host "A remover package-lock.json antigo..." -ForegroundColor Yellow
  Remove-Item -LiteralPath "package-lock.json" -Force
}

Write-Host "A instalar dependencias fixadas..." -ForegroundColor Yellow
& npm.cmd install
if ($LASTEXITCODE -ne 0) { throw "npm install falhou com codigo $LASTEXITCODE" }

$tsVersion = (& npm.cmd exec -- tsc --version)
Write-Host "TypeScript instalado: $tsVersion"
if ($tsVersion -notmatch '^Version 5\.9\.2$') {
  throw "Versao TypeScript inesperada. Esperado: 5.9.2. Atual: $tsVersion"
}

& npm.cmd audit
if ($LASTEXITCODE -ne 0) { throw "npm audit encontrou vulnerabilidades ou falhou." }

& npm.cmd run type-check
if ($LASTEXITCODE -ne 0) { throw "type-check falhou." }

& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw "build falhou." }

Write-Host "[OK] Dependencias, TypeScript, auditoria e build validados." -ForegroundColor Green
