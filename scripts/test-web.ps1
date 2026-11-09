$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$portableJava = Get-ChildItem -Path '.local-tools/java21/*/bin/java.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($portableJava) { $env:PATH = "$(Split-Path -Parent $portableJava.FullName);$env:PATH" }
$env:JAVA_TOOL_OPTIONS = '-Djava.net.preferIPv4Stack=true -Djdk.net.unixdomain.tmpdir=C:\nutricare-no-unix-sockets'
& firebase emulators:exec --only auth,firestore --project demo-nutricare --config firebase.test.json 'node --test tests/firestore-rules.test.mjs && pnpm exec playwright test'
exit $LASTEXITCODE
