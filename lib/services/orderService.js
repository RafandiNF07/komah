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
  }
};
