'use client';

import Image from 'next/image';

// --- DATA DUMMY ORDERAN TERSEDIA (Murni hanya data, tanpa gambar dan warna) ---
const availableOrders = [
  {
    id: 1,
    type: 'ride', 
    typeLabel: 'Antar-Jemput',
    distance: '1.2 km',
    pickupLabel: 'Penjemputan',
    pickupLocation: 'Gedung Rektorat',
    destinationLabel: 'Tujuan',
    destinationLocation: 'Fakultas Tarbiyah',
    priceLabel: 'Estimasi Tarif',
    price: 'Rp 10.000',
    note: '"Tunggu di depan lobi utama ya Bang, saya pakai baju kemeja putih."',
  },
  {
    id: 2,
    type: 'food', 
    typeLabel: 'Titip Makan',
    distance: '2.5 km',
    pickupLabel: 'Restoran',
    pickupLocation: 'Kantin Utama Teknik',
    destinationLabel: 'Pengantaran',
    destinationLocation: 'Perpustakaan Pusat',
    priceLabel: 'Estimasi Pendapatan',
    price: 'Rp 15.000',
    note: '"Tolong sambalnya dipisah ya Bang, dan minta sendok plastiknya 2."',
  }
];

// --- LOGIKA PINTAR PENENTU TAMPILAN ---

// 1. Kamus Gambar
const getIconByType = (type) => {
  if (type === 'ride') return '/icons/bike.png';
  if (type === 'food') return '/icons/fast_food.png';
  return '/icons/notes.png'; 
};

// 2. Kamus Warna (Badge Style)
const getBadgeStyleByType = (type) => {
  if (type === 'ride') return 'bg-secondary-container/20 text-secondary border-secondary-container/50';
  if (type === 'food') return 'bg-tertiary/10 text-tertiary border-tertiary/30';
  // Warna default kalau tipenya tidak diketahui
  return 'bg-surface-variant text-text-secondary border-outline-variant'; 
};

export default function DriverOrdersPage() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8">
      
      {/* ================= HEADER ================= */}
      <div className="mb-6 border-b border-outline-variant/30 pb-4">
        <h1 className="font-headline-md text-[24px] md:text-[28px] font-bold text-text-primary">
          Orderan Tersedia
        </h1>
        <p className="font-body-md text-[14px] text-text-secondary mt-1">
          Cari penumpang di sekitar Anda
        </p>
      </div>

      {/* ================= GRID DAFTAR ORDERAN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        
        {availableOrders.length > 0 ? (
          availableOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 shadow-lg flex flex-col gap-4 hover:shadow-tertiary/10 hover:border-tertiary/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Bagian Atas Card (Badge & Jarak) */}
              <div className="flex justify-between items-start">
                
                {/* Badge Tipe Pesanan (Warna dan Icon dipanggil lewat fungsi) */}
                <span className={`px-3 py-1.5 rounded-md font-label-mono text-[12px] font-bold flex items-center gap-2 border ${getBadgeStyleByType(order.type)}`}>
                  <Image 
                    src={getIconByType(order.type)} 
                    alt={order.typeLabel} 
                    width={16} 
                    height={16} 
                    className="object-contain"
                  />
                  {order.typeLabel}
                </span>
                
                <span className="font-label-mono text-[13px] font-bold text-text-secondary bg-surface-container-high px-2 py-1 rounded">
                  {order.distance}
                </span>
              </div>

              {/* Garis Rute (Timeline) */}
              <div className="flex flex-col gap-3 mt-2 relative pl-1">
                <div className="absolute left-[13px] top-[24px] bottom-[24px] w-[2px] bg-outline-variant/40"></div>

                {/* Titik Awal */}
                <div className="flex items-start gap-4 relative z-10">
                  <Image 
                    src="/icons/jemput1.png" 
                    alt="jemput" 
                    width={20} 
                    height={20} 
                    className="object-contain mt-0.5 bg-surface-container"
                  />
                  <div>
                    <p className="font-body-sm text-[12px] text-text-secondary">{order.pickupLabel}</p>
                    <p className="font-body-md text-[14px] font-medium text-text-primary">{order.pickupLocation}</p>
                  </div>
                </div>

                {/* Titik Akhir */}
                <div className="flex items-start gap-4 relative z-10">
                  <Image 
                    src="/icons/tujuan.png" 
                    alt="tujuan" 
                    width={20} 
                    height={20} 
                    className="object-contain mt-0.5 bg-surface-container"
                  />
                  <div>
                    <p className="font-body-sm text-[12px] text-text-secondary">{order.destinationLabel}</p>
                    <p className="font-body-md text-[14px] font-medium text-text-primary">{order.destinationLocation}</p>
                  </div>
                </div>
              </div>

              {/* --- CATATAN DARI PEMESAN --- */}
              {order.note && (
                <div className="bg-surface-container-high rounded-xl p-3 border border-tertiary/20 flex gap-3 items-start mt-1">
                  <Image 
                    src="/icons/notes1.png" 
                    alt="notes" 
                    width={20} 
                    height={20} 
                    className="object-contain mt-0.5 bg-surface-container"
                  />
                  <div>
                    <p className="font-label-mono text-[11px] text-text-secondary mb-0.5">Catatan Tambahan</p>
                    <p className="font-body-sm text-[12px] text-text-primary italic">
                      {order.note}
                    </p>
                  </div>
                </div>
              )}

              {/* Harga & Tombol Ambil */}
              <div className="mt-auto flex flex-col gap-4 border-t border-outline-variant/30 pt-4">
                <div>
                  <p className="font-body-sm text-[12px] text-text-secondary mb-0.5">{order.priceLabel}</p>
                  <p className="font-headline-sm text-[20px] font-bold text-tertiary">{order.price}</p>
                </div>
                <button className="w-full bg-secondary-container text-on-secondary-container font-label-mono text-[14px] font-bold py-3.5 rounded-xl hover:bg-tertiary hover:text-on-tertiary shadow-md hover:shadow-tertiary/30 transition-all active:scale-95">
                  Ambil Pesanan
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-text-secondary bg-surface-container border border-outline-variant/30 rounded-2xl border-dashed">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-4 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary/20"></span>
              <span className="material-symbols-outlined text-4xl text-tertiary">radar</span>
            </div>
            <h3 className="font-headline-sm text-[18px] font-bold text-text-primary mb-1">Mencari Orderan...</h3>
            <p className="font-body-sm text-[14px]">Menunggu pelanggan di sekitar Anda.</p>
          </div>
        )}
      </div>

    </div>
  );
}