'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/hooks/useProfile';
import { formatRupiah, formatDate, ORDER_TYPES } from '@/lib/constants';

// --- LOGIKA PINTAR PENENTU TAMPILAN ---
const getIconByType = (type) => {
  if (type === 'bike') return '/icons/bike.png';
  if (type === 'food') return '/icons/fast_food.png';
  if (type === 'delivery') return '/icons/delivery2.png';
  if (type === 'helper') return '/icons/helper.png';
  return '/icons/notes.png'; 
};

const getBadgeStyleByType = (type) => {
  if (type === 'bike') return 'bg-secondary-container/20 text-secondary border-secondary-container/50';
  if (type === 'food') return 'bg-tertiary/10 text-tertiary border-tertiary/30';
  if (type === 'delivery') return 'bg-purple/10 text-purple border-purple/30';
  if (type === 'helper') return 'bg-success/10 text-success border-success/30';
  return 'bg-surface-variant text-text-secondary border-outline-variant'; 
};

export default function DriverOrdersPage() {
  const router = useRouter();
  const { user } = useProfile();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takingOrderId, setTakingOrderId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Sembunyikan feedback secara otomatis setelah 3 detik
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchAvailableOrders = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:profiles!customer_id(*)')
        .eq('status', 'searching')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching available orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableOrders();

    // Setup realtime subscription
    const supabase = createClient();
    const subscription = supabase
      .channel('available_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchAvailableOrders();
        }
      )
      .subscribe();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(subscription);
    };
  }, [fetchAvailableOrders]);

  const handleTakeOrder = async (orderId) => {
    if (!user) {
      setFeedback({ type: 'error', message: 'Silakan login terlebih dahulu.' });
      return;
    }

    setTakingOrderId(orderId);
    try {
      const supabase = createClient();

      // Cek apakah driver saat ini sudah memiliki pesanan aktif (accepted atau on_the_way)
      const { data: activeOrder, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('driver_id', user.id)
        .in('status', ['accepted', 'on_the_way'])
        .maybeSingle();

      if (checkError) throw checkError;

      if (activeOrder) {
        setFeedback({ 
          type: 'error', 
          message: 'Anda masih memiliki pesanan aktif yang belum selesai. Silakan selesaikan pesanan Anda terlebih dahulu!' 
        });
        setTakingOrderId(null);
        return;
      }

      // RPC call to take order (anti-race condition)
      const { data: success, error } = await supabase.rpc('take_order', {
        order_uuid: orderId,
      });

      if (error) throw error;

      if (success) {
        router.push('/driver?success=true');
      } else {
        setFeedback({ 
          type: 'error', 
          message: 'Gagal mengambil pesanan! Pesanan ini mungkin sudah diambil oleh driver lain.' 
        });
        fetchAvailableOrders();
      }
    } catch (err) {
      console.error('Error taking order:', err);
      setFeedback({ type: 'error', message: err.message || 'Gagal mengambil pesanan.' });
    } finally {
      setTakingOrderId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8">
      
      {/* ================= HEADER ================= */}
      <div className="mb-6 border-b border-outline-variant/30 pb-4">
        <h1 className="font-headline-md text-[24px] md:text-[28px] font-bold text-text-primary">
          Orderan Tersedia
        </h1>
        <p className="font-body-md text-[14px] text-text-secondary mt-1">
          Cari penumpang atau pengantaran di sekitar Anda
        </p>
      </div>

      {/* ================= GRID DAFTAR ORDERAN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        
        {!loading && orders.length > 0 ? (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 shadow-lg flex flex-col gap-4 hover:shadow-tertiary/10 hover:border-tertiary/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Bagian Atas Card (Badge & Jarak) */}
              <div className="flex justify-between items-start">
                
                {/* Badge Tipe Pesanan */}
                <span className={`px-3 py-1.5 rounded-md font-label-mono text-[12px] font-bold flex items-center gap-2 border ${getBadgeStyleByType(order.type)}`}>
                  <Image 
                    src={getIconByType(order.type)} 
                    alt={order.type} 
                    width={16} 
                    height={16} 
                    className="object-contain"
                  />
                  {ORDER_TYPES[order.type]?.label || order.type}
                </span>
                
                <span className="font-label-mono text-[13px] font-bold text-text-secondary bg-surface-container-high px-2 py-1 rounded">
                  {order.distance_estimate ? `${order.distance_estimate} km` : '-'}
                </span>
              </div>

              {/* Waktu Penjemputan */}
              <div className="bg-tertiary/10 border border-tertiary/20 rounded-xl px-3 py-2 flex items-center gap-2.5">
                <Image 
                  src="/icons/time.png" 
                  alt="waktu" 
                  width={18} 
                  height={18} 
                  className="object-contain"
                />
                <div>
                  <p className="font-label-mono text-[9px] text-tertiary leading-none uppercase font-bold tracking-wider">Waktu Penjemputan</p>
                  <p className="font-body-sm text-[12px] font-bold text-text-primary mt-1">
                    {formatDate(order.pickup_time)}
                  </p>
                </div>
              </div>

              {/* Garis Rute (Timeline) */}
              <div className="flex flex-col gap-3 mt-2 relative pl-1">
                <div className="absolute left-[13px] top-[24px] bottom-[24px] w-[2px] bg-outline-variant/40"></div>

                {/* Titik Awal */}
                <div className="flex items-start gap-4 relative z-10">
                  <Image 
                    src="/icons/jemput1.png" 
                    alt="jemput" 
                    width={20} 
                    height={20} 
                    className="object-contain mt-0.5 bg-surface-container"
                  />
                  <div>
                    <p className="font-body-sm text-[12px] text-text-secondary">
                      {order.type === 'delivery' ? 'Lokasi Pengambilan' : 'Titik Jemput'}
                    </p>
                    <p className="font-body-md text-[14px] font-medium text-text-primary">
                      {order.pickup_location}
                    </p>
                  </div>
                </div>

                {/* Titik Akhir (jika ada) */}
                {order.destination_location && (
                  <div className="flex items-start gap-4 relative z-10">
                    <Image 
                      src="/icons/tujuan.png" 
                      alt="tujuan" 
                      width={20} 
                      height={20} 
                      className="object-contain mt-0.5 bg-surface-container"
                    />
                    <div>
                      <p className="font-body-sm text-[12px] text-text-secondary">
                        {order.type === 'food' ? 'Lokasi Pengantaran' : 'Titik Tujuan'}
                      </p>
                      <p className="font-body-md text-[14px] font-medium text-text-primary">
                        {order.destination_location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* --- CATATAN DARI PEMESAN --- */}
              {order.notes && (
                <div className="bg-surface-container-high rounded-xl p-3 border border-tertiary/20 flex gap-3 items-start mt-1">
                  <Image 
                    src="/icons/notes1.png" 
                    alt="notes" 
                    width={20} 
                    height={20} 
                    className="object-contain mt-0.5 bg-surface-container"
                  />
                  <div>
                    <p className="font-label-mono text-[11px] text-text-secondary mb-0.5">Catatan/Detail</p>
                    <p className="font-body-sm text-[12px] text-text-primary italic whitespace-pre-line">
                      &quot;{order.notes}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Harga & Tombol Ambil */}
              <div className="mt-auto flex flex-col gap-4 border-t border-outline-variant/30 pt-4">
                <div>
                  <p className="font-body-sm text-[12px] text-text-secondary mb-0.5">
                    {order.type === 'helper' ? 'Tarif Minimum (Nego)' : 'Estimasi Tarif'}
                  </p>
                  <p className="font-headline-sm text-[20px] font-bold text-tertiary">
                    {formatRupiah(order.total_price)}
                  </p>
                </div>
                <button 
                  disabled={takingOrderId !== null}
                  onClick={() => handleTakeOrder(order.id)}
                  className={`w-full text-on-secondary-container font-label-mono text-[14px] font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    takingOrderId === order.id
                      ? 'bg-outline-variant/50 cursor-not-allowed text-text-secondary'
                      : 'bg-secondary-container hover:bg-tertiary hover:text-on-tertiary hover:shadow-tertiary/30'
                  }`}
                >
                  {takingOrderId === order.id ? (
                    <>
                      <Image 
                        src="/icons/loading.png" 
                        alt="loading" 
                        width={18} 
                        height={18} 
                        className="animate-spin object-contain" 
                      />
                      Mengambil...
                    </>
                  ) : (
                    'Ambil Pesanan'
                  )}
                </button>
              </div>
            </div>
          ))
        ) : !loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-text-secondary bg-surface-container border border-outline-variant/30 rounded-2xl border-dashed">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-4 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary/20"></span>
              <Image 
                src="/icons/gps.png" 
                alt="radar" 
                width={40} 
                height={40} 
                className="animate-pulse object-contain" 
              />
            </div>
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-1">Mencari Orderan...</h3>
            <p className="font-body-sm text-[14px]">Menunggu pelanggan di sekitar Anda.</p>
          </div>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-text-secondary">
            <Image 
              src="/icons/loading.png" 
              alt="loading" 
              width={40} 
              height={40} 
              className="animate-spin object-contain" 
            />
            <p className="mt-2 text-[14px]">Memuat orderan tersedia...</p>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-[500] px-4 py-3 rounded-xl shadow-lg text-[13px] font-label-mono transition-all duration-300 ${
          feedback.type === 'success' ? 'bg-success/90 text-on-tertiary' : 'bg-cancel/90 text-on-tertiary'
        }`}>
          {feedback.message}
        </div>
      )}

    </div>
  );
}