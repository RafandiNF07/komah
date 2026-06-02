'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, formatDate, ORDER_TYPES, ORDER_STATUS } from '@/lib/constants';
import { orderService } from '@/lib/services/orderService';

const getServiceInfo = (type) => {
  switch (type) {
    case 'bike':
      return { icon: '/icons/bike.png', title: 'Antar-Jemput' };
    case 'food':
      return { icon: '/icons/fast_food.png', title: 'KOMAH Food' };
    case 'delivery':
      return { icon: '/icons/delivery2.png', title: 'Delivery Barang' };
    case 'helper':
      return { icon: '/icons/helper.png', title: 'Jasa Helper' };
    default:
      return { icon: '/icons/notes.png', title: 'Layanan KOMAH' };
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success border-success/30';
    case 'searching':
    case 'accepted':
    case 'on_the_way':
      return 'bg-secondary/10 text-secondary border-secondary/30 animate-pulse';
    case 'cancelled':
      return 'bg-danger/10 text-danger border-danger/30';
    default:
      return 'bg-surface-variant text-text-secondary border-outline-variant';
  }
};

export default function DriverHistoryPage() {
  const { user } = useProfile();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState('Semua');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDriverHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await orderService.getAllOrdersForDriver(userId);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching driver history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return; // Guard against null user on mount

    const timer = setTimeout(() => {
      fetchDriverHistory();
    }, 0);

    // Setup realtime subscription
    const supabase = createClient();
    const subscription = supabase
      .channel('driver_history_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `driver_id=eq.${userId}` },
        () => {
          fetchDriverHistory();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(subscription);
    };
  }, [userId, fetchDriverHistory]);

  // Logika Filter Data
  const filteredHistory = orders.filter(item => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Aktif') {
      return ['accepted', 'on_the_way'].includes(item.status);
    }
    if (activeTab === 'Selesai') return item.status === 'completed';
    if (activeTab === 'Dibatalkan') return item.status === 'cancelled';
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8">
      
      {/* ================= HEADER ================= */}
      <header className="mb-6">
        <h1 className="font-headline-md text-[24px] md:text-[28px] text-text-primary mb-2 font-bold">Riwayat Pesanan</h1>
        <p className="font-body-sm text-[14px] text-text-secondary">Pantau aktivitas perjalanan dan pesanan Anda sebelumnya.</p>
      </header>

      {/* ================= FILTER TABS ================= */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-6 hide-scrollbar border-b border-outline-variant/30">
        {['Semua', 'Aktif', 'Selesai', 'Dibatalkan'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-label-mono text-[13px] whitespace-nowrap transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-secondary-container text-on-secondary-container font-bold scale-95 shadow-md' 
                : 'border border-outline-variant/50 text-text-secondary hover:border-tertiary hover:text-tertiary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= HISTORY LIST ================= */}
      <div className="space-y-4">
        {!loading ? (
          filteredHistory.length > 0 ? (
            filteredHistory.map((order) => {
              const service = getServiceInfo(order.type);
              const isCancelled = order.status === 'cancelled';
              
              return (
                <article 
                  key={order.id} 
                  className={`bg-surface-container rounded-2xl p-5 border border-outline-variant/30 shadow-lg transition-all duration-300 group cursor-pointer ${
                    isCancelled 
                      ? 'opacity-70 grayscale-[30%] hover:grayscale-0 hover:opacity-100' 
                      : 'hover:shadow-tertiary/10 hover:border-tertiary/40 transform hover:-translate-y-1'
                  }`}
                >
                  {/* Bagian Atas Card (Info & Status) */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <Image 
                          src={service.icon} 
                          alt={service.title} 
                          width={24} 
                          height={24} 
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-[16px] font-bold text-text-primary">{service.title}</h3>
                        <p className="font-body-sm text-[13px] text-text-secondary mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-md font-label-mono text-[11px] uppercase tracking-wider font-bold border ${getStatusStyle(order.status)}`}>
                      {ORDER_STATUS[order.status]?.label || order.status}
                    </span>
                  </div>

                  {/* Garis Rute (Timeline) */}
                  <div className="flex flex-col gap-4 relative pl-1 mb-5">
                    <div className={`absolute left-[15px] top-[24px] bottom-[24px] w-[2px] ${isCancelled ? 'bg-outline-variant/50' : 'bg-outline-variant/40'}`}></div>

                    {/* Titik Jemput */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <Image 
                          src="/icons/jemput1.png" 
                          alt="jemput" 
                          width={22} 
                          height={22} 
                          className="object-contain"
                        />
                      </div>
                      <p className={`font-body-md text-[14px] ${isCancelled ? 'text-text-secondary line-through decoration-danger/50' : 'text-text-primary'}`}>
                        {order.pickup_location}
                      </p>
                    </div>

                    {/* Titik Tujuan */}
                    {order.destination_location && (
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <Image 
                            src="/icons/tujuan.png" 
                            alt="tujuan" 
                            width={22} 
                            height={22} 
                            className="object-contain"
                          />
                        </div>
                        <p className={`font-body-md text-[14px] ${isCancelled ? 'text-text-secondary line-through decoration-danger/50' : 'text-text-primary'}`}>
                          {order.destination_location}
                        </p>
                      </div>
                    )}

                    {/* Waktu Penjemputan */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <Image 
                          src="/icons/time.png" 
                          alt="waktu" 
                          width={22} 
                          height={22} 
                          className="object-contain"
                        />
                      </div>
                      <p className={`font-body-md text-[14px] font-bold ${isCancelled ? 'text-text-secondary' : 'text-text-primary'}`}>
                        Waktu Jemput: {formatDate(order.pickup_time)}
                      </p>
                    </div>
                  </div>

                  {/* Bagian Bawah (Customer & Harga) */}
                  <div className="flex justify-between items-end border-t border-outline-variant/30 pt-4">
                    {/* Info Bawah Kiri */}
                    {isCancelled ? (
                      <div className="flex items-center gap-2 text-text-secondary italic">
                         <Image 
                           src="/icons/cancel.png" 
                           alt="info" 
                           width={18} 
                           height={18} 
                           className="object-contain opacity-60" 
                         />
                         <span className="font-body-sm text-[13px]">Dibatalkan oleh pelanggan</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden">
                          <Image 
                            src="/icons/person.png" 
                            alt="person" 
                            width={22} 
                            height={22} 
                            className="object-contain"
                          />
                        </div>
                        <span className="font-headline-sm text-[14px] font-bold text-text-primary">
                          {order.customer?.full_name || 'Pelanggan'}
                        </span>
                      </div>
                    )}

                    {/* Harga */}
                    <span className={`font-headline-sm text-[18px] font-bold ${isCancelled ? 'text-text-secondary line-through' : 'text-tertiary'}`}>
                      {formatRupiah(order.total_price)}
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-outline-variant/30 border-dashed">
               <Image 
                 src="/icons/history.png" 
                 alt="history" 
                 width={48} 
                 height={48} 
                 className="opacity-40 mb-3" 
               />
               <p className="font-body-md text-text-secondary">Tidak ada riwayat pesanan.</p>
            </div>
          )
        ) : (
          <div className="p-8 text-center text-[14px] text-text-secondary">
            <Image 
              src="/icons/loading.png" 
              alt="loading" 
              width={35} 
              height={35} 
              className="animate-spin object-contain mx-auto" 
            />
            <p className="mt-2">Memuat riwayat...</p>
          </div>
        )}
      </div>

    </div>
  );
}