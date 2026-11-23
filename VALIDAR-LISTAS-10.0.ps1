$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "pb_public")
$Steps = @(
  @{ Name = "TypeScript"; Run = { npm run type-check } },
  @{ Name = "Testes"; Run = { npx vitest run src/domain/lists/personalLists.spec.ts src/domain/lists/smartLists.spec.ts src/domain/lists/listPhase102.spec.ts src/domain/lists/listPhase103.spec.ts src/domain/lists/listsClosure.spec.ts } },
  @{ Name = "Build"; Run = { npm run build } },
  @{ Name = "Diff"; Run = { git diff --check } }
)
foreach ($Step in $Steps) {
  Write-Host "`n== $($Step.Name) ==" -ForegroundColor Cyan
  & $Step.Run
  if ($LASTEXITCODE -ne 0) { throw "Falhou: $($Step.Name)" }
}
Write-Host "`nMarco Listas 10.0 validado." -ForegroundColor Green
