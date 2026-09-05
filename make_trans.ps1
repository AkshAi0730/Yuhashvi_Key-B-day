$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class FastTransparent {
    public static void Process(string srcPath, string dstPath, int threshold) {
        using (Bitmap bmp = new Bitmap(srcPath)) {
            int w = bmp.Width;
            int h = bmp.Height;
            Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);
            
            bool[,] visited = new bool[w, h];
            var q = new System.Collections.Generic.Queue<Point>();

            // Seed 4 outer borders
            for (int x = 0; x < w; x++) {
                q.Enqueue(new Point(x, 0)); visited[x, 0] = true;
                q.Enqueue(new Point(x, h - 1)); visited[x, h - 1] = true;
            }
            for (int y = 0; y < h; y++) {
                q.Enqueue(new Point(0, y)); visited[0, y] = true;
                q.Enqueue(new Point(w - 1, y)); visited[w - 1, y] = true;
            }

            int[] dx = {1, -1, 0, 0};
            int[] dy = {0, 0, 1, -1};

            while (q.Count > 0) {
                Point p = q.Dequeue();
                Color c = bmp.GetPixel(p.X, p.Y);
                if (c.R >= threshold && c.G >= threshold && c.B >= threshold) {
                    dst.SetPixel(p.X, p.Y, Color.FromArgb(0, 0, 0, 0));
                    for (int i = 0; i < 4; i++) {
                        int nx = p.X + dx[i];
                        int ny = p.Y + dy[i];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[nx, ny]) {
                            visited[nx, ny] = true;
                            q.Enqueue(new Point(nx, ny));
                        }
                    }
                } else {
                    dst.SetPixel(p.X, p.Y, c);
                }
            }

            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    if (!visited[x, y]) {
                        dst.SetPixel(x, y, bmp.GetPixel(x, y));
                    }
                }
            }

            dst.Save(dstPath, ImageFormat.Png);
            dst.Dispose();
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[FastTransparent]::Process('C:\Users\ASUS\.gemini\antigravity\scratch\yuhashvi-21st-birthday\assets\reference\girl-reference.jpg', 'C:\Users\ASUS\.gemini\antigravity\scratch\yuhashvi-21st-birthday\assets\characters\girl_transparent.png', 242)
Write-Host "Completed transparent PNG"
