import { PRICING } from './constants';

/**
 * Menghitung harga berdasarkan jarak dan tipe order.
 * Formula: MAX(BASE_PRICE, ceil(distance) * PRICE_PER_KM)
 *
 * @param {number} distanceKm - Jarak dalam kilometer
 * @param {string} orderType - Tipe order: 'bike', 'delivery', 'food', 'helper'
 * @returns {number} Harga dalam Rupiah
 */
export function calculatePrice(distanceKm, orderType) {
  // Helper: harga minimum Rp 5.000, sisanya negosiasi via WA
  if (orderType === 'helper') {
    return PRICING.HELPER_MIN_PRICE;
  }

  // Untuk bike, delivery, food: hitung berdasarkan jarak
  const calculatedPrice = Math.ceil(distanceKm) * PRICING.PRICE_PER_KM;
  
  // Minimal BASE_PRICE
  return Math.max(PRICING.BASE_PRICE, calculatedPrice);
}
