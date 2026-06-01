'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { calculatePrice } from '@/lib/pricing';

// Import MapPicker dynamically to prevent SSR/Leaflet window not found error
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function FoodOrderPage() {
  const router = useRouter();
  const { profile, user, loading: loadingProfile } = useProfile();

  const [isLoading, setIsLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  // Food specific fields
  const [restaurantName, setRestaurantName] = useState('');
  const [foodItems, setFoodItems] = useState('');

  // Location states
  const [pickup, setPickup] = useState(null); // Restaurant location { lat, lng, address }
  const [destination, setDestination] = useState(null); // Delivery location { lat, lng, address }

  // Pricing states
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [error, setError] = useState('');

  // Autofill WhatsApp number when profile loaded
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setWhatsappNumber(profile.phone_number || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const handleDualLocationSelect = useCallback(({ pickup, destination, distance }) => {
    setPickup(pickup);
    setDestination(destination);
    setDistance(distance);
    setPrice(calculatePrice(distance, 'food'));
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!restaurantName) {
      setError('Silakan masukkan nama resto.');
      return;
    }

    if (!foodItems) {
      setError('Silakan masukkan detail pesanan (menu & jumlah).');
      return;
    }

    if (!pickup) {
      setError('Silakan pilih lokasi restoran/kantin pada peta.');
      return;
    }

    if (!destination) {
      setError('Silakan pilih lokasi pengantaran makanan pada peta.');
      return;
    }

    if (!pickupTime) {
      setError('Silakan masukkan jam pengantaran.');
      return;
    }

    if (!whatsappNumber) {
      setError('Silakan masukkan nomor WhatsApp.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Convert HH:MM to ISO TIMESTAMPTZ
      const [hours, minutes] = pickupTime.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours || 0, minutes || 0, 0, 0);
      if (targetTime < new Date()) {
        targetTime.setDate(targetTime.getDate() + 1); // assume tomorrow if time passed
      }

      const { data, error: insertError } = await supabase.from('orders').insert({
        customer_id: user.id,
        type: 'food',
        total_price: price,
        distance_estimate: distance,
        notes: foodItems,
        pickup_location: `Resto: ${restaurantName} (${pickup.address})`,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        destination_location: destination.address,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        pickup_time: targetTime.toISOString(),
        service_details: {
          whatsapp_number: whatsappNumber,
          restaurant_name: restaurantName,
          food_items: foodItems,
        }
      });

      if (insertError) throw insertError;

      alert('Driver KOMAH Food sedang dicarikan!');
      router.push('/user/history');
    } catch (err) {
      console.error('Insert food order error:', err);
      setError(err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logika pintar untuk memformat dan membatasi input jam
  const handleTimeChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Hapus semua huruf/simbol, sisakan angka

    // Batasi jam (HH) maksimal 23
    if (value.length >= 1) {
      if (parseInt(value[0]) > 2) value = '2'; // Angka pertama maksimal 2
    }
    if (value.length >= 2) {
      if (parseInt(value[0]) === 2 && parseInt(value[1]) > 3) {
        value = '23'; // Kalau depannya 2, angka kedua maksimal 3
      }
    }

    // Batasi menit (MM) maksimal 59
    if (value.length >= 3) {
      if (parseInt(value[2]) > 5) {
        value = value.slice(0, 2) + '5'; // Angka ketiga (puluhan menit) maksimal 5
      }
    }

    // Sisipkan titik dua otomatis
    if (value.length >= 3) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    setPickupTime(value);
  };

  return (
    <div className="w-full max-w-[850px] mx-auto pb-4">
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-tertiary transition-colors mb-4 group font-body-sm w-fit">
          <Image 
            src="/icons/back.png" 
            alt="kembali" 
            width={20} 
            height={20} 
            className="transition-all duration-200 group-hover:-translate-x-1 opacity-70 group-hover:opacity-100" 
          />
          <span className="font-medium text-[14px]">Kembali</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange/20">
            <Image
              src="/icons/fast_food.png" 
              alt="fast_food"
              width={30}
              height={30}
              className="object-contain" 
            />
          </div>
          <div>
            <h1 className="font-headline-md text-[24px] md:text-[28px] font-bold text-text-primary">
              Pesan <span className="text-tertiary">KOMAH Food</span>
            </h1>
            <p className="font-body-sm text-[14px] text-text-secondary">Driver kami siap membelikan makanan kesukaanmu.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-cancel/10 border border-cancel/30 rounded-xl text-danger text-[13px] font-label-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg space-y-5" onSubmit={handleOrder}>
            
            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Nama Resto</label>
              <div className="relative flex items-center">
                <Image
                  src="/icons/store.png" 
                  alt="store"
                  width={23}
                  height={23}
                  className="absolute left-3" 
                />
                <input 
                  type="text" 
                  required 
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Contoh: Kantin Teknik (Mpok Siti)" 
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Detail Pesanan (Menu & Jumlah)</label>
              <textarea 
                required 
                rows="3" 
                value={foodItems}
                onChange={(e) => setFoodItems(e.target.value)}
                placeholder="Contoh: 1x Nasi Goreng Ayam (Pedas)&#10;1x Es Teh Manis" 
                className="w-full p-4 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:border-tertiary focus:outline-none"
              ></textarea>
            </div>

            {/* Unified Dual Map Picker */}
            <MapPicker
              mode="dual"
              pickupLabel="Lokasi Restoran / Kantin"
              destinationLabel="Titik Pengantaran Makanan"
              onDualLocationSelect={handleDualLocationSelect}
            />

            {/* Bagian Waktu & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              
              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Jam Pengantaran</label>
                <div className="relative flex items-center">
                  <Image src="/icons/time.png" alt="time" width={20} height={20} className="absolute left-4" />
                  <input 
                    type="text" 
                    required 
                    value={pickupTime}
                    onChange={handleTimeChange}
                    placeholder="08:30" 
                    maxLength="5"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-primary placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" 
                  />
                </div>
              </div>   
        
              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Nomor WhatsApp Anda</label>
                <div className="relative flex items-center">
                  <Image 
                    src="/icons/whatsapp1.png" 
                    alt="whatsapp" 
                    width={20} 
                    height={20} 
                    className="absolute left-4"
                  />
                  <input 
                    type="tel" 
                    required 
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Contoh: 08123456789" 
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg flex flex-col h-full sticky top-24">
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-4 border-b border-outline-variant/30 pb-3">Ongkir Estimasi</h3>
            
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-text-secondary font-body-sm">Jarak Estimasi</span>
                <span className="text-text-primary font-medium">
                  {calculatingRoute ? 'Menghitung...' : `${distance} km`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-text-secondary font-body-sm">Biaya Antar</span>
                <span className="text-text-primary font-medium">
                  {calculatingRoute ? '...' : `Rp ${price.toLocaleString('id-ID')}`}
                </span>
              </div>
              <p className="text-[12px] text-text-secondary mt-2 border-t border-outline-variant/30 pt-2">*Harga makanan dibayar terpisah sesuai nota kantin/resto ke driver.</p>
            </div>

            <div className="mt-4">
              <button 
                onClick={handleOrder} 
                disabled={isLoading || calculatingRoute} 
                className={`w-full py-3.5 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg transition-all duration-300 font-headline-sm text-[16px] flex justify-center items-center gap-2 ${isLoading || calculatingRoute ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,82,0.4)] active:scale-95'}`}
              >
                {isLoading ? (
                  <>
                    <Image 
                      src="/icons/loading.png" 
                      alt="loading" 
                      width={20} 
                      height={20} 
                      className="animate-spin object-contain" 
                    />
                    Mencari Driver...
                  </>
                ) : (
                  'Pesan Sekarang'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}