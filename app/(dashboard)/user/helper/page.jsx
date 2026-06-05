'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';
import { PRICING, formatRupiah } from '@/lib/constants'; // Ditambahkan formatRupiah dari konstanta

// Import MapPicker secara dinamis untuk mencegah error window not found pada SSR/Leaflet
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function HelperOrderPage() {
  const router = useRouter();
  const { profile, user, loading: loadingProfile } = useProfile();

  const [isLoading, setIsLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  // Bidang spesifik Helper
  const [taskDescription, setTaskDescription] = useState('');

  // Status Lokasi & Perhitungan Jarak Dinamis
  const [pickup, setPickup] = useState(null); // { lat, lng, address }
  const [distance, setDistance] = useState(0);
  const [travelFee, setTravelFee] = useState(0);

  const [error, setError] = useState('');

  // Mengisi otomatis nomor WhatsApp ketika profil berhasil dimuat
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setWhatsappNumber(profile.phone_number || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // --- LOGIKA REAL-TIME UNTUK MENGHITUNG JARAK TEMPUH & TARIF DRIVER ---
  useEffect(() => {
    if (pickup) {
      // Koordinat Titik Pusat / Rektorat UIN Suska Riau sebagai acuan pangkalan driver
      const uinLat = 0.4614;
      const uinLng = 101.3631;
      
      // Rumus Haversine untuk kalkulasi jarak koordinat bumi
      const R = 6371; // Radius bumi dalam kilometer
      const dLat = (pickup.lat - uinLat) * Math.PI / 180;
      const dLon = (pickup.lng - uinLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(uinLat * Math.PI / 180) * Math.cos(pickup.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;
      
      const estimatedDistance = parseFloat(d.toFixed(1)); // Ambil 1 angka di belakang koma (ex: 2.3 km)
      setDistance(estimatedDistance);

      // Skema Tarif KOMAH: Rp5.000 untuk 1 km pertama, bertambah Rp2.000 setiap km berikutnya
      const fee = estimatedDistance <= 1 
        ? 5000 
        : 5000 + Math.ceil(estimatedDistance - 1) * 2000;
      setTravelFee(fee);
    } else {
      setDistance(0);
      setTravelFee(0);
    }
  }, [pickup]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!pickup) {
      setError('Silakan pilih lokasi pengerjaan pada peta.');
      return;
    }

    if (!pickupTime) {
      setError('Silakan masukkan jam pengerjaan.');
      return;
    }

    if (!whatsappNumber) {
      setError('Silakan masukkan nomor WhatsApp.');
      return;
    }

    if (!taskDescription) {
      setError('Silakan masukkan deskripsi bantuan yang dibutuhkan.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Mengonversi HH:MM ke format ISO TIMESTAMPTZ
      const [hours, minutes] = pickupTime.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours || 0, minutes || 0, 0, 0);
      if (targetTime < new Date()) {
        targetTime.setDate(targetTime.getDate() + 1); // Asumsikan besok jika jam sudah lewat
      }

      const { data, error: insertError } = await supabase.from('orders').insert({
        customer_id: user.id,
        type: 'helper',
        total_price: travelFee, // Menggunakan tarif perjalanan hasil kalkulasi dinamis
        distance_estimate: distance, // Menyimpan hasil estimasi jarak rill
        notes: taskDescription,
        pickup_location: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        destination_location: null,
        destination_lat: null,
        destination_lng: null,
        pickup_time: targetTime.toISOString(),
        service_details: {
          whatsapp_number: whatsappNumber,
          task_description: taskDescription,
        }
      });

      if (insertError) throw insertError;

      router.push('/user/history?success=true');
    } catch (err) {
      console.error('Insert helper order error:', err);
      setError(err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 

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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success/15">
            <Image src="/icons/helper.png" alt="helper" width={30} height={30} className="object-contain" />
          </div>
          <div>
            <h1 className="font-headline-md text-[24px] md:text-[28px] font-bold text-text-primary">
              Jasa <span className="text-success">Helper</span>
            </h1>
            <p className="font-body-sm text-[14px] text-text-secondary">Bantuan tenaga cepat di sekitar area kampus.</p>
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
            
            <MapPicker
              label="Lokasi Pengerjaan"
              placeholder="Pilih lokasi pengerjaan bantuan pada peta atau gunakan lokasi saat ini"
              markerType="pickup"
              onLocationSelect={(loc) => setPickup(loc)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Jam Pengerjaan</label>
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
                  <Image src="/icons/whatsapp1.png" alt="whatsapp" width={20} height={20} className="absolute left-4" />
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

            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Deskripsi Bantuan yang Dibutuhkan</label>
              <textarea 
                required 
                rows="4" 
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Contoh: Butuh 1 orang untuk bantu angkat 2 kotak buku dari lantai 1 ke lantai 3. Waktu pengerjaan sekitar 15 menit." 
                className="w-full p-4 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:border-tertiary focus:outline-none"
              ></textarea>
            </div>
          </form>
        </div>

        {/* ================= REVISI RINGKASAN PESANAN (SIDEBAR) ================= */}
        <div className="space-y-6">
          <div className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg flex flex-col h-full sticky top-24">
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-4 border-b border-outline-variant/30 pb-3">Ringkasan Pesanan</h3>
            
            <div className="space-y-3 flex-1">
              {/* Row 1: Estimasi Jarak Tempuh */}
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-text-secondary font-body-sm">Jarak Estimasi</span>
                <span className="font-bold text-text-primary font-label-mono">
                  {pickup ? `${distance} km` : '-'}
                </span>
              </div>

              {/* Row 2: Metode Pembayaran */}
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-text-secondary font-body-sm">Pembayaran</span>
                <span className="text-tertiary font-label-mono bg-tertiary/10 px-2 py-0.5 rounded text-[12px]">Tunai (Cash)</span>
              </div>

              {/* Garis batas gradien cantik seperti contoh Ride */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant to-transparent my-4"></div>

              {/* Row 3: Total Ongkos Perjalanan Driver */}
              <div className="flex justify-between items-end mb-4 text-[14px]">
                <span className="text-text-primary font-body-sm">Estimasi Harga (Transport)</span>
                <span className="text-[20px] font-bold text-success font-label-mono">
                  {pickup ? formatRupiah(travelFee) : 'Rp 0'}
                </span>
              </div>

              {/* Catatan Keterangan Tambahan */}
              <p className="text-[11px] text-text-secondary mt-2 border-t border-outline-variant/30 pt-2 leading-relaxed">
                *Biaya di atas murni merupakan tarif perjalanan driver menuju lokasi pengerjaan bantuan. Tarif upah jasa kerja Helper tidak termasuk dan dapat dinegosiasikan secara fleksibel bersama helper saat terhubung.
              </p>
            </div>

            <div className="mt-4">
              <button 
                onClick={handleOrder} 
                disabled={isLoading} 
                className={`w-full py-3.5 bg-success text-surface-container font-bold rounded-xl shadow-lg transition-all duration-300 font-headline-sm text-[16px] flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-95'}`}
              >
                {isLoading ? (
                  <>
                    <Image src="/icons/loading.png" alt="loading" width={20} height={20} className="animate-spin object-contain" />
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