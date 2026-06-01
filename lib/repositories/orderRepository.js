import { createClient } from '@/lib/supabase/client';

/**
 * Repository untuk berinteraksi dengan tabel 'orders' di Supabase.
 * Mengisolasi kueri basis data langsung dari komponen UI.
 */
export const orderRepository = {
  
  /**
   * Mengambil daftar pesanan aktif yang berstatus 'searching' (Antrean Driver)
   */
  async fetchAvailableOrders() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles!customer_id (
          full_name,
          phone_number,
          avatar_url
        )
      `)
      .eq('status', 'searching')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Mengambil pesanan aktif milik pelanggan (Customer)
   */
  async fetchActiveOrderForCustomer(customerId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        driver:profiles!driver_id (
          full_name,
          phone_number,
          license_plate,
          vehicle_type,
          avatar_url
        )
      `)
      .eq('customer_id', customerId)
      .in('status', ['searching', 'accepted', 'on_the_way'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Mengambil pesanan aktif milik pengemudi (Driver)
   */
  async fetchActiveOrderForDriver(driverId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles!customer_id (
          full_name,
          phone_number,
          avatar_url
        )
      `)
      .eq('driver_id', driverId)
      .in('status', ['accepted', 'on_the_way'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Membuat pesanan baru (Customer)
   */
  async createOrder(orderData) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Driver mengambil alih pesanan secara transaksional (RPC)
   */
  async takeOrder(orderId) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('take_order', {
      order_uuid: orderId
    });

    if (error) throw error;
    return data; // Mengembalikan true jika berhasil, false jika didahului driver lain
  },

  /**
   * Driver melepaskan pesanan secara transaksional (RPC)
   */
  async releaseOrder(orderId) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('release_order', {
      order_uuid: orderId
    });

    if (error) throw error;
    return data;
  },

  /**
   * Memperbarui status pesanan secara umum (Contoh: Menjadi 'on_the_way' atau 'completed')
   */
  async updateOrderStatus(orderId, status) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mengambil riwayat pemesanan untuk pelanggan (Customer)
   */
  async fetchHistoryForCustomer(customerId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        driver:profiles!driver_id (
          full_name,
          phone_number,
          license_plate,
          vehicle_type
        )
      `)
      .eq('customer_id', customerId)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Mengambil riwayat pemesanan untuk mitra pengemudi (Driver)
   */
  async fetchHistoryForDriver(driverId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles!customer_id (
          full_name,
          phone_number
        )
      `)
      .eq('driver_id', driverId)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
