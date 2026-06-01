import { z } from 'zod';
import { orderRepository } from '../repositories/orderRepository';

// 1. Skema Validasi Zod untuk data pesanan baru
export const orderInputSchema = z.object({
  customer_id: z.string().uuid("ID Pelanggan tidak valid"),
  type: z.enum(['bike', 'delivery', 'helper', 'food'], {
    errorMap: () => ({ message: "Jenis layanan tidak valid" })
  }),
  pickup_location: z.string().min(3, "Lokasi jemput minimal 3 karakter"),
  pickup_lat: z.number({ required_error: "Koordinat jemput wajib ada" }),
  pickup_lng: z.number({ required_error: "Koordinat jemput wajib ada" }),
  
  // Tujuan boleh opsional khusus untuk tipe 'helper' (karena sistem nego lokasi luar)
  destination_location: z.string().optional().nullable(),
  destination_lat: z.number().optional().nullable(),
  destination_lng: z.number().optional().nullable(),
  
  total_price: z.number().min(5000, "Tarif pemesanan minimal adalah Rp 5.000"),
  distance_estimate: z.number().nonnegative("Estimasi jarak tidak boleh bernilai negatif").optional().nullable(),
  notes: z.string().optional().nullable(),
  pickup_time: z.string().datetime({ message: "Format waktu jemput wajib berupa ISO Datetime" }),
  service_details: z.record(z.any()).optional().default({})
}).refine((data) => {
  // Jika tipe pesanan BUKAN 'helper', lokasi tujuan wajib diisi
  if (data.type !== 'helper') {
    return !!data.destination_location && data.destination_lat !== null && data.destination_lng !== null;
  }
  return true;
}, {
  message: "Lokasi tujuan wajib ditentukan untuk layanan ini",
  path: ["destination_location"]
});

/**
 * Service Layer untuk bisnis logika terkait pengelolaan orderan.
 * Menghubungkan validasi data Zod dan data access Repository.
 */
export const orderService = {
  
  /**
   * Memvalidasi data input pesanan sebelum disimpan ke database Supabase
   */
  async createValidatedOrder(rawOrderData) {
    // Validasi input data secara deklaratif dengan Zod
    const validatedData = orderInputSchema.parse(rawOrderData);
    
    // Delegasikan penyimpanan ke database melalui Repository
    return await orderRepository.createOrder(validatedData);
  },

  /**
   * Driver mengambil orderan secara aman dengan pengecekan kelayakan dasar
   */
  async takeOrderSecurely(orderId, currentUserId) {
    if (!orderId) throw new Error("ID Pesanan wajib disertakan.");
    if (!currentUserId) throw new Error("ID Pengemudi wajib disertakan.");

    return await orderRepository.takeOrder(orderId);
  },

  /**
   * Driver melepas pesanan secara aman
   */
  async releaseOrderSecurely(orderId, currentUserId) {
    if (!orderId) throw new Error("ID Pesanan wajib disertakan.");
    if (!currentUserId) throw new Error("ID Pengemudi wajib disertakan.");

    return await orderRepository.releaseOrder(orderId);
  },

  /**
   * Memperbarui status pesanan dengan memvalidasi transisi alur status (State Machine)
   */
  async updateOrderStatusSecurely(orderId, newStatus) {
    const allowedStatuses = ['searching', 'accepted', 'on_the_way', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Status "${newStatus}" tidak valid.`);
    }

    return await orderRepository.updateOrderStatus(orderId, newStatus);
  }
};
