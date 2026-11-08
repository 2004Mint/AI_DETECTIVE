<#
  ============================================================================
  AI 鉴定师 · 招新海报构建脚本
  ----------------------------------------------------------------------------
  把 poster.html 用系统自带的 Edge（Chromium 内核）无头模式光栅化成图片：

    poster.png      A3 竖版 @300dpi —— 2480 × 3508，可直接打印 / 送印
    poster-web.png  1240 宽 —— 公众号、QQ/微信群、朋友圈发图用

  用法（在 poster 目录下）：
    pwsh -File build-poster.ps1
    pwsh -File build-poster.ps1 -Open     # 出图后自动打开预览

  说明：Chromium 的 --screenshot 是异步落盘的，进程退出时文件可能还没写完，
        所以这里轮询等待「文件出现 + 体积稳定」再算完成。
  ============================================================================
#>
param(
  [string]$EdgePath,
  [switch]$Open
)
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $root 'poster.html'
if (-not (Test-Path $html)) { throw "找不到 poster.html：$html" }

# ---------- 找 Edge ----------
if (-not $EdgePath) {
  $candidates = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  )
  $EdgePath = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
}
if (-not $EdgePath) { throw '没找到 Edge / Chrome，请用 -EdgePath 指定 msedge.exe 的完整路径。' }
Write-Host "浏览器：$EdgePath" -ForegroundColor DarkGray

$png = Join-Path $root 'poster.png'
$web = Join-Path $root 'poster-web.png'
$url = ([uri]$html).AbsoluteUri

# ---------- 1. 300dpi A3（画布 1240×1754 CSS px × 2） ----------
if (Test-Path $png) { Remove-Item $png -Force }
Write-Host '渲染 A3 @300dpi ...' -ForegroundColor Cyan
& $EdgePath --headless=new --no-sandbox --disable-gpu --disable-crash-reporter `
  --hide-scrollbars --no-first-run --disable-extensions `
  --user-data-dir="$root\.edge-profile" `
  --force-device-scale-factor=2 --window-size=1240,1754 `
  --virtual-time-budget=8000 --screenshot="$png" $url 2>$null

$deadline = (Get-Date).AddSeconds(120)
$lastSize = -1
while ((Get-Date) -lt $deadline) {
  if (Test-Path $png) {
    $size = (Get-Item $png).Length
    if ($size -gt 0 -and $size -eq $lastSize) { break }
    $lastSize = $size
  }
  Start-Sleep -Milliseconds 400
}
if (-not (Test-Path $png)) { throw '出图失败：没生成 poster.png' }
Write-Host ("  poster.png  {0:N2} MB" -f ((Get-Item $png).Length / 1MB)) -ForegroundColor Green

# ---------- 2. 网页版 1240 宽 ----------
if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host '生成网页版 poster-web.png ...' -ForegroundColor Cyan
  Push-Location (Split-Path -Parent $root)   # 回项目根目录，才能解析到 node_modules/sharp
  & node -e "import('sharp').then(({default:s})=>s('poster/poster.png').resize(1240).png({compressionLevel:9}).toFile('poster/poster-web.png')).then(()=>console.log('ok'))"
  Pop-Location
  if (Test-Path $web) { Write-Host ("  poster-web.png  {0:N2} MB" -f ((Get-Item $web).Length / 1MB)) -ForegroundColor Green }
} else {
  Write-Host '  跳过网页版（没装 Node）' -ForegroundColor Yellow
}

# 清掉无头浏览器的临时 profile，保持目录干净
Remove-Item (Join-Path $root '.edge-profile') -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ''
Write-Host '完成 ✅  换二维码：替换 assets/qr.png 后重跑本脚本' -ForegroundColor Green
if ($Open) { Start-Process $png }
