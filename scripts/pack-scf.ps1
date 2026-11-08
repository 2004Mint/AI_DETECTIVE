# Package the Tencent SCF function into dist-scf/vote-scf.zip
#
# Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/pack-scf.ps1
#
# Why bundle: the official COS SDK drags in 74 packages / ~1200 files, and SCF's
# unzip step rejects that archive ("zip code format error"). Bundling everything
# into one index.js keeps the zip at two files.
#
# Keep this file ASCII-only: Windows PowerShell 5.1 reads .ps1 as ANSI.

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'server\scf'
$stage = Join-Path $root 'dist-scf\package'
$zip = Join-Path $root 'dist-scf\vote-scf.zip'
$esbuild = Join-Path $root 'node_modules\esbuild\bin\esbuild'

if (-not (Test-Path $src)) { throw "function folder not found: $src" }
if (-not (Test-Path $esbuild)) { throw 'esbuild not found, run npm install first' }

Write-Host 'Installing function dependencies...'
Push-Location $src
try {
  npm install --omit=dev --no-audit --no-fund
} finally {
  Pop-Location
}

Write-Host 'Bundling into a single CommonJS file...'
New-Item -ItemType Directory -Force -Path $stage | Out-Null
$outFile = Join-Path $stage 'index.js'
& node $esbuild (Join-Path $src 'entry.cjs') --bundle --platform=node --target=node18 --format=cjs ("--outfile=" + $outFile) --log-level=warning
if ($LASTEXITCODE -ne 0) { throw 'esbuild failed' }

Set-Content -Path (Join-Path $stage 'package.json') -Encoding ASCII -Value '{ "name": "dream-vote", "version": "1.0.0", "main": "index.js" }'

Write-Host 'Zipping...'
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $zip) { Remove-Item $zip -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$sizeKb = [math]::Round((Get-Item $zip).Length / 1KB)
Write-Host ("Done: {0} ({1} KB, 2 files)" -f $zip, $sizeKb)
Write-Host 'Handler: index.main_handler'