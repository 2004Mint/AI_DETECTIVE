# Crop mascot emotion sprite sheet -> 12 individual transparent PNG frames
# Usage: pwsh scripts/crop-mascot.ps1
# Output: src/assets/images/pet/frames/frame-00.png ~ frame-11.png (row-major, top-left first)
#         public/favicon.png (frame 1 scaled down for browser tab)
param(
    [string]$Source = 'src/assets/images/pet/388496a4-714d-4b4f-a8b6-3ec50c2096bc.png',
    [string]$OutDir = 'src/assets/images/pet/frames',
    [string]$Favicon = 'public/favicon.png'
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $root $Source
$outPath = Join-Path $root $OutDir
New-Item -ItemType Directory -Force -Path $outPath | Out-Null

$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $srcPath))
$W = $bmp.Width; $H = $bmp.Height
Write-Host "source: $W x $H"

function Is-Opaque($x, $y) { return $bmp.GetPixel($x, $y).A -gt 12 }

# 1) opaque masks for rows/cols -> content groups (transparent gutters split cells)
$rowMask = New-Object 'bool[]' $H
for ($y = 0; $y -lt $H; $y++) {
    $any = $false
    for ($x = 0; $x -lt $W; $x++) { if (Is-Opaque $x $y) { $any = $true; break } }
    $rowMask[$y] = $any
}
$colMask = New-Object 'bool[]' $W
for ($x = 0; $x -lt $W; $x++) {
    $any = $false
    for ($y = 0; $y -lt $H; $y++) { if (Is-Opaque $x $y) { $any = $true; break } }
    $colMask[$x] = $any
}

function Get-Groups($mask, $len) {
    $groups = @()
    $start = -1
    for ($i = 0; $i -le $len; $i++) {
        $v = ($i -lt $len) -and $mask[$i]
        if ($v -and $start -lt 0) { $start = $i }
        if (-not $v -and $start -ge 0) { $groups += , @($start, ($i - 1)); $start = -1 }
    }
    return $groups
}
$rowGroups = Get-Groups $rowMask $H
$colGroups = Get-Groups $colMask $W
Write-Host "row groups: $($rowGroups.Count), col groups: $($colGroups.Count)"
if ($rowGroups.Count -lt 1 -or $colGroups.Count -lt 1) { throw 'no cells detected' }

$rows = $rowGroups.Count
$cols = $colGroups.Count
$pad = 10

# 2) per cell: tight opaque bbox -> centered on transparent square canvas
$index = 0
for ($r = 0; $r -lt $rows; $r++) {
    for ($c = 0; $c -lt $cols; $c++) {
        $yr0 = $rowGroups[$r][0]; $yr1 = $rowGroups[$r][1]
        $xc0 = $colGroups[$c][0]; $xc1 = $colGroups[$c][1]
        $minX = $xc1; $maxX = $xc0; $minY = $yr1; $maxY = $yr0
        for ($y = $yr0; $y -le $yr1; $y++) {
            for ($x = $xc0; $x -le $xc1; $x++) {
                if (Is-Opaque $x $y) {
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }
        if ($maxX -lt $minX -or $maxY -lt $minY) { Write-Host "skip empty cell r$r c$c"; continue }
        $cw = $maxX - $minX + 1
        $ch = $maxY - $minY + 1
        $side = [Math]::Max($cw, $ch) + $pad * 2
        $canvas = New-Object System.Drawing.Bitmap($side, $side, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($canvas)
        $g.Clear([System.Drawing.Color]::Transparent)
        $dstX = [int](($side - $cw) / 2); $dstY = [int](($side - $ch) / 2)
        $dstRect = New-Object System.Drawing.Rectangle($dstX, $dstY, $cw, $ch)
        $srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cw, $ch)
        $g.DrawImage($bmp, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
        $name = "frame-{0:D2}.png" -f $index
        $canvas.Save((Join-Path $outPath $name), [System.Drawing.Imaging.ImageFormat]::Png)
        $canvas.Dispose()
        Write-Host ("{0}: cell r{1}c{2} bbox {3}x{4} at ({5},{6})" -f $name, $r, $c, $cw, $ch, $minX, $minY)
        $index++
    }
}

# 3) favicon from first frame
if ($index -gt 0) {
    $favPath = Join-Path $root $Favicon
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $favPath) | Out-Null
    $srcFrame = [System.Drawing.Image]::FromFile((Join-Path $outPath 'frame-00.png'))
    $ico = New-Object System.Drawing.Bitmap(128, 128, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g2 = [System.Drawing.Graphics]::FromImage($ico)
    $g2.Clear([System.Drawing.Color]::Transparent)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($srcFrame, 8, 8, 112, 112)
    $g2.Dispose(); $srcFrame.Dispose()
    $ico.Save($favPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $ico.Dispose()
    Write-Host "favicon saved: $favPath"
}
$bmp.Dispose()
Write-Host "done: $index frames -> $outPath"
