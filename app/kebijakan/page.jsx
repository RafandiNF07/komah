'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function KebijakanPage() {
  const [activeTab, setActiveTab] = useState('tos'); // 'tos' atau 'privacy'

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 md:p-8 bg-primary-container relative overflow-hidden">
      
      {/* Background Decorative Circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-tertiary opacity-[0.03] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary opacity-[0.03] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[850px] space-y-6">
        
        {/* Header branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/icons/logo.png"
              alt="Logo KOMAH"
              width={110}
              height={110}
              className="object-contain"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="font-headline-md text-[28px] md:text-[32px] font-bold text-text-primary">
              Kebijakan <span className="text-tertiary">Layanan &amp; Privasi</span>
            </h1>
            <p className="font-body-sm text-[14px] text-text-secondary max-w-lg leading-relaxed">
              Komitmen Koperasi Mahasiswa UIN Suska Riau untuk keamanan, keterbukaan, dan kenyamanan bertransaksi di lingkungan kampus.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center border-b border-outline-variant/30 gap-6">
          <button
            onClick={() => setActiveTab('tos')}
            className={`pb-3 font-headline-sm text-[16px] md:text-[18px] font-bold transition-all border-b-2 ${
              activeTab === 'tos'
                ? 'text-tertiary border-tertiary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            Syarat &amp; Ketentuan Layanan (ToS)
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 font-headline-sm text-[16px] md:text-[18px] font-bold transition-all border-b-2 ${
              activeTab === 'privacy'
                ? 'text-tertiary border-tertiary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            Kebijakan Privasi
          </button>
        </div>

        {/* Content Box */}
        <div className="backdrop-blur-xl bg-surface-container/85 border border-outline-variant/30 rounded-[2rem] shadow-2xl p-6 md:p-8 space-y-6 min-h-[350px]">
          
          {activeTab === 'tos' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  1. Ketentuan Umum Penggunaan
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Platform KOMAH (Koperasi Mahasiswa) ojek kampus ini dibuat secara khusus dan eksklusif untuk memfasilitasi transaksi transportasi, pemesanan makanan, pengantaran barang, serta bantuan umum bagi segenap mahasiswa, staf, dan dosen di lingkungan kampus **UIN Suska Riau**. Penggunaan platform di luar wilayah operasional kampus tidak didukung secara penuh.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  2. Layanan Transaksi &amp; Tarif
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Tarif ojek (`Ride`), barang (`Delivery`), dan bantuan (`Helper`) dihitung secara otomatis dan transparan oleh sistem berdasarkan rute jalan riil dari peta OSRM per kilometer. Untuk layanan `KOMAH Food`, estimasi ongkos kirim dihitung berdasarkan jarak dari lokasi resto ke titik pengantaran makanan Anda. Harga makanan riil dibayarkan terpisah sesuai dengan nota/struk toko fisik yang diserahkan oleh driver.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  3. Tata Tertib Pelanggan &amp; Driver
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Sebagai bagian dari civitas akademika, baik Driver maupun Pelanggan diwajibkan untuk selalu mengutamakan nilai-nilai sopan santun Islam, etika berkendara yang aman (memakai helm bagi penumpang ojek), menjaga ketepatan waktu, dan berkomunikasi dengan baik melalui WhatsApp yang telah terverifikasi.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  4. Sistem Pembayaran &amp; Nota
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Pembayaran diselesaikan secara tunai langsung ke driver sesaat setelah layanan selesai dilakukan. Setelah pesanan selesai, pengguna berhak menerima struk digital formal berformat PDF yang dapat diunduh langsung di halaman riwayat transaksi untuk transparansi.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  1. Keamanan &amp; Penyimpanan Data Pribadi
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Kami mengumpulkan data sensitif seperti Nama Lengkap, Alamat Email Student (`@student.uin-suska.ac.id`), Nomor WhatsApp, serta Ciri &amp; Plat Nomor Kendaraan (khusus mitra driver). Semua data ini disimpan secara terenkripsi dengan aman dalam basis data **Supabase Postgres** dengan enkripsi JWT token tingkat lanjut.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  2. Penggunaan Data Lokasi GPS
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Aplikasi meminta izin lokasi GPS Anda saat mengakses fitur peta Leaflet. Data lokasi koordinat (pickup dan destination) diproses secara terisolasi dan hanya digunakan untuk menghitung estimasi jarak, durasi, serta menggambar rute jalan riil melalui Open Source Routing Machine (OSRM). Kami tidak melacak lokasi Anda di latar belakang (*background location tracking*) di luar sesi pemesanan aktif.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  3. Transparansi &amp; Pembagian Pihak Ketiga
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Koperasi Mahasiswa KOMAH berkomitmen penuh untuk **tidak akan pernah menjual, menyewakan, atau membagikan** data pribadi, nomor kontak, maupun riwayat transaksi Anda kepada pihak ketiga komersial di luar ekosistem operasional kampus UIN Suska Riau.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-headline-sm text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-tertiary block"></span>
                  4. Kontak Komunikasi Aktif
                </h3>
                <p className="font-body-sm text-[13px] md:text-[14px] text-text-secondary leading-relaxed pl-3.5">
                  Nomor WhatsApp Anda digunakan secara eksklusif oleh sistem untuk menghasilkan pintasan obrolan langsung (*direct chat link*) guna mempermudah driver dan pelanggan berkoordinasi mengenai detail penjemputan barang atau penumpang tanpa perantara.
                </p>
              </div>
            </div>
          )}

          {/* Action Back Button */}
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-tertiary hover:bg-tertiary-fixed-dim text-[#0a0a0a] font-bold rounded-xl shadow-lg transition-all duration-200 font-headline-sm text-[15px] flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              <Image src="/icons/back.png" alt="kembali" width={16} height={16} />
              Kembali Ke Halaman Sebelumnya
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest text-text-primary border border-outline-variant/50 font-bold rounded-xl shadow-md transition-all duration-200 font-headline-sm text-[15px] flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              Kembali ke Beranda Utama
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="font-label-mono text-[11px] text-text-secondary opacity-60 text-center">
          © 2026 KOPERASI MAHASISWA UIN SUSKA RIAU · HAK CIPTA DILINDUNGI
        </p>
      </div>
    </main>
  );
}
