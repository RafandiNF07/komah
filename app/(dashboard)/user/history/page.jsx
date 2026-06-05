'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { generateOrderReceipt } from '@/lib/pdf';
import { formatRupiah, formatDate, ORDER_TYPES, ORDER_STATUS, buildWhatsAppUrl } from '@/lib/constants';

export default function HistoryPage() {
  const { user } = useProfile();
  const [activeTab, setActiveTab] = useState('semua');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });
  const [feedback, setFeedback] = useState(null);

  // Deteksi jika diarahkan setelah membuat pesanan baru (URL success query)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        const timer = setTimeout(() => {
          setFeedback({ type: 'success', message: 'Driver sedang dicarikan! Mohon tunggu.' });
          // Bersihkan query string agar tidak memicu kembali saat di-refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Sembunyikan feedback secara otomatis setelah 3 detik
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchOrderHistory = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, driver:profiles!driver_id(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      fetchOrderHistory();
    }, 0);

    // Setup realtime subscription
    const supabase = createClient();
    const subscription = supabase
      .channel('user_history_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.id}` },
        () => {
          fetchOrderHistory();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(subscription);
    };
  }, [user, fetchOrderHistory]);

  const handleCancelOrder = (orderId) => {
    setConfirmModal({ isOpen: true, orderId });
  };

  const executeCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .in('status', ['searching', 'accepted', 'on_the_way']);

      if (error) throw error;
      setFeedback({ type: 'success', message: 'Pesanan berhasil dibatalkan.' });
      fetchOrderHistory();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setFeedback({ type: 'error', message: err.message || 'Gagal membatalkan pesanan.' });
    } finally {
      setCancellingId(null);
      setConfirmModal({ isOpen: false, orderId: null });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'aktif') {
      return ['searching', 'accepted', 'on_the_way'].includes(order.status);
    }
    if (activeTab === 'selesai') {
      return order.status === 'completed';
    }
    if (activeTab === 'batal') {
      return order.status === 'cancelled';
    }
    return true;
  });

  const getServiceStyle = (type) => {
    switch (type) {
      case 'bike':
        return { imageSrc: '/icons/bike.png', bg: 'bg-tertiary/20' };
      case 'food':
        return { imageSrc: '/icons/fast_food.png', bg: 'bg-orange/20' };
      case 'delivery':
        return { imageSrc: '/icons/delivery2.png', bg: 'bg-purple/20' };
      case 'helper':
        return { imageSrc: '/icons/helper.png', bg: 'bg-success/20' };
      default:
        return { imageSrc: '/icons/motor.png', bg: 'bg-surface-container-high' }; 
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-6">
      
      <div className="mb-6 pt-2 md:pt-0">
        <h1 className="font-headline-md text-[24px] md:text-[28px] font-bold text-text-primary">
          Riwayat Pesanan
        </h1>
        <p className="font-body-sm text-[14px] text-text-secondary mt-1">
          Pantau aktivitas dan riwayat transaksi layanan KOMAH Anda.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-4 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('semua')}
          className={`px-5 py-2 rounded-full font-label-mono text-[14px] whitespace-nowrap transition-all ${
            activeTab === 'semua' 
              ? 'bg-tertiary text-on-tertiary font-bold shadow-md' 
              : 'bg-surface-container border border-outline-variant/50 text-text-secondary hover:text-tertiary hover:border-tertiary/50'
          }`}
        >
          Semua Riwayat
        </button>
        <button 
          onClick={() => setActiveTab('aktif')}
          className={`px-5 py-2 rounded-full font-label-mono text-[14px] whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'aktif' 
              ? 'bg-tertiary text-on-tertiary font-bold shadow-md' 
              : 'bg-surface-container border border-outline-variant/50 text-text-secondary hover:text-tertiary hover:border-tertiary/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
          Sedang Aktif
        </button>
        <button 
          onClick={() => setActiveTab('selesai')}
          className={`px-5 py-2 rounded-full font-label-mono text-[14px] whitespace-nowrap transition-all ${
            activeTab === 'selesai' 
              ? 'bg-tertiary text-on-tertiary font-bold shadow-md' 
              : 'bg-surface-container border border-outline-variant/50 text-text-secondary hover:text-tertiary hover:border-tertiary/50'
          }`}
        >
          Selesai
        </button>
        <button 
          onClick={() => setActiveTab('batal')}
          className={`px-5 py-2 rounded-full font-label-mono text-[14px] whitespace-nowrap transition-all ${
            activeTab === 'batal' 
              ? 'bg-tertiary text-on-tertiary font-bold shadow-md' 
              : 'bg-surface-container border border-outline-variant/50 text-text-secondary hover:text-tertiary hover:border-tertiary/50'
          }`}
        >
          Dibatalkan
        </button>
      </div>

      <div className="space-y-4">
        {!loading ? (
          filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const style = getServiceStyle(order.type);
              const isActive = ['searching', 'accepted', 'on_the_way'].includes(order.status);

              return (
                <div key={order.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 hover:border-tertiary/40 transition-colors shadow-sm">
                  
                  <div className="flex justify-between items-start mb-4 border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-3">
                      
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-outline-variant/20 ${style.bg}`}>
                        <Image 
                          src={style.imageSrc} 
                          alt={order.type}
                          width={22} 
                          height={22}
                          className="object-contain"
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-headline-sm text-[16px] font-bold text-text-primary">
                          {ORDER_TYPES[order.type]?.label || order.type}
                        </h3>
                        <p className="font-body-sm text-[12px] text-text-secondary">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-md font-label-mono text-[11px] font-bold flex items-center gap-1.5 ${
                      isActive ? 'bg-tertiary/20 text-tertiary animate-pulse' :
                      order.status === 'completed' ? 'bg-success/20 text-success' :
                      'bg-close/20 text-cancel'
                    }`}>

                      {isActive && <Image src="/icons/bike.png" alt="bike" width={20} height={20} className="object-contain" />}
                      {order.status === 'completed' && <Image src="/icons/check.png" alt="check" width={20} height={20} className="object-contain" />}
                      {order.status === 'cancelled' && <Image src="/icons/cancel.png" alt="cancel" width={20} height={20} className="object-contain" />}
                      {ORDER_STATUS[order.status]?.label || order.status}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-3">
                        <Image src="/icons/jemput1.png" alt="jemput" width={20} height={20} className="object-contain" />
                        <div>
                          <p className="font-label-mono text-[11px] text-text-secondary mb-0.5">
                            {order.type === 'delivery' ? 'Lokasi Pengambilan' : order.type === 'helper' ? 'Lokasi Pengerjaan' : 'Titik Awal'}
                          </p>
                          <p className="font-body-sm text-[13px] text-text-primary leading-snug">{order.pickup_location}</p>
                        </div>
                      </div>
                      
                      {order.destination_location && (
                        <div className="flex items-start gap-3">
                          <Image src="/icons/tujuan.png" alt="tujuan" width={20} height={20} className="object-contain" />
                          <div>
                            <p className="font-label-mono text-[11px] text-text-secondary mb-0.5">
                              {order.type === 'food' ? 'Lokasi Pengantaran' : 'Titik Tujuan'}
                            </p>
                            <p className="font-body-sm text-[13px] text-text-primary leading-snug">{order.destination_location}</p>
                          </div>
                        </div>
                      )}

                      {/* Waktu Penjemputan / Pengerjaan */}
                      <div className="flex items-start gap-3 border-t border-outline-variant/15 pt-2 mt-1">
                        <Image src="/icons/time.png" alt="waktu" width={20} height={20} className="object-contain" />
                        <div>
                          <p className="font-label-mono text-[9px] text-tertiary mb-0.5 font-bold uppercase tracking-wider">
                            {order.type === 'helper' ? 'Waktu Pengerjaan' : 'Waktu Penjemputan'}
                          </p>
                          <p className="font-body-sm text-[13px] font-bold text-text-primary leading-snug">
                            {formatDate(order.pickup_time)}
                          </p>
                        </div>
                      </div>

                      {/* Detail Bantuan / Catatan Tambahan */}
                      {order.notes && (
                        <div className="flex items-start gap-3 border-t border-outline-variant/15 pt-2 mt-1">
                          <Image src="/icons/notes.png" alt="notes" width={20} height={20} className="object-contain opacity-70" />
                          <div>
                            <p className="font-label-mono text-[9px] text-text-secondary mb-0.5 uppercase tracking-wider">
                              {order.type === 'helper' ? 'Detail Bantuan' : 'Catatan Tambahan'}
                            </p>
                            <p className="font-body-sm text-[12px] text-text-primary italic leading-snug line-clamp-2">
                              &quot;{order.notes}&quot;
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* --- REVISI TAMPILAN BIAYA & JARAK ESTIMASI --- */}
                    <div className="flex flex-row md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-outline-variant/30 pt-3 md:pt-0 md:pl-4 min-w-[130px]">
                      <div className="text-left md:text-right">
                        <p className="font-label-mono text-[11px] text-text-secondary">
                          {order.type === 'helper' ? 'Biaya Transport' : 'Total Biaya'}
                        </p>
                        {/* Menampilkan label Jarak jika data tersedia di database */}
                        {order.distance_estimate > 0 && (
                          <p className="font-label-mono text-[10px] text-tertiary mt-0.5 font-bold">
                            Jarak: {order.distance_estimate} km
                          </p>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="font-headline-sm text-[18px] font-bold text-text-primary mt-1 md:mt-0">
                          {formatRupiah(order.total_price)}
                        </p>
                        <p className="font-label-mono text-[10px] text-outline mt-1 hidden md:block uppercase tracking-wider">{order.order_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Profile Information */}
                  {order.driver && (
                    <div className="mt-4 p-3 bg-surface-container rounded-xl border border-outline-variant/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden relative">
                        {order.driver.avatar_url ? (
                          <Image src={order.driver.avatar_url} alt="Foto Profil Driver" width={40} height={40} unoptimized className="object-cover w-full h-full" />
                        ) : (
                          <Image src="/icons/person.png" alt="person" width={20} height={20} className="object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-mono text-[9px] text-text-secondary leading-none uppercase">Driver Mitra KOMAH</p>
                        <p className="font-headline-sm text-[14px] font-bold text-text-primary mt-1 truncate">
                          {order.driver.full_name}
                        </p>
                        {order.driver.vehicle_type && (
                          <p className="font-body-sm text-[11px] text-text-secondary mt-0.5">
                            {order.driver.vehicle_type} • {order.driver.license_plate}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons for Active Orders */}
                  {isActive && (
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex gap-3">
                      {order.driver ? (
                        <a 
                          href={buildWhatsAppUrl(order.service_details?.whatsapp_number || order.driver.phone_number, order.order_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 py-2 lg:py-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#1DA851] rounded-xl font-label-mono text-[11px] lg:text-[13px] font-bold hover:bg-[#25D366] hover:text-white transition-colors active:scale-95 text-center leading-tight"
                        >
                          <Image src="/icons/whatsapp.png" alt="wa" width={18} height={18} className="object-contain" />
                          <span>Hubungi Driver</span>
                        </a>
                      ) : (
                        <button disabled className="flex-1 py-2 bg-surface-container-high text-outline font-label-mono text-[13px] rounded-lg cursor-not-allowed text-center">
                          Mencari Driver...
                        </button>
                      )}
                      
                      {order.status === 'searching' && (
                        <button 
                          disabled={cancellingId === order.id}
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex-1 py-2 bg-surface-container-high text-danger font-label-mono text-[13px] rounded-lg hover:bg-danger/20 transition-colors font-bold"
                        >
                          {cancellingId === order.id ? 'Membatalkan...' : 'Batalkan Pesanan'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Cetak Bukti PDF for Completed Orders */}
                  {order.status === 'completed' && (
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-end">
                      <button 
                        onClick={() => generateOrderReceipt(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary font-label-mono text-[12px] font-bold rounded-lg border border-tertiary/30 transition-all active:scale-95"
                      >
                        <Image src="/icons/pdf.png" alt="pdf" width={16} height={16} className="object-contain" />
                        Cetak Bukti
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-8">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                <Image src="/icons/notes.png" alt="receipt" width={48} height={48} className="opacity-40 animate-pulse" />
              </div>
              <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-2">Belum Ada Riwayat</h3>
              <p className="font-body-sm text-[14px] text-text-secondary max-w-sm mb-6">
                Anda belum memiliki pesanan dengan filter ini. Yuk cobain layanan KOMAH sekarang!
              </p>
              <Link href="/user" className="px-6 py-2.5 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-tertiary/20 transition-all font-label-mono text-[14px]">
                Pesan Layanan
              </Link>
            </div>
          )
        ) : (
          <div className="p-8 text-center text-[14px] text-text-secondary">
            <Image src="/icons/loading.png" alt="loading" width={35} height={35} className="animate-spin object-contain mx-auto" />
            <p className="mt-2">Memuat riwayat pesanan...</p>
          </div>
        )} 
      </div>

      {/* Custom Confirm Cancel Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container border border-outline-variant/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-2">Batalkan Pesanan?</h3>
            <p className="font-body-sm text-[13px] text-text-secondary leading-relaxed">
              Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
                className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-text-primary rounded-xl font-label-mono text-[12px] font-bold transition-colors"
              >
                Kembali
              </button>
              <button 
                onClick={() => executeCancelOrder(confirmModal.orderId)}
                className="px-4 py-2 bg-cancel hover:bg-cancel/95 text-on-tertiary rounded-xl font-label-mono text-[12px] font-bold shadow-lg shadow-cancel/10 transition-colors"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-[300] px-4 py-3 rounded-xl shadow-lg text-[13px] font-label-mono transition-all duration-300 ${
          feedback.type === 'success' 
            ? 'bg-success/90 text-on-tertiary' 
            : 'bg-cancel/90 text-on-tertiary'
        }`}>
          {feedback.message}
        </div>
      )}

    </div>
  );
}