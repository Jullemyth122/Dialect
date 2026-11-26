# Draws Dialect's PNG icons and social-share image with System.Drawing (built into Windows).
# Run from the repo root:  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-images.ps1
# Output: sites/hospital/static/assets/img/{icon-192.png, icon-512.png, apple-touch-icon.png, og.png}
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$out = Join-Path $PSScriptRoot '..\sites\hospital\static\assets\img'
$accent = [System.Drawing.ColorTranslator]::FromHtml('#0E5A57')
$paper = [System.Drawing.ColorTranslator]::FromHtml('#F6F4EF')
$ink = [System.Drawing.ColorTranslator]::FromHtml('#1B1F1E')
$muted = [System.Drawing.ColorTranslator]::FromHtml('#5A6260')
$soft = [System.Drawing.ColorTranslator]::FromHtml('#E3EFEC')

function New-RoundedPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

# Draws the mark (32-unit design) at offset ox, oy with scale s.
function Draw-Mark($g, [single]$ox, [single]$oy, [single]$s) {
  $tile = New-RoundedPath $ox $oy (32 * $s) (32 * $s) (9 * $s)
  $g.FillPath((New-Object System.Drawing.SolidBrush $accent), $tile)
  $white = [System.Drawing.Color]::White
  $pen = New-Object System.Drawing.Pen $white, (2 * $s)
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
  $g.DrawBezier($pen, $ox + 10.5 * $s, $oy + 11.5 * $s, $ox + 13.1 * $s, $oy + 8.1 * $s, $ox + 18.9 * $s, $oy + 8.1 * $s, $ox + 21.5 * $s, $oy + 11.5 * $s)
  $ring = New-Object System.Drawing.Pen $white, (2.2 * $s)
  $r = 3.9 * $s
  $g.DrawEllipse($ring, $ox + 10.6 * $s - $r, $oy + 18 * $s - $r, 2 * $r, 2 * $r)
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $white), $ox + 21.4 * $s - $r, $oy + 18 * $s - $r, 2 * $r, 2 * $r)
}

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.InterpolationMode = 'HighQualityBicubic'
  return @($bmp, $g)
}

foreach ($size in @(@{ n = 'icon-192.png'; s = 192 }, @{ n = 'icon-512.png'; s = 512 }, @{ n = 'apple-touch-icon.png'; s = 180 })) {
  $bmp, $g = New-Canvas $size.s $size.s
  $g.Clear([System.Drawing.Color]::Transparent)
  if ($size.n -eq 'apple-touch-icon.png') { $g.Clear($accent) }
  Draw-Mark $g 0 0 ($size.s / 32)
  $bmp.Save((Join-Path $out $size.n), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

# Social share image, 1200 x 630.
$bmp, $g = New-Canvas 1200 630
$g.Clear($paper)
$g.FillPath((New-Object System.Drawing.SolidBrush $soft), (New-RoundedPath 720 70 410 490 36))
Draw-Mark $g 80 80 2.4
$serif = 'Palatino Linotype'
$brand = New-Object System.Drawing.Font $serif, 34, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$title = New-Object System.Drawing.Font $serif, 64, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$body = New-Object System.Drawing.Font 'Segoe UI', 26, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$mono = New-Object System.Drawing.Font 'Consolas', 40, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$small = New-Object System.Drawing.Font 'Segoe UI', 20, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$inkBrush = New-Object System.Drawing.SolidBrush $ink
$mutedBrush = New-Object System.Drawing.SolidBrush $muted
$accentBrush = New-Object System.Drawing.SolidBrush $accent
$g.DrawString('Dialect', $brand, $inkBrush, 170, 92)
$g.DrawString("Lab results that stay`nreadable when they`ntravel.", $title, $inkBrush, (New-Object System.Drawing.RectangleF 76, 200, 640, 260))
$g.DrawString('Match local lab names to LOINC. Ask a person when unsure. Never medical advice.', $body, $mutedBrush, (New-Object System.Drawing.RectangleF 80, 470, 620, 80))
$g.DrawString('Synthetic demo: fictional hospitals and patients', $small, $mutedBrush, 80, 560)
$g.DrawString('GLU-F', $mono, $inkBrush, 770, 130)
$g.DrawString('5.6 mmol/L', $body, $mutedBrush, 772, 182)
$arrow = New-Object System.Drawing.Pen $accent, 4
$arrow.EndCap = 'ArrowAnchor'
$g.DrawLine($arrow, 925, 245, 925, 315)
$g.DrawString('14771-0', $mono, $accentBrush, 770, 335)
$g.DrawString("Fasting glucose`n[Moles/volume]`nin Serum or Plasma", $body, $mutedBrush, (New-Object System.Drawing.RectangleF 772, 390, 340, 130))
$bmp.Save((Join-Path $out 'og.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Get-ChildItem $out -Filter *.png | ForEach-Object { '{0}  {1:N0} bytes' -f $_.Name, $_.Length }
