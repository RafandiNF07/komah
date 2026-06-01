'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, ORDER_TYPES, buildWhatsAppUrl } from '@/lib/constants';

export default function DriverDashboardPage() {
  const { profile, user } = useProfile();
  
  // --- STATE UNTUK WAKTU REAL-TIME ---
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- STATS & ACTIVE ORDER STATES ---
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayTrips: 0,
    weekTrips: 0,
  });
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    const intervalTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Fetch stats and active order
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const supabase = createClient();
        
        // 1. Fetch Today's completed orders
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: todayOrders, error: todayErr } = await supabase
          .from('orders')
          .select('total_price')
          .eq('driver_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', todayStart.toISOString());

        if (todayErr) throw todayErr;

        const todayEarnings = todayOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
        const todayTrips = todayOrders.length;

        // 2. Fetch Week's completed orders count
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const { count: weekTrips, error: weekErr } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', weekStart.toISOString());

        if (weekErr) throw weekErr;

        setStats({
          todayEarnings,
          todayTrips,
          weekTrips: weekTrips || 0,
        });

        // 3. Fetch active order
        const { data: activeData, error: activeErr } = await supabase
          .from('orders')
          .select('*, customer:profiles!customer_id(*)')
          .eq('driver_id', user.id)
          .in('status', ['accepted', 'on_the_way'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activeErr) throw activeErr;
        setActiveOrder(activeData);

      } catch (err) {
        console.error('Error fetching driver dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup realtime subscription
    const supabase = createClient();
    const subscription = supabase
      .channel('driver_dashboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      alert(newStatus === 'completed' ? 'Pesanan telah selesai! Terima kasih.' : 'Status pesanan diperbarui!');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.message || 'Gagal mengubah status pesanan.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format tanggal: "Sabtu, 30 Mei 2026"
  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Format jam: "17:56:03"
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8">
      
      {/* ================= HEADER ================= */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-5 md:p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
        
        {/* Bagian Kiri: Teks Sapaan */}
        <div>
          <h1 className="font-headline-md text-[22px] md:text-[30px] font-bold text-tertiary">
            Selamat Datang, {profile?.full_name || 'Driver'}!
          </h1>
          <p className="font-body-sm text-[14px] text-text-secondary mt-0.5">
            {profile?.vehicle_type ? `${profile.vehicle_type} • ${profile.license_plate}` : 'Siap untuk menerima orderan hari ini?'}
          </p>
        </div>
        
        {/* Bagian Kanan: Waktu Real-Time */}
        <div className="text-left md:text-right bg-surface-container-high px-5 py-3 rounded-xl border border-outline-variant/50 w-fit min-w-[200px]">
          {mounted ? (
            <>
              <p className="font-headline-sm text-[14px] font-bold text-text-primary">
                {formattedDate}
              </p>
              <p className="font-label-mono text-[13px] text-tertiary mt-1 font-bold tracking-widest">
                {formattedTime} WIB
              </p>
            </>
          ) : (
            <div className="h-10 flex items-center justify-center">
               <span className="animate-spin text-tertiary">sync</span>
            </div>
          )}
        </div>
      </header>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        
        {/* Kartu 1: Pendapatan */}
        <div className="bg-surface-container p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-success/50 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success/20">
              <Image 
                src="/icons/wallet.png" 
                alt="pendapatan" 
                width={22} 
                height={22} 
                className="object-contain"
              />
            </div>
          </div>
          <h3 className="font-label-mono text-[11px] md:text-[12px] text-text-secondary mb-1">Pendapatan Hari Ini</h3>
          <p className="font-headline-md text-[18px] md:text-[24px] font-bold text-success">
            {formatRupiah(stats.todayEarnings)}
          </p>
        </div>

        {/* Kartu 2: Trip Selesai */}
        <div className="bg-surface-container p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-tertiary/50 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-tertiary/20">
              <Image 
                src="/icons/bike.png" 
                alt="trip" 
                width={22} 
                height={22} 
                className="object-contain"
              />
            </div>
          </div>
          <h3 className="font-label-mono text-[11px] md:text-[12px] text-text-secondary mb-1">Trip Selesai Hari Ini</h3>
          <p className="font-headline-md text-[18px] md:text-[24px] font-bold text-tertiary">{stats.todayTrips}</p>
        </div>

        {/* Kartu 3: Total Order (Minggu) */}
        <div className="col-span-2 md:col-span-1 bg-surface-container p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple/50 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple/20">
              <Image 
                src="/icons/notes.png" 
                alt="order" 
                width={20} 
                height={20} 
                className="object-contain"
              />
            </div>
          </div>
          <h3 className="font-label-mono text-[11px] md:text-[12px] text-text-secondary mb-1">Total Order (Minggu)</h3>
          <p className="font-headline-md text-[18px] md:text-[24px] font-bold text-secondary">{stats.weekTrips}</p>
        </div>

      </div>

      {/* ================= ACTIVE ORDER SECTION ================= */}
      <div>
        <div className="flex items-center gap-2 mb-3 ml-1">
          <span className={`w-2.5 h-2.5 rounded-full ${activeOrder ? 'bg-danger animate-pulse' : 'bg-outline-variant'}`}></span>
          <h2 className="font-label-mono text-[14px] font-bold text-text-primary uppercase tracking-wider">
            Orderan Berjalan
          </h2>
        </div>

        {!loading && activeOrder ? (
          <div className="bg-surface-container p-5 md:p-6 rounded-2xl border-2 border-tertiary/40 shadow-lg relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-bl-full -z-0"></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
              
              <div className="flex-1 space-y-5">
                
                {/* --- HEADER CARD --- */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-outline-variant/30">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden">
                       <Image 
                        src="/icons/person.png" 
                        alt="person" 
                        width={20} 
                        height={20} 
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-label-mono text-[11px] text-text-secondary">Pemesan</p>
                      <p className="font-headline-sm text-[16px] font-bold text-text-primary">
                        {activeOrder.customer?.full_name || 'Pelanggan'}
                      </p>
                    </div>
                  </div>

                  <div className="sm:ml-auto flex items-center gap-2">
                    <div className="bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/50 flex flex-col items-center min-w-[90px]">
                       <p className="font-label-mono text-[10px] text-text-secondary">Layanan</p>
                       <p className="font-bold text-[12px] text-text-primary mt-0.5 uppercase">
                         {ORDER_TYPES[activeOrder.type]?.label || activeOrder.type}
                       </p>
                    </div>
                    <div className="bg-tertiary/10 px-3 py-1.5 rounded-xl border border-tertiary/30 flex flex-col items-center min-w-[90px]">
                       <p className="font-label-mono text-[10px] text-tertiary">Tarif</p>
                       <p className="font-bold text-[12px] text-tertiary mt-0.5">
                         {formatRupiah(activeOrder.total_price)}
                       </p>
                    </div>
                  </div>

                </div>

                {/* --- TIMELINE RUTE --- */}
                <div className="relative flex flex-col gap-4 pl-1">
                  <div className="absolute left-[12px] top-[24px] bottom-[24px] w-[2px] border-l-2 border-dashed border-outline-variant/50"></div>

                  <div className="flex items-start gap-4 relative z-10">
                    <Image 
                      src="/icons/jemput1.png" 
                      alt="jemput" 
                      width={20} 
                      height={20} 
                      className="object-contain"
                    />
                    <div>
                      <p className="font-label-mono text-[11px] text-text-secondary mb-0.5">
                        {activeOrder.type === 'delivery' ? 'Lokasi Pengambilan' : 'Titik Jemput'}
                      </p>
                      <p className="font-body-md text-[14px] font-medium text-text-primary">
                        {activeOrder.pickup_location}
                      </p>
                    </div>
                  </div>

                  {activeOrder.destination_location && (
                    <div className="flex items-start gap-4 relative z-10">
                      <Image 
                        src="/icons/tujuan.png" 
                        alt="tujuan" 
                        width={20} 
                        height={20} 
                        className="object-contain"
                      />
                      <div>
                        <p className="font-label-mono text-[11px] text-text-secondary mb-0.5">
                          {activeOrder.type === 'food' ? 'Lokasi Pengantaran' : 'Titik Tujuan'}
                        </p>
                        <p className="font-body-md text-[14px] font-medium text-text-primary">
                          {activeOrder.destination_location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- DETAILS & CATATAN --- */}
                {activeOrder.notes && (
                  <div className="bg-surface-container-high rounded-xl p-3 md:p-4 border border-tertiary/20 flex gap-3 items-start mt-2">
                    <Image 
                      src="/icons/notes1.png" 
                      alt="notes" 
                      width={30} 
                      height={30} 
                      className="object-contain"
                    />
                    <div>
                      <p className="font-label-mono text-[11px] text-text-secondary mb-0.5">
                        {activeOrder.type === 'food' ? 'Detail Makanan' : activeOrder.type === 'delivery' ? 'Detail Barang' : 'Catatan Tambahan'}
                      </p>
                      <p className="font-body-sm text-[13px] text-text-primary italic whitespace-pre-line">
                        &quot;{activeOrder.notes}&quot;
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* --- TOMBOL AKSI --- */}
              <div className="flex flex-row lg:flex-col gap-3 min-w-[160px] pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-outline-variant/30 lg:pl-6 mt-2 lg:mt-0">
                
                {/* Tombol Chat WhatsApp */}
                <a 
                  href={buildWhatsAppUrl(activeOrder.service_details?.whatsapp_number || activeOrder.customer?.phone_number, activeOrder.order_number)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#1DA851] rounded-xl font-label-mono text-[13px] font-bold hover:bg-[#25D366] hover:text-white transition-colors active:scale-95 text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  Chat WA
                </a>
                
                {/* Tombol Update Status (accepted -> on_the_way -> completed) */}
                {activeOrder.status === 'accepted' ? (
                  <button 
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(activeOrder.id, 'on_the_way')}
                    className="flex-[2] lg:flex-none flex items-center justify-center gap-2 py-3 bg-tertiary text-on-tertiary rounded-xl font-label-mono text-[13px] font-bold shadow-lg hover:-translate-y-1 hover:shadow-tertiary/40 active:scale-95 transition-all duration-300"
                  >
                    Mulai Perjalanan
                  </button>
                ) : (
                  <button 
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(activeOrder.id, 'completed')}
                    className="flex-[2] lg:flex-none flex items-center justify-center gap-2 py-3 bg-success text-white rounded-xl font-label-mono text-[13px] font-bold shadow-lg hover:-translate-y-1 hover:shadow-success/40 active:scale-95 transition-all duration-300"
                  >
                    Selesaikan Trip
                  </button>
                )}
              </div>
              
            </div>
          </div>
        ) : (
          <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-center space-y-4">
            <p className="font-body-md text-text-secondary text-[14px]">
              Tidak ada orderan berjalan saat ini.
            </p>
            <Link 
              href="/driver/pesanan"
              className="inline-flex items-center gap-2 px-5 py-3 bg-tertiary text-on-tertiary rounded-xl font-label-mono text-[13px] font-bold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Cari Orderan Sekarang
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}