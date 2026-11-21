param(
  [string]$ProjectPath = "D:\Mediário\pb_public"
)
$ErrorActionPreference = "Stop"
$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item -Path (Join-Path $packageRoot "src\*") -Destination (Join-Path $ProjectPath "src") -Recurse -Force
Copy-Item -LiteralPath (Join-Path $packageRoot "vitest.config.ts") -Destination (Join-Path $ProjectPath "vitest.config.ts") -Force
$mainPath = Join-Path $ProjectPath "src\main.ts"
$main = [IO.File]::ReadAllText($mainPath)
$main = $main -replace '(?m)^import "@/styles/live(?:-links-player)?\.css";\r?\n?', ''
if ($main -notmatch 'import "@/styles/iptv-all\.css";') {
  $main = $main.TrimEnd() + "`r`nimport `"@/styles/iptv-all.css`";`r`n"
}
[IO.File]::WriteAllText($mainPath, $main, [Text.UTF8Encoding]::new($false))
Push-Location $ProjectPath
try {
  npm pkg set 'scripts.test:a11y=vitest run src/components/base/BasePagination.a11y.spec.ts src/components/iptv/ChannelEditDialog.a11y.spec.ts src/components/iptv/StreamLinkEditDialog.a11y.spec.ts'
  npm run type-check
  npm run test
  npm run build
} finally { Pop-Location }
Write-Host "[OK] Módulo TV completo instalado e validado." -ForegroundColor Green
