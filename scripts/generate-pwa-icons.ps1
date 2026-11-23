# Script Generator PWA Adaptive Maskable Icon
# Indah Mom & Baby Spa Comal
# Menghasilkan icon-192.png dan icon-512.png dengan kanvas penuh krem #FDFBF7 dan emblem safe-zone 72%

Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public class PwaIconBuilder {
    public static void GenerateIcons(string logoPath, string out192Path, string out512Path) {
        using (Bitmap src = new Bitmap(logoPath)) {
            int w = src.Width;
            int h = src.Height;

            // 1. Flood fill untuk mendeteksi seluruh area background luar yang berwarna putih/dekat putih
            bool[,] visited = new bool[w, h];
            Queue<Point> q = new Queue<Point>();

            for (int x = 0; x < w; x++) {
                if (IsBackgroundWhite(src.GetPixel(x, 0))) { visited[x, 0] = true; q.Enqueue(new Point(x, 0)); }
                if (IsBackgroundWhite(src.GetPixel(x, h - 1))) { visited[x, h - 1] = true; q.Enqueue(new Point(x, h - 1)); }
            }
            for (int y = 0; y < h; y++) {
                if (!visited[0, y] && IsBackgroundWhite(src.GetPixel(0, y))) { visited[0, y] = true; q.Enqueue(new Point(0, y)); }
                if (!visited[w - 1, y] && IsBackgroundWhite(src.GetPixel(w - 1, y))) { visited[w - 1, y] = true; q.Enqueue(new Point(w - 1, y)); }
            }

            int[] dx = { 1, -1, 0, 0 };
            int[] dy = { 0, 0, 1, -1 };

            while (q.Count > 0) {
                Point p = q.Dequeue();
                for (int i = 0; i < 4; i++) {
                    int nx = p.X + dx[i];
                    int ny = p.Y + dy[i];
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[nx, ny]) {
                        Color c = src.GetPixel(nx, ny);
                        if (IsBackgroundWhite(c)) {
                            visited[nx, ny] = true;
                            q.Enqueue(new Point(nx, ny));
                        }
                    }
                }
            }

            // 2. Tentukan bounding box presisi emblem logo
            int minX = w, maxX = 0, minY = h, maxY = 0;
            for (int x = 0; x < w; x++) {
                for (int y = 0; y < h; y++) {
                    if (!visited[x, y]) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            int emblemW = maxX - minX + 1;
            int emblemH = maxY - minY + 1;

            // 3. Ekstrak emblem bersih transparan (tanpa background putih bawaan logo)
            using (Bitmap emblem = new Bitmap(emblemW, emblemH, PixelFormat.Format32bppArgb)) {
                for (int ex = 0; ex < emblemW; ex++) {
                    for (int ey = 0; ey < emblemH; ey++) {
                        int sx = minX + ex;
                        int sy = minY + ey;
                        if (visited[sx, sy]) {
                            emblem.SetPixel(ex, ey, Color.FromArgb(0, 0, 0, 0));
                        } else {
                            Color c = src.GetPixel(sx, sy);
                            emblem.SetPixel(ex, ey, c);
                        }
                    }
                }

                // 4. Render ke kanvas persegi penuh #FDFBF7 dengan safe-zone 72%
                RenderCanvas(emblem, out512Path, 512, 0.72f);
                RenderCanvas(emblem, out192Path, 192, 0.72f);
            }
        }
    }

    private static bool IsBackgroundWhite(Color c) {
        return c.R >= 245 && c.G >= 245 && c.B >= 245;
    }

    private static void RenderCanvas(Bitmap emblem, string outPath, int size, float safeRatio) {
        Color bgCream = Color.FromArgb(255, 253, 251, 247); // #FDFBF7

        using (Bitmap target = new Bitmap(size, size, PixelFormat.Format32bppArgb)) {
            using (Graphics g = Graphics.FromImage(target)) {
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.CompositingQuality = CompositingQuality.HighQuality;

                // Isi kanvas persegi penuh (opaque, tanpa transparansi sampai keempat sudut)
                using (SolidBrush brush = new SolidBrush(bgCream)) {
                    g.FillRectangle(brush, 0, 0, size, size);
                }

                // Hitung skala safe zone 72%
                float maxAllowed = size * safeRatio;
                float scale = Math.Min(maxAllowed / emblem.Width, maxAllowed / emblem.Height);
                float drawW = emblem.Width * scale;
                float drawH = emblem.Height * scale;
                float drawX = (size - drawW) / 2f;
                float drawY = (size - drawH) / 2f;

                g.DrawImage(emblem, new RectangleF(drawX, drawY, drawW, drawH));
            }

            target.Save(outPath, ImageFormat.Png);
        }
    }
}
"@ -ReferencedAssemblies "System.Drawing"

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $PSScriptRoot
$logo = Join-Path $projectRoot "public\logo.png"
$out192 = Join-Path $projectRoot "public\icon-192.png"
$out512 = Join-Path $projectRoot "public\icon-512.png"

[PwaIconBuilder]::GenerateIcons($logo, $out192, $out512)
Write-Output "Berhasil men-generate: $out192 dan $out512"
