$ErrorActionPreference = "Stop"
$Frontend = Join-Path $PSScriptRoot "pb_public"
Set-Location $Frontend

$Comandos = @(
  @{ Nome = "TypeScript"; Executar = { npm run type-check } },
  @{ Nome = "Testes Providers"; Executar = { npx vitest run src/domain/providers/providersClosure.spec.ts src/domain/providers/providersStyles.spec.ts src/domain/providers/tmdbClosure.spec.ts src/domain/providers/tmdbWorkspace.spec.ts src/domain/providers/tmdbSafeClose.spec.ts } },
  @{ Nome = "Build"; Executar = { npm run build } },
  @{ Nome = "Diff"; Executar = { git diff --check } }
)

foreach ($Comando in $Comandos) {
  Write-Host "`n== $($Comando.Nome) ==" -ForegroundColor Cyan
  & $Comando.Executar
  if ($LASTEXITCODE -ne 0) {
    throw "Falhou: $($Comando.Nome)"
  }
}

Write-Host "`nFase 7 validada com sucesso." -ForegroundColor Green
