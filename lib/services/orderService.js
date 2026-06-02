import { orderRepository } from '@/lib/repositories/orderRepository';

export const orderService = {
  /**
   * Mendelegasikan pembuatan pesanan baru ke orderRepository
   */
  async createOrder({ customerId, type, price, distance, notes, pickup, destination, targetTime, serviceDetails }) {
    const orderData = {
      customer_id: customerId,
      type,
      total_price: price,
      distance_estimate: distance,
      notes: notes || null,
      pickup_location: pickup.address,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      destination_location: destination?.address || null,
      destination_lat: destination?.lat || null,
      destination_lng: destination?.lng || null,
      pickup_time: targetTime.toISOString(),
      service_details: serviceDetails,
    };

    return await orderRepository.createOrder(orderData);
  },

  /**
   * Mengambil pesanan aktif berstatus 'searching' untuk antrean driver
   */
  async getAvailableOrders() {
    return await orderRepository.fetchAvailableOrders();
  },

  /**
   * Mengambil pesanan aktif milik pelanggan (Customer)
   */
  async getActiveOrderForCustomer(customerId) {
    return await orderRepository.fetchActiveOrderForCustomer(customerId);
  },

  /**
   * Mengambil pesanan aktif milik pengemudi (Driver)
   */
  async getActiveOrderForDriver(driverId) {
    return await orderRepository.fetchActiveOrderForDriver(driverId);
  },

  /**
   * Driver mengambil alih pesanan secara transaksional
   */
  async takeOrder(orderId) {
    return await orderRepository.takeOrder(orderId);
  },

  /**
   * Driver melepaskan pesanan secara transaksional
   */
  async releaseOrder(orderId) {
    return await orderRepository.releaseOrder(orderId);
  },

  /**
   * Memperbarui status pesanan (contoh: 'on_the_way', 'completed')
   */
  async updateOrderStatus(orderId, status) {
    return await orderRepository.updateOrderStatus(orderId, status);
  },

  /**
   * Mengambil riwayat pesanan pelanggan (Customer)
   */
  async getHistoryForCustomer(customerId) {
    return await orderRepository.fetchHistoryForCustomer(customerId);
  },

  /**
   * Mengambil riwayat pesanan mitra pengemudi (Driver)
   */
  async getHistoryForDriver(driverId) {
    return await orderRepository.fetchHistoryForDriver(driverId);
  },

  /**
   * Mengambil dan mengagregasi data pendapatan driver berdasarkan filter waktu
   */
  async fetchEarningsData(driverId, timeFilter) {
    return await orderRepository.fetchEarningsData(driverId, timeFilter);
  },

  /**
   * Mengambil data dashboard driver (pendapatan hari ini, orderan hari ini/minggu ini, pesanan aktif)
   */
  async getDriverDashboardData(driverId) {
    return await orderRepository.fetchDriverDashboardData(driverId);
  },

  /**
   * Mengambil semua pesanan untuk riwayat pelanggan
   */
  async getAllOrdersForCustomer(customerId) {
    return await orderRepository.fetchAllOrdersForCustomer(customerId);
  },

  /**
   * Mengambil semua pesanan untuk riwayat driver
   */
  async getAllOrdersForDriver(driverId) {
    return await orderRepository.fetchAllOrdersForDriver(driverId);
  },

  /**
   * Batalkan pesanan pelanggan (Searching)
   */
  async cancelOrder(orderId) {
    return await orderRepository.cancelOrder(orderId);
  }
};
