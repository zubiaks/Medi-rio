#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"
npm audit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run type-check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run build
exit $LASTEXITCODE
