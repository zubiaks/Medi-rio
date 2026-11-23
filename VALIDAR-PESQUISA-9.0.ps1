$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "pb_public")

$Passos = @(
  @{ Nome = "TypeScript"; Acao = { npm run type-check } },
  @{ Nome = "Testes de pesquisa"; Acao = { npx vitest run src/domain/search/globalSearch.spec.ts src/domain/search/searchDetails.spec.ts src/domain/search/searchPhase92.spec.ts src/domain/search/searchPhase93.spec.ts src/domain/search/searchPhase94.spec.ts src/domain/search/searchClosure.spec.ts } },
  @{ Nome = "Build"; Acao = { npm run build } },
  @{ Nome = "Diff"; Acao = { git diff --check } }
)
foreach ($Passo in $Passos) {
  Write-Host "`n== $($Passo.Nome) ==" -ForegroundColor Cyan
  & $Passo.Acao
  if ($LASTEXITCODE -ne 0) { throw "Falhou: $($Passo.Nome)" }
}
Write-Host "`nMarco Pesquisa 9.0 validado." -ForegroundColor Green
