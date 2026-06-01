import { AppError } from './AppError';

/**
 * Menerjemahkan error mentah database, HTTP, atau jaringan menjadi objek AppError
 * dengan pesan bahasa Indonesia yang ramah pengguna.
 * 
 * @param {any} rawError - Objek error mentah yang ditangkap
 * @returns {AppError} Objek AppError terstandarisasi
 */
export function translateError(rawError) {
  console.error("DEBUG [Raw Error Caught]:", rawError);

  // 1. Jika sudah merupakan instansi dari AppError kita, kembalikan langsung
  if (rawError instanceof AppError) {
    return rawError;
  }

  // 2. Terjemahkan error spesifik database PostgreSQL / Supabase
  const sqlCode = rawError?.code;
  if (sqlCode) {
    switch (sqlCode) {
      case '23505': // Unique key violation
        return new AppError('Nomor telepon atau email sudah digunakan oleh akun lain.', 'DUPLICATE_ENTRY', 'warning');
      case '23503': // Foreign key violation
        return new AppError('Koneksi data tidak valid. Silakan muat ulang halaman.', 'FOREIGN_KEY_VIOLATION', 'error');
      case '42501': // Row-Level Security (RLS) check failed
        return new AppError('Anda tidak memiliki izin untuk mengakses atau mengubah data ini.', 'UNAUTHORIZED', 'warning');
      case 'PGRST116': // Single row search returned zero results
        return new AppError('Data yang Anda cari tidak dapat ditemukan.', 'NOT_FOUND', 'info');
      default:
        // Jika ada kode SQL lain tapi belum dipetakan secara khusus
        return new AppError(`Gangguan data internal (Kode: ${sqlCode}). Silakan hubungi admin.`, 'DATABASE_ERROR', 'error');
    }
  }

  // 3. Terjemahkan kode HTTP status dari respon server
  const status = rawError?.status || rawError?.statusCode;
  if (status) {
    switch (status) {
      case 401:
        return new AppError('Sesi login Anda telah kedaluwarsa. Silakan masuk kembali.', 'UNAUTHENTICATED', 'warning');
      case 403:
        return new AppError('Akses ditolak. Anda tidak memiliki wewenang untuk aksi ini.', 'FORBIDDEN', 'warning');
      case 404:
        return new AppError('Layanan atau halaman yang dicari tidak ditemukan.', 'ROUTE_NOT_FOUND', 'warning');
      case 500:
      case 502:
      case 503:
        return new AppError('Server kami sedang mengalami gangguan. Silakan coba sesaat lagi.', 'SERVER_ERROR', 'error');
    }
  }

  // 4. Terjemahkan kesalahan jaringan / offline
  const message = rawError?.message || '';
  if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network') || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return new AppError('Koneksi internet Anda terputus atau tidak stabil. Periksa jaringan Anda.', 'NETWORK_ERROR', 'warning');
  }

  // 5. Fallback terakhir jika tipe error tidak terdeteksi
  return new AppError(message || 'Terjadi kesalahan sistem yang tidak terduga.', 'UNKNOWN_ERROR', 'error');
}
