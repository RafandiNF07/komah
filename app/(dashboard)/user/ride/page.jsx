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

export default function RideOrderPage() {
  const router = useRouter();
  const { profile, user, loading: loadingProfile } = useProfile();
  
  const [isLoading, setIsLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  // Location states
  const [pickup, setPickup] = useState(null); // { lat, lng, address }
  const [destination, setDestination] = useState(null); // { lat, lng, address }
  
  // Pricing states
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
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
    setPrice(calculatePrice(distance, 'bike'));
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!pickup) {
      setError('Silakan pilih titik penjemputan pada peta.');
      return;
    }

    if (!destination) {
      setError('Silakan pilih titik tujuan pada peta.');
      return;
    }

    if (!pickupTime) {
      setError('Silakan masukkan jam penjemputan.');
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
        type: 'bike',
        total_price: price,
        distance_estimate: distance,
        notes: notes || null,
        pickup_location: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        destination_location: destination.address,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        pickup_time: targetTime.toISOString(),
        service_details: {
          whatsapp_number: whatsappNumber,
        }
      });

      if (insertError) throw insertError;

      router.push('/user/history?success=true');
    } catch (err) {
      console.error('Insert order error:', err);
      setError(err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Hapus non-angka
    if (value.length >= 1) {
      if (parseInt(value[0]) > 2) value = '2';
    }
    if (value.length >= 2) {
      if (parseInt(value[0]) === 2 && parseInt(value[1]) > 3) {
        value = '23';
      }
    }
    if (value.length >= 3) {
      if (parseInt(value[2]) > 5) {
        value = value.slice(0, 2) + '5';
      }
    }
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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-tertiary/20">
            <Image
              src="/icons/bike.png" 
              alt="bike"
              width={30}
              height={30}
              className="object-contain" 
            />
          </div>
          <div>
            <h1 className="font-headline-md text-[24px] md:text-[28px] font-bold text-text-primary">
              Buat Pesanan <span className="text-tertiary">Antar/Jemput</span>
            </h1>
            <p className="font-body-sm text-[14px] text-text-secondary">Pesan ojek kampus dengan mudah dan cepat.</p>
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
          <form className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg space-y-6" onSubmit={handleOrder}>
            
            {/* Unified Dual Map Picker */}
            <MapPicker
              mode="dual"
              pickupLabel="Titik Penjemputan"
              destinationLabel="Titik Tujuan"
              onDualLocationSelect={handleDualLocationSelect}
            />

            {/* Bagian Waktu & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Jam Penjemputan</label>
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
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Nomor WhatsApp</label>
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

            <div className="space-y-1.5 pt-2">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Catatan Tambahan (Opsional)</label>
              <textarea 
                rows="2" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Saya pakai jaket hitam, tunggu di depan pagar." 
                className="w-full p-4 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:border-tertiary focus:outline-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg flex flex-col h-full sticky top-24">
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-4 border-b border-outline-variant/30 pb-3">Ringkasan Pesanan</h3>
            
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-text-secondary font-body-sm">Jarak Estimasi</span>
                <span className="text-text-primary font-medium">
                  {distance > 0 ? `${distance} km` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-text-secondary font-body-sm">Pembayaran</span>
                <span className="text-tertiary font-label-mono bg-tertiary/10 px-2 py-0.5 rounded text-[12px]">Tunai (Cash)</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30">
              <div className="flex justify-between items-end mb-4">
                <span className="text-text-primary font-headline-sm text-[14px]">Estimasi Harga</span>
                <span className="text-[18px] font-bold text-tertiary font-label-mono">
                  {price > 0 ? `Rp ${price.toLocaleString('id-ID')}` : '-'}
                </span>
              </div>
              <button 
                onClick={handleOrder} 
                disabled={isLoading || !pickup || !destination} 
                className={`w-full py-3.5 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg transition-all duration-300 font-headline-sm text-[16px] flex justify-center items-center gap-2 ${isLoading || !pickup || !destination ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,82,0.4)] active:scale-95'}`}
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