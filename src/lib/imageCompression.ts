/**
 * Utilitas kompresi gambar di sisi browser menggunakan HTML5 Canvas
 * Memperkecil dimensi hingga max width 720px dan mengompres ke format JPEG kualitas 0.8
 * Sangat ringan, cepat, dan hemat kuota/storage
 */

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  ratio: number; // Persentase penghematan (misal 85%)
}

export function compressImage(
  file: File,
  maxWidth = 720,
  quality = 0.8
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // Validasi file adalah gambar
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan berkas gambar.'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.width;
      let targetHeight = img.height;

      // Perkecil jika dimensi melebihi maxWidth dengan menjaga aspek rasio
      if (targetWidth > maxWidth) {
        targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
        targetWidth = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Gagal menginisialisasi context canvas HTML5.'));
        return;
      }

      // Aktifkan anti-aliasing berkualitas tinggi
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Gambar putih sebagai background untuk mengantisipasi gambar PNG transparan sebelum dikonversi ke JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Gambar foto
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Konversi ke dataURL base64
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Konversi ke Blob untuk upload ke storage Supabase
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal menghasilkan blob gambar terkompresi.'));
            return;
          }

          const originalSize = file.size;
          const compressedSize = blob.size;
          const ratio = Math.max(
            0,
            Math.round(((originalSize - compressedSize) / originalSize) * 100)
          );

          resolve({
            dataUrl,
            blob,
            width: targetWidth,
            height: targetHeight,
            originalSize,
            compressedSize,
            ratio,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memproses dan membaca file gambar.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Format ukuran byte menjadi satuan yang mudah dibaca (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
