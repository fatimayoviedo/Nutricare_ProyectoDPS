param(
  [int]$Port = 8082,
  [switch]$Foreground,
  [switch]$Restart
)

$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$expoHome = Join-Path $projectRoot '.expo-home'
$logFolder = Join-Path $expoHome 'logs'
$expoCli = Join-Path $projectRoot 'node_modules\expo\bin\cli'

if (-not (Test-Path -LiteralPath $expoCli)) {
  throw 'No se encontró Expo. Ejecuta pnpm install desde la raíz del proyecto.'
}

New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
$env:EXPO_HOME = $expoHome
$env:EXPO_NO_TELEMETRY = '1'
$env:BROWSER = 'none'

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  try {
    $health = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$Port" -TimeoutSec 8
    if ($health.StatusCode -eq 200) {
      Write-Host "NutriCare ya está disponible en http://localhost:$Port"
      exit 0
    }
  } catch {
    if (-not $Restart) { throw "El puerto $Port está ocupado, pero el sitio no responde. Ejecuta el script con -Restart." }
    $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
    if (-not $owner.CommandLine -or $owner.CommandLine -notmatch 'expo[\\/]bin[\\/]cli start --web --port') {
      throw "El puerto $Port pertenece a otro programa y no se modificó."
    }
    Stop-Process -Id $listener.OwningProcess -Force
    Start-Sleep -Seconds 2
  }
}

$node = (Get-Command node -ErrorAction Stop).Source
if ($Foreground) {
  Set-Location -LiteralPath $projectRoot
  & $node $expoCli start --web --port $Port
  exit $LASTEXITCODE
}

$stdout = Join-Path $logFolder "web-$Port.log"
$stderr = Join-Path $logFolder "web-$Port-error.log"
$arguments = "`"$expoCli`" start --web --port $Port"
$process = Start-Process -FilePath $node -ArgumentList $arguments -WorkingDirectory $projectRoot -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Hidden -PassThru
$process.Id | Set-Content -LiteralPath (Join-Path $expoHome "web-$Port.pid")

# Metro can take over a minute to initialize its first web bundle on a cold start.
for ($attempt = 0; $attempt -lt 36; $attempt += 1) {
  Start-Sleep -Seconds 5
  if ($process.HasExited) {
    $details = if (Test-Path -LiteralPath $stderr) { Get-Content -Raw -LiteralPath $stderr } else { 'Sin detalles.' }
    throw "Expo no pudo iniciar. $details"
  }
  try {
    $health = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$Port" -TimeoutSec 8
    if ($health.StatusCode -eq 200) {
      Write-Host "NutriCare iniciado en segundo plano: http://localhost:$Port"
      Write-Host "Registro: $stdout"
      exit 0
    }
  } catch { }
}

throw "Expo inició, pero el sitio no respondió dentro del tiempo esperado. Revisa $stderr"
