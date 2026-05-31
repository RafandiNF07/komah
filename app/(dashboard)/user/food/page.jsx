'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function FoodOrderPage() {
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
                <input type="text" required placeholder="Contoh: Kantin Teknik (Mpok Siti)" className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Detail Pesanan (Menu & Jumlah)</label>
              <textarea required rows="3" placeholder="Contoh: 1x Nasi Goreng Ayam (Pedas)&#10;1x Es Teh Manis" className="w-full p-4 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] resize-none focus:border-tertiary focus:outline-none"></textarea>
            </div>


            {/* Bagian Waktu & WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                          
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


            <div className="space-y-1.5">
              <label className="block font-label-mono text-[13px] text-on-surface-variant ml-1">Titik Pengantaran</label>
              <div className="relative flex items-center">
                <Image 
                  src="/icons/tujuan.png" 
                  alt="tujuan" 
                  width={20} 
                  height={20} 
                  className="absolute left-4"
                />
                <input type="text" required placeholder="Contoh: Lobby Fakultas Ekonomi" className="w-full pl-11 pr-4 py-3 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[14px] focus:border-tertiary focus:outline-none" />
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 shadow-lg flex flex-col h-full">
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-4 border-b border-outline-variant/30 pb-3">Ongkir Estimasi</h3>
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center text-[14px]"><span className="text-text-secondary font-body-sm">Biaya Antar</span><span className="text-text-primary font-medium">Rp 5.000</span></div>
              <p className="text-[12px] text-text-secondary mt-2 border-t border-outline-variant/30 pt-2">*Harga makanan dibayar terpisah sesuai nota kantin/resto ke driver.</p>
            </div>
            <div className="mt-4">
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