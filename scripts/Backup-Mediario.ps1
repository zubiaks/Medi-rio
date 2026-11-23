param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [string]$Destination = (Join-Path (Split-Path -Parent $PSScriptRoot) "backups"),
  [switch]$IncludeSecrets
)
$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Stage = Join-Path $env:TEMP "mediario-backup-$Timestamp"
$Payload = Join-Path $Stage "payload"
New-Item -ItemType Directory -Path $Payload -Force | Out-Null
New-Item -ItemType Directory -Path $Destination -Force | Out-Null

$Paths = @("pb_data", "pb_hooks", "pb_migrations", "pb_public", "CONFIGURACAO", "VALIDACAO")
foreach ($Name in $Paths) {
  $Source = Join-Path $Root $Name
  if (Test-Path $Source) {
    Copy-Item $Source (Join-Path $Payload $Name) -Recurse -Force
  }
}
foreach ($Name in @("VERSION", "README.md", "CHANGELOG.md", "LICENSE.md")) {
  $Source = Join-Path $Root $Name
  if (Test-Path $Source) { Copy-Item $Source $Payload -Force }
}

if (-not $IncludeSecrets) {
  $Settings = Join-Path $Payload "pb_data\data.db"
  if (Test-Path $Settings) {
    Write-Warning "A base PocketBase pode conter credenciais em app_settings. Para um backup sem segredos usa a exportação lógica futura. Este backup integral mantém data.db para permitir restauro completo."
  }
}

$Files = Get-ChildItem $Payload -File -Recurse
$Entries = foreach ($File in $Files) {
  [ordered]@{
    path = $File.FullName.Substring($Payload.Length + 1).Replace("\", "/")
    bytes = $File.Length
    sha256 = (Get-FileHash $File.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  }
}
$Manifest = [ordered]@{
  format = "mediario-backup"
  version = 1
  createdAt = (Get-Date).ToUniversalTime().ToString("o")
  includesDatabase = Test-Path (Join-Path $Payload "pb_data\data.db")
  includesSecrets = [bool]$IncludeSecrets
  fileCount = @($Entries).Count
  totalBytes = (@($Entries) | Measure-Object bytes -Sum).Sum
  files = @($Entries)
}
$Manifest | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $Stage "manifest.json") -Encoding UTF8
$Zip = Join-Path $Destination "mediario-backup-$Timestamp.zip"
Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $Zip -CompressionLevel Optimal
Remove-Item $Stage -Recurse -Force
Write-Host "Backup criado: $Zip" -ForegroundColor Green
