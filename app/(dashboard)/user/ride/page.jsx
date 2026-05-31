'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RideOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState(''); // State khusus untuk menyimpan jam jemput

  const handleOrder = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Driver Antar/Jemput sedang dicarikan!');
      router.push('/user/history');
    }, 1500);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg space-y-4" onSubmit={handleOrder}>
            
            {/* WADAH BARU: Menggabungkan Titik Jemput, Garis, & Tujuan agar lebih presisi */}
            <div className="relative flex flex-col gap-4">
              
              {/* Garis putus-putus otomatis memanjang di antara 2 ikon */}
              <div className="absolute left-[24px] top-[40px] bottom-[40px] w-[2px] border-l-2 border-dashed border-outline-variant/60 z-0"></div>

              {/* Titik Penjemputan */}
              <div className="relative z-10 space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Titik Penjemputan</label>
                <div className="relative flex items-center">
                  <Image 
                    src="/icons/jemput1.png" 
                    alt="jemput" 
                    width={20} 
                    height={20} 
                    className="absolute left-4"
                  />
                  <input type="text" required placeholder="Contoh: Kosan Gang Mawar" className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" />
                </div>
              </div>

              {/* Titik Tujuan */}
              <div className="relative z-10 space-y-2">
                <label className="block font-label-mono text-[13px] text-on-surface-variant mt-6 ml-1">Titik Tujuan</label>
                <div className="relative flex items-center">
                  <Image 
                    src="/icons/tujuan.png" 
                    alt="tujuan" 
                    width={20} 
                    height={20} 
                    className="absolute left-4"
                  />
                  <input type="text" required placeholder="Contoh: Fakultas Tarbiyah" className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" />
                </div>
              </div>

            </div>

            {/* Bagian Waktu & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* BAGIAN JAM YANG SUDAH DIPERBARUI */}
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
                    placeholder="Contoh: 08123456789" 
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" 
                  />
                </div>
              </div>

            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Catatan Tambahan (Opsional)</label>
              <textarea rows="2" placeholder="Contoh: Saya pakai jaket hitam, tunggu di depan pagar." className="w-full p-4 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:border-tertiary focus:outline-none"></textarea>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg flex flex-col h-full sticky top-24">
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-4 border-b border-outline-variant/30 pb-3">Ringkasan Pesanan</h3>
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center text-[14px]"><span className="text-text-secondary font-body-sm">Jarak Estimasi</span><span className="text-text-primary font-medium">1.5 km</span></div>
              <div className="flex justify-between items-center text-[14px]"><span className="text-text-secondary font-body-sm">Pembayaran</span><span className="text-tertiary font-label-mono bg-tertiary/10 px-2 py-0.5 rounded text-[12px]">Tunai (Cash)</span></div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/30">
              <div className="flex justify-between items-end mb-4">
                <span className="text-text-primary font-headline-sm text-[14px]">Estimasi Harga</span>
                <span className="text-[18px] font-bold text-tertiary font-label-mono">Rp 5.000</span>
              </div>
              <button 
                onClick={handleOrder} 
                disabled={isLoading} 
                className={`w-full py-3.5 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg transition-all duration-300 font-headline-sm text-[16px] flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,82,0.4)] active:scale-95'}`}
              >
                {isLoading ? (
              <>
                <Image 
                  src="/icons/loading.png" /* Pastikan nama dan ekstensinya sesuai dengan yang ada di folder public/icons */
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