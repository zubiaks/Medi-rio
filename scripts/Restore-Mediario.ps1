param(
  [Parameter(Mandatory=$true)][string]$Backup,
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [switch]$Force
)
$ErrorActionPreference = "Stop"
if (-not $Force) { throw "Restauro bloqueado. Executa novamente com -Force depois de confirmares o backup e parares o PocketBase." }
$Stage = Join-Path $env:TEMP ("mediario-restore-" + [guid]::NewGuid().ToString("N"))
Expand-Archive $Backup $Stage -Force
$Manifest = Get-Content (Join-Path $Stage "manifest.json") -Raw | ConvertFrom-Json
if ($Manifest.format -ne "mediario-backup" -or $Manifest.version -ne 1) { throw "Backup incompatível." }
foreach ($Entry in $Manifest.files) {
  $Path = Join-Path (Join-Path $Stage "payload") ($Entry.path.Replace("/", "\"))
  if (-not (Test-Path $Path)) { throw "Ficheiro em falta: $($Entry.path)" }
  if ((Get-FileHash $Path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Entry.sha256) { throw "Hash inválido: $($Entry.path)" }
}
$Safety = Join-Path $Root ("pre-restore-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory $Safety -Force | Out-Null
foreach ($Name in @("pb_data", "pb_hooks", "pb_migrations", "pb_public")) {
  $Current = Join-Path $Root $Name
  if (Test-Path $Current) { Move-Item $Current (Join-Path $Safety $Name) }
}
try {
  Copy-Item (Join-Path $Stage "payload\*") $Root -Recurse -Force
  Write-Host "Restauro concluído. Cópia anterior: $Safety" -ForegroundColor Green
} catch {
  foreach ($Name in @("pb_data", "pb_hooks", "pb_migrations", "pb_public")) {
    $Restored = Join-Path $Root $Name
    if (Test-Path $Restored) { Remove-Item $Restored -Recurse -Force }
    $Previous = Join-Path $Safety $Name
    if (Test-Path $Previous) { Move-Item $Previous $Restored }
  }
  throw
} finally {
  Remove-Item $Stage -Recurse -Force
}
