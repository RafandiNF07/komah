/**
 * Kompresi dan potong (crop) gambar ke bentuk persegi (square) 256x256
 * dengan format JPEG dan kualitas 80%.
 * Menghasilkan base64 string untuk localStorage dan Blob berkas untuk Supabase.
 * Mencegah terjadinya error kehabisan memori localStorage (kuota 5MB).
 *
 * @param {File} file - Berkas gambar mentah asli dari galeri
 * @param {number} size - Target ukuran lebar & tinggi persegi (default: 256px)
 * @returns {Promise<{base64: string, blob: Blob}>}
 */
export function compressAndSquareImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Kalkulasi cropping agar tepat di tengah (center-crop)
        let srcX = 0;
        let srcY = 0;
        let srcSize = Math.min(img.width, img.height);

        if (img.width > img.height) {
          srcX = (img.width - img.height) / 2;
        } else {
          srcY = (img.height - img.width) / 2;
        }

        // Gambar ulang di canvas dengan ukuran terpotong persegi
        ctx.drawImage(
          img,
          srcX, srcY, srcSize, srcSize, // Source crop
          0, 0, size, size             // Destination scale
        );

        // Ekspor ke format base64 WebP kualitas 80% (sangat ringan ~10KB)
        const base64 = canvas.toDataURL('image/webp', 0.8);

        // Konversi ke Blob biner untuk diunggah ke storage Supabase
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ base64, blob });
          } else {
            reject(new Error('Gagal melakukan kompresi gambar pada canvas.'));
          }
        }, 'image/webp', 0.8);
      };
      
      img.onerror = (err) => reject(err);
    };
    
    reader.onerror = (err) => reject(err);
  });
}
