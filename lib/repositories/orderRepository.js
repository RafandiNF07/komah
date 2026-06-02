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
   * Batalkan pesanan milik pelanggan secara aman (hanya jika masih 'searching')
   */
  async cancelOrder(orderId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('status', 'searching')
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mengambil semua pesanan milik pelanggan (Customer) untuk riwayat/tab filter
   */
  async fetchAllOrdersForCustomer(customerId) {
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Mengambil semua pesanan milik mitra pengemudi (Driver) untuk riwayat/tab filter
   */
  async fetchAllOrdersForDriver(driverId) {
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
      .order('created_at', { ascending: false });

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
  },

  /**
   * Mengambil data dashboard driver (pendapatan hari ini, orderan selesai hari/minggu ini, dan pesanan aktif)
   */
  async fetchDriverDashboardData(driverId) {
    const supabase = createClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // 1. Ambil pesanan selesai hari ini
    const { data: todayOrders, error: todayErr } = await supabase
      .from('orders')
      .select('total_price')
      .eq('driver_id', driverId)
      .eq('status', 'completed')
      .gte('created_at', todayStart.toISOString());

    if (todayErr) throw todayErr;

    const todayEarnings = todayOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const todayTrips = todayOrders.length;

    // 2. Ambil jumlah pesanan selesai minggu ini
    const { count: weekTrips, error: weekErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('driver_id', driverId)
      .eq('status', 'completed')
      .gte('created_at', weekStart.toISOString());

    if (weekErr) throw weekErr;

    // 3. Ambil pesanan aktif driver
    const activeOrder = await this.fetchActiveOrderForDriver(driverId);

    return {
      stats: {
        todayEarnings,
        todayTrips,
        weekTrips: weekTrips || 0
      },
      activeOrder
    };
  },

  /**
   * Mengambil dan mengagregasi data pendapatan pengemudi berdasarkan filter waktu
   */
  async fetchEarningsData(driverId, timeFilter) {
    const supabase = createClient();
    const filterDate = new Date();
    
    if (timeFilter === 'Hari Ini') {
      filterDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'Minggu Ini') {
      filterDate.setDate(filterDate.getDate() - 7);
    } else if (timeFilter === 'Bulan Ini') {
      filterDate.setDate(filterDate.getDate() - 30);
    }

    // Ambil pesanan selesai
    const { data: completedData, error: completedErr } = await supabase
      .from('orders')
      .select('*')
      .eq('driver_id', driverId)
      .eq('status', 'completed')
      .gte('created_at', filterDate.toISOString())
      .order('created_at', { ascending: false });

    if (completedErr) throw completedErr;

    // Ambil semua pesanan ter-assign untuk tingkat keberhasilan
    const { data: assignedData, error: assignedErr } = await supabase
      .from('orders')
      .select('status')
      .eq('driver_id', driverId)
      .gte('created_at', filterDate.toISOString());

    if (assignedErr) throw assignedErr;

    const totalCount = assignedData ? assignedData.length : 0;
    const completedCount = completedData ? completedData.length : 0;

    return {
      completedOrders: completedData || [],
      completionStats: {
        completed: completedCount,
        total: totalCount
      }
    };
  }
};
