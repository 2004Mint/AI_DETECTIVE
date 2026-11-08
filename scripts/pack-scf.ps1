# 打包腾讯云 SCF 函数（Windows / PowerShell）
#
# 用法：pwsh scripts/pack-scf.ps1
# 产物：dist-scf/vote-scf.zip（直接上传到云函数控制台）

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'server\scf'
$outDir = Join-Path $root 'dist-scf'
$zip = Join-Path $outDir 'vote-scf.zip'

if (-not (Test-Path $src)) {
  throw "找不到函数目录：$src"
}

Write-Host '安装函数依赖（仅生产依赖）…'
Push-Location $src
try {
  npm install --omit=dev --no-audit --no-fund
} finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
if (Test-Path $zip) { Remove-Item $zip -Force }

Write-Host '打包…'
# 三个必须项：入口、依赖清单、node_modules
$items = @(
  (Join-Path $src 'index.js'),
  (Join-Path $src 'package.json'),
  (Join-Path $src 'node_modules')
) | Where-Object { Test-Path $_ }

Compress-Archive -Path $items -DestinationPath $zip -CompressionLevel Optimal

$size = [math]::Round((Get-Item $zip).Length / 1KB)
Write-Host "完成：$zip（${size} KB）"
Write-Host '上传到云函数控制台时，执行方法填 index.main_handler'
