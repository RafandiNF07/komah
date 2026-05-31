'use client';

import Image from 'next/image';
import { useState } from 'react';

// --- DATA DUMMY RINCIAN PERJALANAN ---
const earningHistory = [
  {
    id: 1,
    date: '24 Okt 2024, 14:30',
    type: 'ride',
    typeLabel: 'Antar-Jemput',
    route: 'FST -> Perpus Pusat',
    distance: '1.2 km',
    price: 'Rp 15.000',
  },
  {
    id: 2,
    date: '24 Okt 2024, 11:15',
    type: 'food',
    typeLabel: 'Titip Makan',
    route: 'Kantin Fekon -> FEB',
    distance: '0.8 km',
    price: 'Rp 12.000',
  },
  {
    id: 3,
    date: '23 Okt 2024, 16:45',
    type: 'ride',
    typeLabel: 'Antar-Jemput',
    route: 'Gerbang Utama -> FDK',
    distance: '2.5 km',
    price: 'Rp 20.000',
  },
  {
    id: 4,
    date: '23 Okt 2024, 09:00',
    type: 'ride',
    typeLabel: 'Antar-Jemput',
    route: 'Kost Panam -> FST',
    distance: '3.1 km',
    price: 'Rp 25.000',
  },
];

// --- KAMUS TAMPILAN BADGE (Gambar & Warna) ---
const getBadgeStyleByType = (type) => {
  if (type === 'ride') return { icon: '/icons/bike.png', style: 'bg-secondary-container/20 text-secondary border-secondary-container/50' };
  if (type === 'food') return { icon: '/icons/fast_food.png', style: 'bg-tertiary/10 text-tertiary border-tertiary/30' };
  return { icon: '/icons/notes.png', style: 'bg-surface-variant text-text-secondary border-outline-variant' };
};


export default function DriverEarningsPage() {
  // State untuk filter waktu
  const [timeFilter, setTimeFilter] = useState('Minggu Ini');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 md:pb-8 relative">
      
      {/* ================= HEADER ================= */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-md text-[28px] md:text-[32px] font-bold text-text-primary">
            Laporan Pendapatan
          </h1>
          <p className="font-body-md text-[14px] text-text-secondary mt-1">
            Pantau penghasilan dan performa Anda.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Selector */}
          <div className="bg-surface-container-low p-1 rounded-xl flex border border-outline-variant/50">
            {['Hari Ini', 'Minggu Ini', 'Bulan Ini'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg font-label-mono text-[13px] transition-all duration-300 ${
                  timeFilter === filter 
                    ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Tombol Export (Desktop) */}
          <button className="hidden md:flex items-center gap-2 bg-transparent border-2 border-tertiary text-tertiary px-5 py-2 rounded-xl font-label-mono text-[13px] font-bold hover:bg-tertiary hover:text-on-tertiary transition-colors">
            <Image 
                src="/icons/pdf.png" 
                alt="pdf" 
                width={20} 
                height={20} 
                className="object-contain"
            />
            Export PDF
          </button>
        </div>
      </header>

      {/* ================= SUMMARY GRID (Bento Style) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        {/* Total Pendapatan */}
        <div className="bg-surface-container/50 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Image 
                src="/icons/wallet.png" 
                alt="wallet" 
                width={50} 
                height={50} 
                className="object-contain"
            />
          </div>
          <h3 className="font-label-mono text-[13px] text-text-secondary mb-2 relative z-10">Total Pendapatan</h3>
          <p className="font-headline-md text-[32px] font-bold text-tertiary relative z-10">Rp 1.250.000</p>
          <div className="mt-4 flex items-center gap-2 text-success font-body-sm text-[13px] relative z-10">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
            <span>+15% dari minggu lalu</span>
          </div>
        </div>

        {/* Total Trip */}
        <div className="bg-surface-container/50 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Image 
                src="/icons/rute.png" 
                alt="rute" 
                width={50} 
                height={50} 
                className="object-contain"
            />
          </div>
          <h3 className="font-label-mono text-[13px] text-text-secondary mb-2 relative z-10">Total Trip Selesai</h3>
          <p className="font-headline-md text-[32px] font-bold text-text-primary relative z-10">42 <span className="text-[16px] text-text-secondary font-normal">Trip</span></p>
          <div className="mt-4 flex items-center gap-2 text-text-secondary font-body-sm text-[13px] relative z-10">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Rata-rata 6 trip/hari</span>
          </div>
        </div>

        {/* Tingkat Penyelesaian (Menggantikan Rating & Bonus) */}
        <div className="bg-surface-container/50 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/20 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Image 
                src="/icons/check.png" 
                alt="check" 
                width={50} 
                height={50} 
                className="object-contain"
            />
          </div>
          <h3 className="font-label-mono text-[13px] text-text-secondary mb-2 relative z-10">Tingkat Penyelesaian</h3>
          
          <div className="flex items-end gap-1 relative z-10">
             <p className="font-headline-md text-[32px] font-bold text-text-primary">95</p>
             <p className="text-[20px] font-bold text-text-primary mb-1">%</p>
          </div>

          <div className="mt-4 flex flex-col gap-1.5 relative z-10">
             {/* Progress Bar Kecil */}
             <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
               <div className="bg-success h-1.5 rounded-full" style={{ width: '95%' }}></div>
             </div>
             <p className="text-text-secondary font-body-sm text-[12px] mt-1">42 selesai dari 44 pesanan masuk</p>
          </div>
        </div>

      </div>

      {/* ================= TABEL RINCIAN PERJALANAN ================= */}
      <div className="bg-surface-container rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30">
        <div className="p-5 border-b border-outline-variant/30">
          <h3 className="font-headline-sm text-[18px] font-bold text-text-primary">Riwayat Transaksi</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-high/50 text-text-secondary font-label-mono text-[13px] border-b border-outline-variant/30">
                <th className="p-4 font-bold">Tanggal</th>
                <th className="p-4 font-bold">Layanan</th>
                <th className="p-4 font-bold">Rute</th>
                <th className="p-4 font-bold">Jarak</th>
                <th className="p-4 font-bold text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-[14px] text-on-surface divide-y divide-outline-variant/20">
              {earningHistory.map((row) => {
                const badge = getBadgeStyleByType(row.type);
                return (
                  <tr key={row.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-4 text-text-secondary">{row.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border font-label-mono text-[11px] font-bold ${badge.style}`}>
                        <Image 
                          src={badge.icon} 
                          alt={row.typeLabel} 
                          width={14} 
                          height={14} 
                          className="object-contain"
                        />
                        {row.typeLabel}
                      </span>
                    </td>
                    <td className="p-4 text-text-primary">{row.route}</td>
                    <td className="p-4 text-text-secondary">{row.distance}</td>
                    <td className="p-4 font-headline-sm text-[16px] font-bold text-right text-tertiary">{row.price}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Tombol Muat Lebih Banyak */}
        <div className="p-4 border-t border-outline-variant/30 flex justify-center bg-surface-container-low/50">
          <button className="text-tertiary font-label-mono text-[13px] font-bold hover:underline flex items-center gap-1">
            <Image 
                src="/icons/more.png"
                alt="more" 
                width={18} 
                height={18} 
                className="material-symbols-outlined text-[18px]"
            />
            Muat Lebih Banyak
          </button>
        </div>
      </div>

      {/* ================= FAB (Floating Action Button) Mobile Export ================= */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-tertiary text-on-tertiary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50">
        <Image 
            src="/icons/pdf.png" 
            alt="pdf" 
            width={30} 
            height={30} 
            className="object-contain"
        />
      </button>

    </div>
  );
}