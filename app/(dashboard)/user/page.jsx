'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { ORDER_TYPES, ORDER_STATUS } from '@/lib/constants';
import { orderService } from '@/lib/services/orderService';

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useProfile();
  const [currentDate, setCurrentDate] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  // Sinkronisasi waktu lokal agar jam berjalan real-time
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
      setCurrentDate(now.toLocaleDateString('id-ID', options).replace(/\./g, ':'));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Sinkronisasi ulang tiap menit
    return () => clearInterval(interval);
  }, []);

  const userId = user?.id;

  // Fetch active order
  useEffect(() => {
    if (!userId) return;

    const fetchActiveOrder = async () => {
      try {
        const data = await orderService.getActiveOrderForCustomer(userId);
        setActiveOrder(data);
      } catch (err) {
        console.error('Error fetching active order:', err);
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchActiveOrder();

    // Setup realtime subscription
    const supabase = createClient();
    const subscription = supabase
      .channel('active_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` },
        () => {
          fetchActiveOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      
      {/* Header Sapaan Baru dengan Waktu Real-time */}
      <header className="mb-6 pt-2 md:pt-0">
        <h1 className="font-headline-md text-[40px] md:text-[40px] font-bold text-tertiary">
          Mau pesan apa hari ini? ✨
        </h1>
        <p className="font-body-sm text-[13px] text-text-secondary mt-1">
          {currentDate || 'Memuat waktu...'}
        </p>
      </header>

      {/* Pesanan Aktif Card - Render conditionally if there is an active order */}
      {!loadingOrder && activeOrder && (
        <div className="mb-6 bg-surface-container border border-tertiary/30 rounded-xl p-3.5 flex items-center justify-between shadow-lg shadow-tertiary/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-tertiary/10 to-transparent opacity-50"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center border border-tertiary/50 shrink-0">
              <Image
                src={
                  activeOrder.type === 'bike' 
                    ? '/icons/bike.png' 
                    : activeOrder.type === 'food' 
                    ? '/icons/fast_food.png' 
                    : activeOrder.type === 'delivery' 
                    ? '/icons/delivery2.png' 
                    : '/icons/helper.png'
                }
                alt="Pesanan Aktif"
                width={25}
                height={25}
                className="animate-pulse object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-[15px] font-bold text-tertiary leading-tight">
                  Pesanan Aktif ({ORDER_TYPES[activeOrder.type]?.label || activeOrder.type})
                </h3>
                <span className="text-[10px] font-semibold bg-tertiary/10 text-tertiary px-1.5 py-0.2 rounded font-label-mono uppercase">
                  {activeOrder.order_number}
                </span>
              </div>
              <p className="font-label-mono text-[11px] text-text-secondary mt-0.5">
                {ORDER_STATUS[activeOrder.status]?.label || activeOrder.status}
              </p>
            </div>
          </div>
          
          {/* Tombol ke halaman Riwayat */}
          <button 
            onClick={() => router.push('/user/history')}
            className="relative z-10 flex items-center gap-1.5 px-5 py-2.5 bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-mono text-[12px] font-bold rounded-xl shadow-lg shadow-tertiary/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,82,0.5)] active:scale-95 whitespace-nowrap"
          >
            <Image
              src="/icons/search.png"
              alt="Cari"
              width={16}
              height={16}
              className="object-contain"
            />
            <span className="hidden sm:inline ml-1 text-[11px]">Pantau</span>
          </button>
        </div>
      )}

      <h2 className="font-headline-sm text-[18px] font-bold text-text-primary mb-3">Layanan Tersedia</h2>
      
      {/* Bento Grid 2x2 Menu Layanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        
        {/* Menu 1: Antar/Jemput */}
        <Link href="/user/ride" className="block group relative bg-surface-container-low rounded-xl p-4 border border-border-subtle overflow-hidden hover:border-tertiary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Image
              src="/icons/bike.png" 
              alt="bike"
              width={100}
              height={100}
              className="object-contain" 
            />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center mb-3 border border-outline-variant group-hover:border-tertiary transition-colors">
              <Image
                src="/icons/bike.png" 
                alt="bike"
                width={30}
                height={30}
                className="object-contain" 
              />
            </div>
            <h3 className="font-headline-sm text-[16px] font-bold text-text-primary mb-0.5">Antar/Jemput</h3>
            <p className="font-body-sm text-[12px] text-text-secondary">Pergi kuliah jadi lebih mudah dan cepat.</p>
          </div>
        </Link>

        {/* Menu 2: KOMAH Food */}
        <Link href="/user/food" className="block group relative bg-surface-container-low rounded-xl p-4 border border-border-subtle overflow-hidden hover:border-tertiary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Image
              src="/icons/food.png" 
              alt="food"
              width={90}
              height={90}
              className="object-contain" 
            />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center mb-3 border border-outline-variant group-hover:border-orange transition-colors">
              <Image
                src="/icons/fast_food.png" 
                alt="food"
                width={30}
                height={30}
                className="object-contain" 
              />
            </div>
            <h3 className="font-headline-sm text-[16px] font-bold text-text-primary mb-0.5">KOMAH Food</h3>
            <p className="font-body-sm text-[12px] text-text-secondary">Lapar? Kami antar sampai depan kelas.</p>
          </div>
        </Link>

        {/* Menu 3: Delivery */}
        <Link href="/user/delivery" className="block group relative bg-surface-container-low rounded-xl p-4 border border-border-subtle overflow-hidden hover:border-tertiary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Image
              src="/icons/truck.png" 
              alt="truck"
              width={100}
              height={100}
              className="object-contain" 
            />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center mb-3 border border-outline-variant group-hover:border-purple transition-colors">
              <Image
                src="/icons/delivery2.png" 
                alt="delivery"
                width={30}
                height={30}
                className="object-contain" 
              />
            </div>
            <h3 className="font-headline-sm text-[16px] font-bold text-text-primary mb-0.5">Delivery</h3>
            <p className="font-body-sm text-[12px] text-text-secondary">Kirim dokumen atau barang tanpa repot.</p>
          </div>
        </Link>

        {/* Menu 4: Helper */}
        <Link href="/user/helper" className="block group relative bg-surface-container-low rounded-xl p-4 border border-border-subtle overflow-hidden hover:border-tertiary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Image
              src="/icons/handshake.png"
              alt="handshake"
              width={90}
              height={90}
              className="object-contain"
            />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center mb-3 border border-outline-variant group-hover:border-success transition-colors">
              <Image
                src="/icons/heart.png" 
                alt="heart"
                width={30}
                height={30}
                className="object-contain" 
              />
            </div>
            <h3 className="font-headline-sm text-[16px] font-bold text-text-primary mb-0.5">Helper</h3>
            <p className="font-body-sm text-[12px] text-text-secondary">Bantuan jasa cepat untuk kebutuhan mendadak.</p>
          </div>
        </Link>

      </div>
      
    </div>
  );
}