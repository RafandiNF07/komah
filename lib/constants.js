/**
 * Konstanta aplikasi KOMAH
 * Satu sumber kebenaran untuk tarif, koordinat, dan konfigurasi.
 */

// =============================================
// TARIF
// =============================================
export const PRICING = {
  BASE_PRICE: 5000,       // Rp 5.000 — harga minimum semua layanan
  PRICE_PER_KM: 2000,     // Rp 2.000 per kilometer
  HELPER_MIN_PRICE: 5000, // Rp 5.000 — harga minimum untuk Helper (nego via WA)
};

// =============================================
// KOORDINAT DEFAULT (Kampus UIN SUSKA Riau)
// =============================================
export const MAP_CONFIG = {
  DEFAULT_CENTER: [0.4634, 101.3505],
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

// =============================================
// OSRM API (Public Demo Server)
// =============================================
export const OSRM_BASE_URL = 'https://router.project-osrm.org';

// =============================================
// ORDER TYPES & LABELS
// =============================================
export const ORDER_TYPES = {
  bike: { label: 'Antar/Jemput', icon: 'bike' },
  delivery: { label: 'Delivery', icon: 'delivery' },
  food: { label: 'KOMAH Food', icon: 'food' },
  helper: { label: 'Helper', icon: 'helper' },
};

// =============================================
// ORDER STATUS & LABELS
// =============================================
export const ORDER_STATUS = {
  searching: { label: 'Mencari Driver', color: 'text-orange' },
  accepted: { label: 'Driver Ditemukan', color: 'text-purple' },
  on_the_way: { label: 'Dalam Perjalanan', color: 'text-on-secondary-container' },
  completed: { label: 'Selesai', color: 'text-success' },
  cancelled: { label: 'Dibatalkan', color: 'text-cancel' },
};

export function formatWhatsAppNumber(phone) {
  if (!phone) return '';
  // Ubah ke string dan hilangkan semua karakter non-digit
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // Jika diawali dengan '0', ganti dengan '62' (kode negara Indonesia)
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  // Jika diawali dengan '8', tambahkan '62' di depannya
  else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function buildWhatsAppUrl(phoneNumber, orderNumber) {
  const formattedPhone = formatWhatsAppNumber(phoneNumber);
  const message = `Halo, saya terkait pesanan KOMAH dengan nomor ${orderNumber}. `;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

// =============================================
// FORMAT HELPERS
// =============================================
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
