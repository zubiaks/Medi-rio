$Styles = Join-Path $PSScriptRoot "pb_public\src\styles"
Get-ChildItem $Styles -File | Where-Object {
  $_.Name -like "providers-phase-*.css" -or $_.Name -eq "providers-zip-2.css"
} | Remove-Item -Force
Write-Host "CSS faseado antigo removido. providers.css consolidado mantido."
