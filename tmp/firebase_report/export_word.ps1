$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$inputPath = Join-Path $root 'output/documents/NutriCare_Informe_Firebase_Fatima_Oviedo.docx'
$outputDir = Join-Path $root 'output/pdf'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$outputPath = Join-Path $outputDir 'NutriCare_Informe_Firebase_Fatima_Oviedo.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $report = $word.Documents.Open($inputPath, $false, $true)
  $report.Repaginate()
  $report.ExportAsFixedFormat($outputPath, 17)
  $report.Close(0)
  Write-Output $outputPath
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
