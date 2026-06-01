# Ojek Online Web App - Project Documentation

## Deskripsi Proyek
Proyek ini adalah aplikasi web Ojek Online yang dibangun dalam waktu 1 minggu oleh tim beranggotakan 3 orang (1 Backend, 2 Frontend). Aplikasi ini melayani 4 jenis pesanan: Bike, Delivery, Helper, dan Food.

## Tech Stack
- **Frontend:** Next.js, Tailwind CSS, Leaflet (Maps), jsPDF / react-to-print (Cetak Laporan)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Routing/Estimasi:** OSRM API
- **Komunikasi:** Direct WhatsApp Link

## Fitur Utama
1. **Autentikasi:** Login dan Register menggunakan Email & Password via Supabase Auth.
2. **Role User:** Pelanggan dan Driver.
3. **Pemesanan:** 
   - **Bike:** Antar/jemput penumpang.
   - **Delivery:** Pengiriman barang.
   - **Food:** Pesanan makanan (harga makanan dibayar terpisah, ongkir dihitung by sistem).
   - **Helper:** Jasa bantuan dengan harga minimal Rp 5.000 (harga akhir via nego WA).
4. **Dashboard Driver:** Sistem "Antrean Pesanan" (Marketplace model) di mana driver memilih pesanan yang tersedia (`status = 'searching'`).
5. **Cetak Laporan:** Ekspor bukti order (struk) untuk pelanggan dan riwayat pekerjaan untuk driver dalam format PDF.

## Struktur Dokumentasi
- [Skema Database](./DATABASE_SCHEMA.md) - Rincian tabel, tipe data, RLS, dan RPC.
- [Panduan Workflow (Frontend & Backend)](./WORKFLOW_GUIDE.md) - Cara memanggil API Supabase, menggunakan RPC `take_order`, dan integrasi lainnya.
