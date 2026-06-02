'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { generateDriverReport } from '@/lib/pdf';
import { formatRupiah, formatDate, ORDER_TYPES } from '@/lib/constants';
import { orderService } from '@/lib/services/orderService';
import { translateError } from '@/lib/errors/errorHandler';

// --- KAMUS TAMPILAN BADGE (Gambar & Warna) ---
const getBadgeStyleByType = (type) => {
  if (type === 'bike') return { icon: '/icons/bike.png', style: 'bg-secondary-container/20 text-secondary border-secondary-container/50' };
  if (type === 'food') return { icon: '/icons/fast_food.png', style: 'bg-tertiary/10 text-tertiary border-tertiary/30' };
  if (type === 'delivery') return { icon: '/icons/delivery2.png', style: 'bg-purple/10 text-purple border-purple/30' };
  if (type === 'helper') return { icon: '/icons/helper.png', style: 'bg-success/10 text-success border-success/30' };
  return { icon: '/icons/notes.png', style: 'bg-surface-variant text-text-secondary border-outline-variant' };
};

export default function DriverEarningsPage() {
  const { user } = useProfile();
  const userId = user?.id;
  
  // State untuk filter waktu
  const [timeFilter, setTimeFilter] = useState('Minggu Ini');
  
  // State data
  const [orders, setOrders] = useState([]);
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchEarningsData = useCallback(async () => {
    if (!userId) return;

    if (orders.length === 0) {
      setLoading(true);
    }
    
    try {
      const data = await orderService.fetchEarningsData(userId, timeFilter);
      setOrders(data.completedOrders || []);
      setCompletionStats(data.completionStats);
    } catch (err) {
      const appError = translateError(err);
      setFeedback({ type: appError.severity, message: appError.message });
    } finally {
      setLoading(false);
    }
  }, [userId, timeFilter, orders.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEarningsData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEarningsData]);

  const totalEarnings = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const completionRate = completionStats.total > 0 
    ? Math.round((completionStats.completed / completionStats.total) * 100) 
    : 100;

  const handleExportPDF = () => {
    if (orders.length === 0) {
      setFeedback({ type: 'error', message: 'Tidak ada data transaksi untuk diexport pada periode ini.' });
      return;
    }
    generateDriverReport(orders, timeFilter);
  };

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
          <button 
            onClick={handleExportPDF}
            className="hidden md:flex items-center gap-2 bg-transparent border-2 border-tertiary text-tertiary px-5 py-2 rounded-xl font-label-mono text-[13px] font-bold hover:bg-tertiary hover:text-on-tertiary transition-colors"
          >
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
          <p className="font-headline-md text-[32px] font-bold text-tertiary relative z-10">
            {formatRupiah(totalEarnings)}
          </p>
          <div className="mt-4 flex items-center gap-2 text-success font-body-sm text-[13px] relative z-10">
            <Image 
              src="/icons/rupiah.png" 
              alt="rupiah" 
              width={16} 
              height={16} 
              className="object-contain opacity-80" 
            />
            <span>Periode {timeFilter}</span>
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
          <p className="font-headline-md text-[32px] font-bold text-text-primary relative z-10">
            {orders.length} <span className="text-[16px] text-text-secondary font-normal">Trip</span>
          </p>
          <div className="mt-4 flex items-center gap-2 text-text-secondary font-body-sm text-[13px] relative z-10">
            <Image 
              src="/icons/time.png" 
              alt="time" 
              width={16} 
              height={16} 
              className="object-contain opacity-60" 
            />
            <span>Rata-rata trip aktif</span>
          </div>
        </div>

        {/* Tingkat Penyelesaian */}
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
             <p className="font-headline-md text-[32px] font-bold text-text-primary">{completionRate}</p>
             <p className="text-[20px] font-bold text-text-primary mb-1">%</p>
          </div>

          <div className="mt-4 flex flex-col gap-1.5 relative z-10">
             <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
               <div className="bg-success h-1.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
             </div>
             <p className="text-text-secondary font-body-sm text-[12px] mt-1">
               {completionStats.completed} selesai dari {completionStats.total} total trip ditugaskan
             </p>
          </div>
        </div>

      </div>

      {/* ================= TABEL RINCIAN PERJALANAN ================= */}
      <div className="bg-surface-container rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30">
        <div className="p-5 border-b border-outline-variant/30">
          <h3 className="font-headline-sm text-[18px] font-bold text-text-primary">Riwayat Transaksi</h3>
        </div>
        
        <div className="overflow-x-auto">
          {!loading ? (
            orders.length > 0 ? (
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
                  {orders.map((row) => {
                    const badge = getBadgeStyleByType(row.type);
                    return (
                      <tr key={row.id} className="hover:bg-surface-container-high/30 transition-colors">
                        <td className="p-4 text-text-secondary">{formatDate(row.created_at)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border font-label-mono text-[11px] font-bold ${badge.style}`}>
                            <Image 
                              src={badge.icon} 
                              alt={row.type} 
                              width={14} 
                              height={14} 
                              className="object-contain"
                            />
                            {ORDER_TYPES[row.type]?.label || row.type}
                          </span>
                        </td>
                        <td className="p-4 text-text-primary truncate max-w-[250px]" title={`${row.pickup_location} -> ${row.destination_location || '-'}`}>
                          {row.pickup_location} {row.destination_location ? `-> ${row.destination_location}` : ''}
                        </td>
                        <td className="p-4 text-text-secondary">
                          {row.distance_estimate ? `${row.distance_estimate} km` : '-'}
                        </td>
                        <td className="p-4 font-headline-sm text-[16px] font-bold text-right text-tertiary">
                          {formatRupiah(row.total_price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-[14px] text-text-secondary">
                Tidak ada transaksi pada periode ini.
              </div>
            )
          ) : (
            <div className="p-8 text-center text-[14px] text-text-secondary">
              Memuat data transaksi...
            </div>
          )}
        </div>
      </div>

      {/* ================= FAB (Floating Action Button) Mobile Export ================= */}
      <button 
        onClick={handleExportPDF}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-tertiary text-on-tertiary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50"
      >
        <Image 
          src="/icons/pdf.png" 
          alt="pdf" 
          width={30} 
          height={30} 
          className="object-contain"
        />
      </button>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-[500] px-4 py-3 rounded-xl shadow-lg text-[13px] font-label-mono transition-all duration-300 ${
          feedback.type === 'success' ? 'bg-success/90 text-on-tertiary' : 'bg-cancel/90 text-on-tertiary'
        }`}>
          {feedback.message}
        </div>
      )}

    </div>
  );
}