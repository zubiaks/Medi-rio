param([Parameter(Mandatory=$true)][string]$Backup)
$ErrorActionPreference = "Stop"
$Stage = Join-Path $env:TEMP ("mediario-test-" + [guid]::NewGuid().ToString("N"))
Expand-Archive $Backup $Stage -Force
$ManifestPath = Join-Path $Stage "manifest.json"
if (-not (Test-Path $ManifestPath)) { throw "Manifesto em falta." }
$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
if ($Manifest.format -ne "mediario-backup" -or $Manifest.version -ne 1) { throw "Formato de backup incompatível." }
foreach ($Entry in $Manifest.files) {
  $Path = Join-Path (Join-Path $Stage "payload") ($Entry.path.Replace("/", "\"))
  if (-not (Test-Path $Path)) { throw "Ficheiro em falta: $($Entry.path)" }
  $Hash = (Get-FileHash $Path -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($Hash -ne $Entry.sha256) { throw "Hash inválido: $($Entry.path)" }
}
Remove-Item $Stage -Recurse -Force
Write-Host "Backup válido: $($Manifest.fileCount) ficheiros, $($Manifest.totalBytes) bytes." -ForegroundColor Green
