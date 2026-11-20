[CmdletBinding(SupportsShouldProcess)]
param(
  [string]$ProjectDir = "",
  [int]$Year = 2026
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if (-not $ProjectDir) {
  $ProjectDir = Split-Path -Parent $PSScriptRoot
}
$ProjectDir = (Resolve-Path -LiteralPath $ProjectDir).Path

$targets = @(
  @{ Root = "pb_public\src"; Extensions = @(".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".vue") },
  @{ Root = "pb_hooks"; Extensions = @(".js", ".ts") },
  @{ Root = "pb_migrations"; Extensions = @(".js", ".ts") },
  @{ Root = "scripts"; Extensions = @(".ps1", ".bat", ".cmd") }
)

$blockHeader = @" 
/**
 * Mediario
 * Copyright (c) $Year Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */

"@

$htmlHeader = @" 
<!--
  Mediario
  Copyright (c) $Year Zubiaks.

  Source-available under the PolyForm Noncommercial License 1.0.0.
  Commercial use requires prior written permission from Zubiaks.
  See LICENSE.md.
-->

"@

$psHeader = @" 
# Mediario
# Copyright (c) $Year Zubiaks.
#
# Source-available under the PolyForm Noncommercial License 1.0.0.
# Commercial use requires prior written permission from Zubiaks.
# See LICENSE.md.

"@

$batHeader = @"
:: Mediario
:: Copyright (c) $Year Zubiaks.
:: Source-available under the PolyForm Noncommercial License 1.0.0.
:: Commercial use requires prior written permission from Zubiaks.
:: See LICENSE.md.

"@

$changed = 0
$skipped = 0

foreach ($target in $targets) {
  $root = Join-Path $ProjectDir $target.Root
  if (-not (Test-Path -LiteralPath $root)) { continue }

  Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $target.Extensions -contains $_.Extension.ToLowerInvariant()
  } | ForEach-Object {
    $path = $_.FullName
    $content = [IO.File]::ReadAllText($path)

    if ($content -match "Copyright (©|\(c\)) $Year Zubiaks" -or
        $content -match "PolyForm Noncommercial License 1\.0\.0") {
      $script:skipped++
      return
    }

    $extension = $_.Extension.ToLowerInvariant()
    $header = switch ($extension) {
      ".vue" { $htmlHeader }
      ".ps1" { $psHeader }
      ".bat" { $batHeader }
      ".cmd" { $batHeader }
      default { $blockHeader }
    }

    if ($PSCmdlet.ShouldProcess($path, "Adicionar aviso de copyright")) {
      $encoding = New-Object Text.UTF8Encoding($true)
      [IO.File]::WriteAllText($path, $header + $content, $encoding)
      $script:changed++
      Write-Host "[OK] $($path.Substring($ProjectDir.Length + 1))"
    }
  }
}

Write-Host ""
Write-Host "Ficheiros alterados: $changed" -ForegroundColor Green
Write-Host "Ficheiros já protegidos: $skipped"
Write-Host ""
Write-Host "Valida agora:"
Write-Host "  cd `"$ProjectDir\pb_public`""
Write-Host "  npm run type-check"
Write-Host "  npm run build"
