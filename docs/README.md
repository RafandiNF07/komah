# 📚 Pusat Dokumentasi KOMAH

> **KOMAH** — Ojek Kampus Hemat & Aman  
> Selamat datang di pusat dokumentasi teknis KOMAH. Di sini Anda akan menemukan panduan arsitektur, referensi API, dokumentasi komponen frontend, dan panduan pemasangan sistem.

---

## Daftar Dokumen Utama

Pusat dokumentasi KOMAH dibagi menjadi lima panduan utama sesuai kebutuhan peran Anda:

### 1. [🏗️ Panduan Arsitektur Sistem](ARCHITECTURE.md)
* **Target Pembaca**: Arsitek Perangkat Lunak, Pengembang Senior, Peninjau Keamanan.
* **Cakupan Isi**:
  * Gambaran umum sistem dan diagram arsitektur.
  * Alur data (*data flow*) untuk pemesanan trip dan pengelolaan profil.
  * Model keamanan, RLS, serta skema enkripsi/otentikasi.
  * Keputusan desain teknis (*Architecture Decision Records*).

### 2. [🔌 Referensi API & Database](API_REFERENCE.md)
* **Target Pembaca**: Pengembang Backend & Frontend.
* **Cakupan Isi**:
  * Spesifikasi Route Handlers (`POST` & `DELETE` `/api/upload`).
  * Supabase Remote Procedure Calls (RPC) untuk klaim dan lepas pesanan.
  * Skema tabel (`profiles`, `orders`) dan tipe ENUM database.
  * Kebijakan Row Level Security (RLS) serta trigger database PostgreSQL.
  * Integrasi API eksternal (OSRM, Nominatim, Cloudinary).

### 3. [🎨 Dokumentasi Komponen & Hooks](COMPONENTS.md)
* **Target Pembaca**: Pengembang Frontend & Desainer UI/UX.
* **Cakupan Isi**:
  * Penjelasan parameter/props komponen peta interaktif (`MapPicker` & `OrderMap`).
  * Cara kerja Custom Hook `useProfile` berbasis caching SWR.
  * Detail konstanta aplikasi dan helper formatting di `lib/constants.js`.
  * Utilitas kalkulasi harga, integrasi rute OSRM, serta generator laporan PDF.

### 4. [⚙️ Panduan Setup & Deployment](SETUP_GUIDE.md)
* **Target Pembaca**: Pengembang Baru, Tim DevOps/System Admin.
* **Cakupan Isi**:
  * Prasyarat pemasangan perangkat lunak lokal.
  * Konfigurasi berkas variabel lingkungan (`.env.local`).
  * Langkah inisialisasi skema database Supabase & Cloudinary.
  * Struktur lengkap sistem navigasi rute (*app routing*).
  * Panduan deployment otomatis siap pakai ke Vercel.

### 5. [🗺️ Panduan Aliran Data (Flow Explainer)](FLOW_EXPLAINER.md)
* **Target Pembaca**: Pengembang Junior & Anggota Tim Baru.
* **Cakupan Isi**:
  * Penjelasan alur interaksi UI hingga masuk database Supabase.
  * Cara kerja trigger proteksi tarif dan validasi Row Level Security (RLS).
  * Mekanisme sinkronisasi data instan via Supabase Realtime.
  * Penjelasan pencegahan *race conditions* menggunakan database RPC (`take_order`).

---

## Dokumentasi Pendukung (Preserved)

Dokumen asli bawaan proyek yang dipertahankan untuk referensi desain orisinal:
* **[README Utama Proyek](../README.md)**: Ringkasan serah terima pengembang (*developer handover*).
* **[DATABASE_SCHEMA.md](../desain/DATABASE_SCHEMA.md)**: File mentah skrip SQL inisialisasi tabel Supabase.
* **[WORKFLOW_GUIDE.md](../desain/WORKFLOW_GUIDE.md)**: Panduan integrasi client-side state.
* **[HYBRID_PLAN.md](../desain/HYBRID_PLAN.md)**: Rencana awal pengembangan modul hibrida.
* **[FLOW_EXPLAINER.md](../desain/FLOW_EXPLAINER.md)**: alur program dari ui hingga masuk ke database.
