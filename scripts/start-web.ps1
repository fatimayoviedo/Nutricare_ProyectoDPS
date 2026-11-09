param([switch]$Rebuild, [int]$Port = 3000)
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $project
$runtime = Join-Path $project '.local-tools'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
$stateFile = Join-Path $runtime "web-$Port.json"
$nextCli = Join-Path $project 'node_modules\next\dist\bin\next'
if (!(Test-Path -LiteralPath $nextCli)) { throw 'Faltan dependencias. Ejecuta pnpm install desde la carpeta nutricare.' }
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  if (!$Rebuild) { Write-Host "El puerto $Port ya está activo. Abre http://localhost:$Port"; exit 0 }
  if (!(Test-Path -LiteralPath $stateFile)) { throw "El puerto $Port pertenece a un proceso no iniciado por este script. Ciérralo desde su terminal y vuelve a intentar." }
  $saved = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
  if ($saved.processId -ne $listener.OwningProcess -or !$process.CommandLine.Contains($nextCli)) { throw 'No se detuvo el proceso porque no corresponde al servidor administrado de este proyecto.' }
  Stop-Process -Id $listener.OwningProcess
  Start-Sleep -Seconds 2
}
if ($Rebuild -or !(Test-Path -LiteralPath (Join-Path $project '.next\BUILD_ID'))) {
  & node $nextCli build
  if ($LASTEXITCODE -ne 0) { throw 'La compilación falló. Corrige el error mostrado antes de iniciar.' }
}
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:NEXT_PUBLIC_USE_FIREBASE_EMULATORS = 'false'
$arguments = @('"' + $nextCli + '"', 'start', '--port', "$Port", '--hostname', '127.0.0.1')
$server = Start-Process -FilePath (Get-Command node).Source -ArgumentList $arguments -WorkingDirectory $project -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtime "web-$Port.log") -RedirectStandardError (Join-Path $runtime "web-$Port.error.log") -PassThru
@{processId=$server.Id;port=$Port;project=$project} | ConvertTo-Json | Set-Content -LiteralPath $stateFile
for ($attempt=0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Seconds 1
  try { $health = Invoke-RestMethod "http://127.0.0.1:$Port/api/status" -TimeoutSec 2; if ($health.service -eq 'NutriCare Web') { Write-Host "NutriCare disponible: http://localhost:$Port/login"; exit 0 } } catch { if ($server.HasExited) { break } }
}
throw "No se confirmó el arranque. Revisa .local-tools/web-$Port.error.log."
