[CmdletBinding(SupportsShouldProcess)]
param([string]$ProjectDir = "")

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if (-not $ProjectDir) {
  $ProjectDir = Split-Path -Parent $PSScriptRoot
}
$ProjectDir = (Resolve-Path -LiteralPath $ProjectDir).Path

$roots = @("pb_public\src", "pb_hooks", "pb_migrations", "scripts")
$extensions = @(".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".vue", ".ps1", ".bat", ".cmd")
$changed = 0

foreach ($relativeRoot in $roots) {
  $root = Join-Path $ProjectDir $relativeRoot
  if (-not (Test-Path -LiteralPath $root)) { continue }

  Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $extensions -contains $_.Extension.ToLowerInvariant()
  } | ForEach-Object {
    $path = $_.FullName
    $content = [IO.File]::ReadAllText($path)
    $fixed = $content

    # Corrigir variantes mojibake e usar ASCII apenas no cabecalho tecnico.
    $fixed = $fixed.Replace("Mediario", "Mediario")
    $fixed = $fixed.Replace("Mediario", "Mediario")
    $fixed = $fixed.Replace("Copyright (c) 2026 Zubiaks.", "Copyright (c) 2026 Zubiaks.")
    $fixed = $fixed.Replace("Copyright (c) 2026 Zubiaks.", "Copyright (c) 2026 Zubiaks.")

    if ($fixed -ne $content -and $PSCmdlet.ShouldProcess($path, "Corrigir codificacao do aviso")) {
      # UTF-8 sem BOM para codigo web. Os avisos ficam ASCII e nao dependem da consola.
      $utf8 = New-Object Text.UTF8Encoding($false)
      [IO.File]::WriteAllText($path, $fixed, $utf8)
      $script:changed++
      Write-Host "[OK] $($path.Substring($ProjectDir.Length + 1))"
    }
  }
}

# Corrigir o gerador para futuras execucoes.
$generator = Join-Path $ProjectDir "scripts\adicionar-copyright.ps1"
if (Test-Path -LiteralPath $generator) {
  $content = [IO.File]::ReadAllText($generator)
  $fixed = $content.Replace("Mediario", "Mediario").Replace("Mediario", "Mediario")
  $fixed = $fixed.Replace("Copyright Â© `$Year Zubiaks.", "Copyright (c) `$Year Zubiaks.")
  $fixed = $fixed.Replace("Copyright © `$Year Zubiaks.", "Copyright (c) `$Year Zubiaks.")
  if ($fixed -ne $content -and $PSCmdlet.ShouldProcess($generator, "Corrigir gerador de avisos")) {
    $utf8Bom = New-Object Text.UTF8Encoding($true)
    [IO.File]::WriteAllText($generator, $fixed, $utf8Bom)
    $changed++
    Write-Host "[OK] scripts\adicionar-copyright.ps1"
  }
}

Write-Host ""
Write-Host "Ficheiros corrigidos: $changed" -ForegroundColor Green
