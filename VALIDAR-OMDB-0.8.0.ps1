$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "pb_public")

$Passos = @(
  @{ Nome = "TypeScript"; Acao = { npm run type-check } },
  @{ Nome = "Testes OMDb"; Acao = { npx vitest run src/domain/providers/omdbMapping.spec.ts src/domain/providers/omdbEnrichment.spec.ts src/domain/providers/omdbRatings.spec.ts src/domain/providers/omdbJobExecutor.spec.ts src/domain/providers/omdbReviewStore.spec.ts src/domain/providers/providerOperations.spec.ts src/domain/providers/omdbClosure.spec.ts } },
  @{ Nome = "Build"; Acao = { npm run build } },
  @{ Nome = "Diff"; Acao = { git diff --check } }
)

foreach ($Passo in $Passos) {
  Write-Host "`n== $($Passo.Nome) ==" -ForegroundColor Cyan
  & $Passo.Acao
  if ($LASTEXITCODE -ne 0) { throw "Falhou: $($Passo.Nome)" }
}
Write-Host "`nMarco OMDb 0.8.0 validado." -ForegroundColor Green
