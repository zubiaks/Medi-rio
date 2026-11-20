# Mediario
# Copyright (c) 2026 Zubiaks.
#
# Source-available under the PolyForm Noncommercial License 1.0.0.
# Commercial use requires prior written permission from Zubiaks.
# See LICENSE.md.
[CmdletBinding()]
param(
  [string]$ProjectDir = "",
  [string]$FrontendDir = "",
  [string]$ReleaseName = "mediario-v0.2.0-alpha.1-main-candidate",
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step([string]$Message) {
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Invoke-Checked([string]$File, [string[]]$Arguments, [string]$WorkingDirectory) {
  Push-Location $WorkingDirectory
  try {
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "O comando '$File $($Arguments -join ' ')' terminou com código $LASTEXITCODE."
    }
  }
  finally {
    Pop-Location
  }
}

if (-not $ProjectDir) {
  # O script vive em <raiz>\scripts. Descobrir a raiz sem depender
  # de caminhos com acentos nem da codificacao do ficheiro.
  $ProjectDir = Split-Path -Parent $PSScriptRoot
}
$ProjectDir = (Resolve-Path -LiteralPath $ProjectDir).Path
if (-not $FrontendDir) {
  $FrontendDir = Join-Path $ProjectDir "pb_public"
}
$FrontendDir = (Resolve-Path -LiteralPath $FrontendDir).Path

if (-not (Test-Path -LiteralPath (Join-Path $ProjectDir ".git"))) {
  throw "A raiz Git não é '$ProjectDir'. Executa: git rev-parse --show-toplevel"
}
if (-not (Test-Path -LiteralPath (Join-Path $FrontendDir "package.json"))) {
  throw "package.json não encontrado em '$FrontendDir'."
}

Write-Step "Confirmar branch e estado Git"
$branch = (& git -C $ProjectDir branch --show-current).Trim()
if (-not $branch) { throw "Não foi possível determinar a branch atual." }
$status = & git -C $ProjectDir status --porcelain
if ($status) {
  Write-Host $status
  throw "Existem alterações por commit. Faz commit antes de criar o pacote."
}
Write-Host "Branch: $branch" -ForegroundColor Green

Write-Step "Confirmar que dados privados não são rastreados"
$privatePatterns = @(
  "pb_data/",
  ".credentials.xml",
  "pocketbase.exe",
  "node_modules/",
  "dist/",
  ".env"
)
$tracked = & git -C $ProjectDir ls-files
foreach ($pattern in $privatePatterns) {
  $match = $tracked | Where-Object { $_ -eq $pattern.TrimEnd('/') -or $_.StartsWith($pattern) }
  if ($match) {
    throw "Conteúdo privado ou gerado está rastreado no Git: $($match -join ', ')"
  }
}
Write-Host "Dados privados fora do Git." -ForegroundColor Green

if (-not $SkipValidation) {
  Write-Step "Auditoria npm"
  Invoke-Checked "npm.cmd" @("audit", "--audit-level=high") $FrontendDir

  Write-Step "Type-check"
  Invoke-Checked "npm.cmd" @("run", "type-check") $FrontendDir

  Write-Step "Build"
  Invoke-Checked "npm.cmd" @("run", "build") $FrontendDir
}

$releasesDir = Join-Path $ProjectDir "releases"
$tempDir = Join-Path $env:TEMP ("mediario-main-" + [guid]::NewGuid().ToString("N"))
$archiveTar = Join-Path $tempDir "source.tar"
$packageDir = Join-Path $tempDir $ReleaseName
$zipPath = Join-Path $releasesDir ($ReleaseName + ".zip")

New-Item -ItemType Directory -Force -Path $releasesDir, $tempDir, $packageDir | Out-Null

try {
  Write-Step "Exportar apenas ficheiros rastreados no commit atual"
  Invoke-Checked "git" @("archive", "--format=tar", "--output=$archiveTar", "HEAD") $ProjectDir
  tar -xf $archiveTar -C $packageDir
  if ($LASTEXITCODE -ne 0) { throw "Falha ao extrair o arquivo Git." }

  $commit = (& git -C $ProjectDir rev-parse HEAD).Trim()
  $short = (& git -C $ProjectDir rev-parse --short HEAD).Trim()
  $remote = (& git -C $ProjectDir remote get-url origin 2>$null)
  $created = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"

  $manifest = @"
# Manifesto do pacote Mediario

- Pacote: `$ReleaseName
- Branch de origem: `$branch
- Commit: `$commit
- Commit curto: `$short
- Criado em: `$created
- Repositório: `$remote
- Frontend: `pb_public
- Dados pessoais incluídos: não
- `pb_data` incluída: não
- `.credentials.xml` incluído: não
- `pocketbase.exe` incluído: não
- `node_modules` incluído: não
- `dist` incluído: não

## Validações

- npm audit: $($(if ($SkipValidation) { "não executado" } else { "aprovado para vulnerabilidades high/critical" }))
- npm run type-check: $($(if ($SkipValidation) { "não executado" } else { "aprovado" }))
- npm run build: $($(if ($SkipValidation) { "não executado" } else { "aprovado" }))

## Instalação

1. Instalar PocketBase separadamente.
2. Aplicar `pb_migrations` quando existirem.
3. Entrar em `pb_public`.
4. Copiar `.env.example` para `.env`.
5. Executar `npm ci`.
6. Executar `npm run dev`.

Este pacote contém código-fonte versionado. Não contém a base pessoal nem uploads.
"@
  Set-Content -LiteralPath (Join-Path $packageDir "PACKAGE-MANIFEST.md") -Value $manifest -Encoding UTF8

  Write-Step "Criar ZIP"
  if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
  Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $zipPath -CompressionLevel Optimal

  $hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
  Set-Content -LiteralPath ($zipPath + ".sha256") -Value "$hash  $([IO.Path]::GetFileName($zipPath))" -Encoding ASCII

  Write-Host "`n[OK] Pacote criado:" -ForegroundColor Green
  Write-Host $zipPath
  Write-Host "SHA256: $hash"
  Write-Host "Origem: $branch @ $short"
}
finally {
  if (Test-Path -LiteralPath $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }
}
