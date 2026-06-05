'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, formatDate, ORDER_TYPES, ORDER_STATUS } from '@/lib/constants';

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
      return 'bg-close/10 text-cancel border-close/30';
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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:profiles!customer_id(*)')
        .eq('driver_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching driver history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const timer = setTimeout(() => {
      fetchDriverHistory();
    }, 0);

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
                ? 'bg-tertiary text-on-tertiary font-bold scale-95 shadow-md' 
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
              const isActive = ['searching', 'accepted', 'on_the_way'].includes(order.status);
              
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
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <Image src={service.icon} alt={service.title} width={24} height={24} className="object-contain" />
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-[16px] font-bold text-text-primary">{service.title}</h3>
                        <p className="font-body-sm text-[13px] text-text-secondary mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Badge Status dengan Dukungan Ikon Sesuai Gambar */}
                    <span className={`px-3 py-1.5 rounded-md font-label-mono text-[11px] uppercase tracking-wider font-bold border flex items-center gap-1.5 ${getStatusStyle(order.status)}`}>
                      {isActive && <Image src="/icons/bike.png" alt="active" width={16} height={16} className="object-contain" />}
                      {order.status === 'completed' && <Image src="/icons/check.png" alt="completed" width={16} height={16} className="object-contain" />}
                      {order.status === 'cancelled' && <Image src="/icons/cancel.png" alt="cancelled" width={16} height={16} className="object-contain" />}
                      {ORDER_STATUS[order.status]?.label || order.status}
                    </span>
                  </div>

                  {/* Bagian Tengah: Informasi Rute & Informasi Harga Semuanya Sejajar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Daftar Alamat & Waktu Bertumpuk Tanpa Garis Lurus */}
                    <div className="space-y-4 flex-1">
                      {/* Titik Jemput / Awal */}
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                          <Image src="/icons/jemput1.png" alt="jemput" width={22} height={22} className="object-contain" />
                        </div>
                        <div>
                          <p className="font-label-mono text-[11px] text-text-secondary mb-0.5 font-bold">
                            {order.type === 'delivery' ? 'Lokasi Pengambilan' : 'Titik Awal'}
                          </p>
                          <p className={`font-body-sm text-[13px] leading-snug ${isCancelled ? 'text-text-secondary line-through decoration-danger/50' : 'text-text-primary'}`}>
                            {order.pickup_location}
                          </p>
                        </div>
                      </div>

                      {/* Titik Tujuan */}
                      {order.destination_location && (
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                            <Image src="/icons/tujuan.png" alt="tujuan" width={22} height={22} className="object-contain" />
                          </div>
                          <div>
                            <p className="font-label-mono text-[11px] text-text-secondary mb-0.5 font-bold">
                              {order.type === 'food' ? 'Lokasi Pengantaran' : 'Titik Tujuan'}
                            </p>
                            <p className={`font-body-sm text-[13px] leading-snug ${isCancelled ? 'text-text-secondary line-through decoration-danger/50' : 'text-text-primary'}`}>
                              {order.destination_location}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Batasan Blok Waktu Penjemputan */}
                      <div className="flex items-start gap-3 border-t border-outline-variant/15 pt-2 mt-1">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                          <Image src="/icons/time.png" alt="waktu" width={22} height={22} className="object-contain" />
                        </div>
                        <div>
                          <p className="font-label-mono text-[9px] text-tertiary mb-0.5 font-bold uppercase tracking-wider">Waktu Penjemputan</p>
                          <p className={`font-body-sm text-[13px] font-bold leading-snug ${isCancelled ? 'text-text-secondary' : 'text-text-primary'}`}>
                            {formatDate(order.pickup_time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Total Biaya di Sebelah Kanan Card */}
                    <div className="flex flex-row md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-outline-variant/30 pt-3 md:pt-0 md:pl-4 min-w-[120px]">
                      <p className="font-label-mono text-[11px] text-text-secondary">Total Biaya</p>
                      <p className={`font-headline-sm text-[18px] font-bold ${isCancelled ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                        {formatRupiah(order.total_price)}
                      </p>
                      <p className="font-label-mono text-[10px] text-outline mt-1 hidden md:block uppercase tracking-wider">{order.order_number}</p>
                    </div>
                  </div>

                  {/* ================= REAL-TIME CUSTOMER PROFILE BOX ================= */}
                  <div className="mt-5 p-3 bg-surface-container-high/40 rounded-xl border border-outline-variant/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden relative shrink-0 shadow-inner">
                      {order.customer?.avatar_url ? (
                        <Image 
                          src={order.customer.avatar_url} 
                          alt="Foto Profil Pelanggan" 
                          width={40} 
                          height={40} 
                          unoptimized
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Image 
                          src="/icons/person.png" 
                          alt="default person" 
                          width={20} 
                          height={20} 
                          className="object-contain opacity-60"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-mono text-[9px] text-text-secondary leading-none uppercase tracking-wider font-bold">Pelanggan Pengguna Layanan</p>
                      <p className="font-headline-sm text-[14px] font-bold text-text-primary mt-1.5 truncate">
                        {order.customer?.full_name || 'Nama Pelanggan'}
                      </p>
                      {isCancelled ? (
                        <p className="font-body-sm text-[11px] text-danger/80 italic mt-0.5 flex items-center gap-1">
                          🚫 Batalkan Pesanan oleh pelanggan
                        </p>
                      ) : (
                        <p className="font-body-sm text-[11px] text-text-secondary mt-0.5">
                          {order.customer?.phone_number || 'Tidak mencantumkan nomor kontak'}
                        </p>
                      )}
                    </div>
                  </div>

                </article>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-outline-variant/30 border-dashed">
              <Image src="/icons/history.png" alt="history" width={48} height={48} className="opacity-40 mb-3" />
              <p className="font-body-md text-text-secondary">Tidak ada riwayat pesanan.</p>
            </div>
          )
        ) : (
          <div className="p-8 text-center text-[14px] text-text-secondary">
            <Image src="/icons/loading.png" alt="loading" width={35} height={35} className="animate-spin object-contain mx-auto" />
            <p className="mt-2">Memuat riwayat...</p>
          </div>
        )}
      </div>

    </div>
  );
}