Add-Type -AssemblyName System.Drawing

function Convert-ToTransparent {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Threshold = 236
    )
    
    $src = [System.Drawing.Bitmap]::new($InputPath)
    $w = $src.Width
    $h = $src.Height
    $dst = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    # 2D array of visited pixels
    $visited = New-Object 'bool[,]' $w, $h
    $queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]
    
    # Seed outer edges
    for ($x = 0; $x -lt $w; $x++) {
        $queue.Enqueue([System.Drawing.Point]::new($x, 0))
        $queue.Enqueue([System.Drawing.Point]::new($x, $h - 1))
        $visited[$x, 0] = $true
        $visited[$x, $h - 1] = $true
    }
    for ($y = 0; $y -lt $h; $y++) {
        $queue.Enqueue([System.Drawing.Point]::new(0, $y))
        $queue.Enqueue([System.Drawing.Point]::new($w - 1, $y))
        $visited[0, $y] = $true
        $visited[$w - 1, $y] = $true
    }
    
    while ($queue.Count -gt 0) {
        $pt = $queue.Dequeue()
        $c = $src.GetPixel($pt.X, $pt.Y)
        
        if ($c.R -ge $Threshold -and $c.G -ge $Threshold -and $c.B -ge $Threshold) {
            $dst.SetPixel($pt.X, $pt.Y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            
            $nx = $pt.X + 1; if ($nx -lt $w -and -not $visited[$nx, $pt.Y]) { $visited[$nx, $pt.Y] = $true; $queue.Enqueue([System.Drawing.Point]::new($nx, $pt.Y)) }
            $nx = $pt.X - 1; if ($nx -ge 0 -and -not $visited[$nx, $pt.Y]) { $visited[$nx, $pt.Y] = $true; $queue.Enqueue([System.Drawing.Point]::new($nx, $pt.Y)) }
            $ny = $pt.Y + 1; if ($ny -lt $h -and -not $visited[$pt.X, $ny]) { $visited[$pt.X, $ny] = $true; $queue.Enqueue([System.Drawing.Point]::new($pt.X, $ny)) }
            $ny = $pt.Y - 1; if ($ny -ge 0 -and -not $visited[$pt.X, $ny]) { $visited[$pt.X, $ny] = $true; $queue.Enqueue([System.Drawing.Point]::new($pt.X, $ny)) }
        } else {
            $dst.SetPixel($pt.X, $pt.Y, $c)
        }
    }
    
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            if (-not $visited[$x, $y]) {
                $dst.SetPixel($x, $y, $src.GetPixel($x, $y))
            }
        }
    }
    
    $dst.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dst.Dispose()
    Write-Host "Processed: $OutputPath"
}

Convert-ToTransparent -InputPath 'C:\Users\ASUS\.gemini\antigravity\scratch\yuhashvi-21st-birthday\assets\reference\girl-reference.jpg' -OutputPath 'C:\Users\ASUS\.gemini\antigravity\scratch\yuhashvi-21st-birthday\assets\characters\girl_transparent.png' -Threshold 235
