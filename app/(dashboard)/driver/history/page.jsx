'use client';

import Image from 'next/image';
import { useState } from 'react';

// --- KAMUS GAMBAR & WARNA ---
const getServiceInfo = (type) => {
  switch (type) {
    case 'ride':
      return { icon: '/icons/bike.png', title: 'Antar-Jemput' };
    case 'food':
      return { icon: '/icons/fast_food.png', title: 'Titip Makan' }; // Ganti pesanan.png dengan ikon makanan jika ada
    case 'courier':
      return { icon: '/icons/notes.png', title: 'Titip Barang' }; // Ganti notes.png dengan ikon barang/box jika ada
    case 'car':
      return { icon: '/icons/bike.png', title: 'Antar-Jemput' }; // Ganti dengan ikon mobil jika ada
    default:
      return { icon: '/icons/notes.png', title: 'Layanan KOMAH' };
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Selesai':
      return 'bg-success/10 text-success border-success/30';
    case 'Aktif':
      return 'bg-secondary/10 text-secondary border-secondary/30 animate-pulse';
    case 'Dibatalkan':
      return 'bg-danger/10 text-danger border-danger/30';
    default:
      return 'bg-surface-variant text-text-secondary border-outline-variant';
  }
};

// --- DATA DUMMY RIWAYAT ---
const historyData = [
  {
    id: 1,
    type: 'ride',
    date: '12 Okt 2024, 14:30',
    status: 'Selesai',
    pickup: 'Fakultas Sains dan Teknologi',
    destination: 'Kost Putra Harapan Raya',
    driver: 'Budi Santoso',
    price: 'Rp 12.000',
    cancelReason: null,
  },
  {
    id: 2,
    type: 'food',
    date: 'Hari ini, 19:15',
    status: 'Aktif',
    pickup: 'Ayam Geprek Bensu, Panam',
    destination: 'Perpustakaan UIN SUSKA',
    driver: 'Andi Wijaya',
    price: 'Rp 25.000',
    cancelReason: null,
  },
  {
    id: 3,
    type: 'car',
    date: '10 Okt 2024, 08:00',
    status: 'Dibatalkan',
    pickup: 'Gerbang Utama UIN',
    destination: 'Mall SKA Pekanbaru',
    driver: null, // Asumsi belum dapat driver lalu batal
    price: 'Rp 45.000',
    cancelReason: 'Dibatalkan oleh Pengemudi',
  },
  {
    id: 4,
    type: 'courier',
    date: '08 Okt 2024, 10:15',
    status: 'Selesai',
    pickup: 'Fotokopi Berkah, Gerbang UIN',
    destination: 'Gedung Rektorat Lt. 2',
    driver: 'Siti Aminah',
    price: 'Rp 8.000',
    cancelReason: null,
  },
  {
    id: 5,
    type: 'ride',
    date: '05 Okt 2024, 16:45',
    status: 'Selesai',
    pickup: 'Pusat Kegiatan Mahasiswa (PKM)',
    destination: 'Kos Mawar Merah',
    driver: 'Reza Fahlevi',
    price: 'Rp 10.000',
    cancelReason: null,
  },
];


export default function UserHistoryPage() {
  // State untuk filter tab (Semua, Aktif, Selesai, Batal)
  const [activeTab, setActiveTab] = useState('Semua');

  // Logika Filter Data
  const filteredHistory = historyData.filter(item => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Aktif') return item.status === 'Aktif';
    if (activeTab === 'Selesai') return item.status === 'Selesai';
    if (activeTab === 'Dibatalkan') return item.status === 'Dibatalkan';
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
        {filteredHistory.length > 0 ? (
          filteredHistory.map((order) => {
            
            const service = getServiceInfo(order.type);
            const isCancelled = order.status === 'Dibatalkan';
            
            return (
              <article 
                key={order.id} 
                // Jika dibatalkan, warnanya agak memudar (opacity & grayscale)
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
                      <p className="font-body-sm text-[13px] text-text-secondary mt-0.5">{order.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-md font-label-mono text-[11px] uppercase tracking-wider font-bold border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Garis Rute (Timeline) */}
                <div className="flex flex-col gap-4 relative pl-1 mb-5">
                  {/* Garis disesuaikan ke left-[15px] karena ukuran ikon diperbesar */}
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
                    {/* Hapus mt-0.5 agar sejajar sempurna di tengah */}
                    <p className={`font-body-md text-[14px] ${isCancelled ? 'text-text-secondary line-through decoration-danger/50' : 'text-text-primary'}`}>
                      {order.pickup}
                    </p>
                  </div>

                  {/* Titik Tujuan */}
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
                    {/* Hapus mt-0.5 agar sejajar sempurna di tengah */}
                    <p className={`font-body-md text-[14px] ${isCancelled ? 'text-text-secondary line-through decoration-danger/50' : 'text-text-primary'}`}>
                      {order.destination}
                    </p>
                  </div>
                </div>

                {/* Bagian Bawah (Driver & Harga) */}
                <div className="flex justify-between items-end border-t border-outline-variant/30 pt-4">
                  {/* Info Bawah Kiri (Driver atau Info Batal) */}
                  {isCancelled ? (
                    <div className="flex items-center gap-2 text-text-secondary italic">
                       <span className="material-symbols-outlined text-[18px]">info</span>
                       <span className="font-body-sm text-[13px]">{order.cancelReason}</span>
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
                      <span className="font-body-sm text-[14px] text-text-secondary">{order.driver}</span>
                    </div>
                  )}

                  {/* Harga */}
                  <span className={`font-headline-sm text-[18px] font-bold ${isCancelled ? 'text-text-secondary line-through' : 'text-tertiary'}`}>
                    {order.price}
                  </span>
                </div>
              </article>
            );
          })
        ) : (
          /* Tampilan Jika Filter Kosong */
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-outline-variant/30 border-dashed">
             <span className="material-symbols-outlined text-5xl text-text-secondary mb-3">history</span>
             <p className="font-body-md text-text-secondary">Tidak ada riwayat pesanan.</p>
          </div>
        )}
      </div>

    </div>
  );
}