#Requires -Version 5.1
<#
.SYNOPSIS
  Inicia o PocketBase e o frontend Vue Media Vault.
#>
param(
  [string]$BackendDir = "D:\pocketbase",
  [string]$FrontendDir = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)
$ErrorActionPreference = "Stop"
$pbExe = Join-Path $BackendDir "pocketbase.exe"
if (-not (Test-Path -LiteralPath $pbExe)) { throw "PocketBase nao encontrado: $pbExe" }
if (-not (Test-Path -LiteralPath (Join-Path $FrontendDir "package.json"))) { throw "Frontend nao encontrado: $FrontendDir" }

function Test-Url([string]$Url) {
  try { Invoke-RestMethod -Uri $Url -TimeoutSec 2 | Out-Null; return $true } catch { return $false }
}

if (-not (Test-Url "http://127.0.0.1:8090/api/health")) {
  Start-Process powershell.exe -ArgumentList "-NoExit", "-NoProfile", "-Command", "Set-Location -LiteralPath '$BackendDir'; & '.\pocketbase.exe' serve --http='127.0.0.1:8090'" | Out-Null
  for ($i=1; $i -le 30; $i++) { Start-Sleep 1; if (Test-Url "http://127.0.0.1:8090/api/health") { break } }
}
if (-not (Test-Url "http://127.0.0.1:8090/api/health")) { throw "PocketBase nao respondeu em 127.0.0.1:8090." }
Write-Host "[OK] PocketBase ativo." -ForegroundColor Green

Start-Process powershell.exe -ArgumentList "-NoExit", "-NoProfile", "-Command", "Set-Location -LiteralPath '$FrontendDir'; & npm.cmd run dev" | Out-Null
Write-Host "[OK] Vite iniciado. Abre http://127.0.0.1:5173" -ForegroundColor Green
