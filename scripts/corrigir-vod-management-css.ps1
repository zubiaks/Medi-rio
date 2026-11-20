[CmdletBinding()]
param(
  [string]$CssPath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if (-not $CssPath) {
  $projectRoot = Split-Path -Parent $PSScriptRoot
  $CssPath = Join-Path $projectRoot "pb_public\src\styles\vod-management.css"
}

$CssPath = (Resolve-Path -LiteralPath $CssPath).Path
$css = [IO.File]::ReadAllText($CssPath)
$marker = ".vod-filters-header,"
$index = $css.IndexOf($marker, [StringComparison]::Ordinal)

# Remove o bloco consolidado anterior e qualquer cópia duplicada colocada depois dele.
# Os estilos VOD anteriores ao marcador são preservados.
if ($index -ge 0) {
  $css = $css.Substring(0, $index).TrimEnd()
}

$block = @'
.vod-filters-header,
.vod-filter-header-actions,
.vod-search-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vod-filters-header {
  justify-content: space-between;
  margin-bottom: 1rem;
}

.vod-filters-header h2,
.vod-filters-header p {
  margin: 0;
}

.vod-primary-filter {
  max-width: 42rem;
}

.vod-search-control input {
  flex: 1;
}

.vod-filter-summary {
  margin: 0.75rem 0 0;
  color: var(--txt-muted, #94a3b8);
  font-size: 0.85rem;
}

.vod-filter-toggle {
  display: none;
}

@media (max-width: 720px) {
  .vod-filters-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .vod-filter-header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .vod-filter-toggle {
    display: inline-flex;
  }

  .vod-advanced-filters {
    display: none;
  }

  .vod-advanced-filters.is-expanded {
    display: grid;
  }
}
'@

$clean = $css + "`n`n" + $block.Trim() + "`n"
$utf8 = New-Object Text.UTF8Encoding($false)
[IO.File]::WriteAllText($CssPath, $clean, $utf8)

# Contar o início único do bloco, não a regra interna legítima do @media.
$count = ([regex]::Matches(
  $clean,
  [regex]::Escape(".vod-filters-header,")
)).Count

if ($count -ne 1) {
  throw "A limpeza terminou com $count blocos de filtros VOD; era esperado 1."
}

Write-Host "[OK] CSS VOD consolidado sem duplicados." -ForegroundColor Green
Write-Host "Ficheiro: $CssPath"
Write-Host "Blocos de filtros VOD: $count"
