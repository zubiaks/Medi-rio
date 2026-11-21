param(
  [string]$CssPath = "D:\Mediário\pb_public\src\styles\podcasts.css"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $CssPath)) {
  throw "Não encontrei o ficheiro: $CssPath"
}

$css = [System.IO.File]::ReadAllText($CssPath)
$marker = "/* More breathing room between the library heading, search and cards. */"
$markerIndex = $css.IndexOf($marker, [System.StringComparison]::Ordinal)

if ($markerIndex -lt 0) {
  throw "Não encontrei o marcador do bloco de paginação."
}

# No ficheiro atual, a paginação foi acrescentada no final. Removemos tudo
# desde o primeiro marcador e voltamos a escrever uma única versão canónica.
$prefix = $css.Substring(0, $markerIndex).TrimEnd()

$canonical = @'
/* More breathing room between the library heading, search and cards. */
.podcast-library {
  display: grid;
  gap: 1.25rem;
}

.podcast-library .section-heading {
  margin-bottom: 0;
}

.podcast-search {
  max-width: 52rem;
  margin: 0;
}

.podcast-grid {
  margin-top: 0.25rem;
}

.podcast-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.4rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: var(--surface);
}

.podcast-pagination-main,
.podcast-page-numbers,
.podcast-page-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.podcast-page-numbers {
  flex-wrap: wrap;
  justify-content: center;
}

.podcast-page-button {
  display: inline-grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  color: var(--text);
  background: var(--surface-2);
  cursor: pointer;
}

.podcast-page-button:hover,
.podcast-page-button:focus-visible {
  border-color: var(--primary);
}

.podcast-page-button.is-current {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--primary), var(--pink));
  box-shadow: 0 8px 22px color-mix(in srgb, var(--primary), transparent 70%);
}

.podcast-page-gap {
  color: var(--muted);
}

.podcast-page-jump {
  color: var(--muted);
  white-space: nowrap;
}

.podcast-page-jump input {
  width: 4.5rem;
  min-height: 42px;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  color: var(--text);
  background: var(--surface-2);
  text-align: center;
}

@media (max-width: 980px) {
  .podcast-pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .podcast-pagination-main {
    justify-content: space-between;
  }

  .podcast-page-jump {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .podcast-pagination-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .podcast-page-numbers {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .podcast-pagination-main > .button {
    width: 100%;
  }

  .podcast-page-button {
    width: 2.25rem;
    height: 2.25rem;
  }

  .podcast-page-jump {
    flex-wrap: wrap;
  }
}
'@

$result = $prefix + "`r`n`r`n" + $canonical.Trim() + "`r`n"
[System.IO.File]::WriteAllText(
  $CssPath,
  $result,
  [System.Text.UTF8Encoding]::new($false)
)

$count = ([regex]::Matches($result, [regex]::Escape(".podcast-pagination {"))).Count
if ($count -ne 1) {
  throw "A correção terminou com $count blocos principais; era esperado 1."
}

Write-Host "[OK] CSS da paginação consolidado: 1 bloco principal." -ForegroundColor Green
