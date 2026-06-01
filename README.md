# 🐝 KOMAH (Kece Ojek Mahasiswa) - Aplikasi Ride-Hailing & Layanan Kampus Terintegrasi

KOMAH adalah platform ride-hailing dan layanan mahasiswa terintegrasi berbasis web yang dirancang khusus untuk lingkungan kampus. Dikelola oleh Koperasi Mahasiswa, aplikasi ini memberdayakan mahasiswa dengan menyediakan empat pilar layanan utama (**Ride, Food, Helper, Delivery**) sekaligus memberikan peluang kerja bagi mahasiswa sebagai driver dengan sistem bagi hasil yang adil.

Aplikasi ini dibangun menggunakan **Next.js 16 (App Router)**, **Tailwind CSS v4** untuk desain visual premium berbasis *glassmorphism*, dan **Supabase** sebagai backend real-time.

---

## 🚀 Fitur Utama & Keunggulan Sistem

### 1. 🗺️ Unified Interactive Map (Leaflet & OSRM)
* **Peta Tunggal Multi-Marker (Dual Mode)**: Menggunakan satu peta tunggal interaktif berbasis **Leaflet** untuk menentukan titik jemput dan tujuan sekaligus pada layanan **Ride**, **Delivery**, dan **KOMAH Food**.
* **Integrasi KOMAH Food Premium**: Pengguna dapat menandai lokasi fisik **Restoran / Kantin** (Marker Hijau 🟢) dan **Titik Pengantaran Makanan** (Marker Merah 🔴) secara dinamis. Rute riil jalan serta estimasi ongkos kirim dihitung akurat berdasarkan lokasi restoran riil (bukan asumsi dari pusat kampus).
* **Draggable & Auto-Geocode**: Marker Hijau (Pickup) dan Merah (Destination) dapat digeser secara langsung di peta. Alamat fisik ter-geocode otomatis menggunakan reverse geocoding API **Nominatim (OpenStreetMap)** secara real-time.
* **OSRM Routing Engine**: Mengintegrasikan API **Open Source Routing Machine (OSRM)** secara dinamis untuk mengambil geometri jalan nyata, menggambar garis rute (*Polyline*) berwarna premium (`#F0C052`), dan mengalkulasi jarak serta durasi perjalanan secara akurat.
* **Fitur Auto-Bounds**: Peta secara cerdas mendeteksi jarak antar marker dan melakukan auto-zoom/center agar rute dan kedua marker selalu muat di dalam layar secara proporsional.

### 2. 🔐 Sistem Autentikasi, Multi-Role, & Kebijakan Privasi Interaktif
* **Dua Akses Peran Utama**: Terdiri dari peran **Customer (Pelanggan)** dan **Driver (Mitra Driver)**.
* **Keamanan Route Middleware**: Dilengkapi dengan `middleware.js` Next.js untuk memproteksi rute `/user/*` dan `/driver/*` secara ketat berdasarkan status login dan peran pengguna di database Supabase.
* **Profil Kustom & Media**: Menggunakan hook kustom `useProfile` untuk sinkronisasi profil, serta integrasi **Supabase Storage** untuk mengunggah dan memperbarui foto profil pengguna secara aman.
* **Interactive Privacy Modal**: Halaman registrasi Driver & Pelanggan dilengkapi dengan checkbox persetujuan kebijakan privasi yang terhubung ke **Glassmorphic Popup Modal**. Pengguna dapat membaca kebijakan layanan langsung di atas form pendaftaran tanpa teralihkan dari halaman.
* **Halaman Kebijakan Resmi (`/kebijakan`)**: Halaman kebijakan mandiri (`app/kebijakan/page.jsx`) dengan struktur bento-card tabbed UI untuk menelusuri **Syarat & Ketentuan Layanan (ToS)** serta **Kebijakan Privasi** secara utuh dan responsif, lengkap dengan tombol kembali cerdas.

### 3. 🛵 Pendaftaran Driver Teroptimasi & Identifikasi Cepat
* **Ciri Kendaraan (Text Input)**: Menggantikan sistem pilihan jenis kendaraan dropdown lama yang kaku. Driver kini dapat menuliskan ciri spesifik motor mereka secara bebas (contoh: *Beat Hitam / Vario Merah*) agar memudahkan mahasiswa mengenali driver di lapangan.
* **Ikon PNG Lokal Premium**: Menggantikan Google Material Symbols ligatures yang rentan gagal dimuat di browser dengan file gambar PNG tajam beresolusi tinggi di folder `/icons/` (seperti `/icons/notes.png` untuk Plat Nomor dan `/icons/motor.png` untuk ciri kendaraan).

### 4. ⚡ Sinkronisasi Real-Time & Transaksi Aman
* **Supabase Realtime Subscription**: Halaman riwayat order pelanggan dan daftar pesanan aktif driver terhubung langsung ke database Postgres melalui websocket. Status pesanan berubah secara instan (*Pending ➔ Accepted ➔ Completed/Cancelled*) tanpa perlu me-refresh halaman.
* **Race Condition Prevention**: Pengambilan order oleh driver diamankan menggunakan fungsi RPC Database (`take_order`) dengan transaksi Postgres terisolasi, memastikan satu order hanya bisa diambil oleh maksimal satu driver.
* **Estimasi Biaya Transparan**: Biaya perjalanan dihitung otomatis berdasarkan jarak tempuh rute jalan nyata per kilometer secara transparan.

### 5. 🖨️ Integrasi WhatsApp & Ekspor PDF / Laporan
* **Direct WhatsApp Messaging**: Sistem otomatis merangkum detail pesanan dan menyediakan tombol pesan langsung ke nomor WhatsApp driver atau pelanggan untuk mempermudah komunikasi penjemputan.
* **jsPDF Receipts**: Pelanggan dapat mengunduh struk bukti pembayaran formal berformat PDF langsung setelah pesanan selesai.
* **Driver Earning Statement**: Driver dapat mengekspor rekap bulanan pendapatan serta statistik performa mereka ke dalam file laporan PDF formal yang rapi.

---

## 🛠️ Stack Teknologi

* **Frontend Framework**: [Next.js 16.2.6 (App Router)](https://nextjs.org/)
* **Runtime / Compiler**: React 19.2.4 & Turbopack
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan CSS-first configuration & HSL dynamic palettes
* **Peta & Routing**: [Leaflet 1.9.4](https://leafletjs.org/), [React Leaflet 5.0.0](https://react-leaflet.js.org/), OpenStreetMap Nominatim, & OSRM API
* **Backend, Realtime, & Auth**: [Supabase Suite](https://supabase.com/) (Database Postgres, Realtime Sync, Auth, & Storage)
* **Dokumen Generator**: [jsPDF 4.2.1](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

---

## 📁 Struktur Direktori Penting

```bash
├── app/
│   ├── (auth)/             # Halaman Login & Registrasi (Driver & Pelanggan)
│   ├── (dashboard)/
│   │   ├── driver/         # Fitur Driver (Dashboard, Aktif Order, Pendapatan, Profil)
│   │   └── user/           # Fitur Pelanggan (Ride, Delivery, Food, Helper, History)
│   ├── kebijakan/          # Halaman Kebijakan Layanan & Privasi Resmi (ToS & Privacy)
│   ├── layout.js           # Layout global & inisialisasi styles
│   └── page.jsx            # Landing page utama KOMAH
├── components/
│   ├── MapPicker.jsx       # Komponen Peta Tunggal (Single & Dual mode dengan Leaflet)
│   └── ProfileComponent.jsx# Komponen pengaturan profil terintegrasi
├── desain/                 # Cetak biru database & panduan arsitektur sistem
│   ├── DATABASE_SCHEMA.md  # Schema lengkap SQL & Trigger untuk Supabase
│   └── HYBRID_PLAN.md      # Rencana arsitektur dan integrasi
├── lib/
│   ├── constants.js        # Konfigurasi global (Tarif per km, Leaflet center, dll.)
│   ├── osrm.js             # Service penghubung ke API Routing OSRM
│   └── supabase.js         # Klien Supabase untuk browser & server-side
├── public/
│   └── icons/              # Kumpulan aset icon lokal beresolusi tinggi (PNG)
├── middleware.js           # Gerbang proteksi rute halaman berbasis JWT Supabase
└── package.json            # Daftar dependensi dan script aplikasi
```

---

## ⚙️ Persiapan & Instalasi Lokal

### 1. Clone Project & Instal Dependensi
Pastikan Node.js v18+ sudah terinstal di komputer Anda.
```bash
git clone <repository-url>
cd Project-KOMAH
npm install
```

### 2. Konfigurasi Environment Variables (`.env.local`)
Buat file bernama `.env.local` di direktori utama (root) proyek dan isikan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Konfigurasi Database Supabase (Postgres)
Jalankan instruksi SQL yang berada di dalam [desain/DATABASE_SCHEMA.md](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/desain/DATABASE_SCHEMA.md) di SQL Editor Supabase Anda. Ini mencakup pembuatan tabel `profiles`, `orders`, konfigurasi RLS (Row Level Security), real-time replication, trigger pembuatan profil otomatis saat registrasi, serta fungsi RPC `take_order` (untuk mengamankan klaim pesanan aktif driver tanpa race conditions).

---

## 💻 Cara Menjalankan Aplikasi

### Mode Pengembangan (Development)
Jalankan server lokal dengan Next.js Turbopack compiler yang super cepat:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

### Cek Linter (Linting)
Gunakan eslint untuk memvalidasi kualitas penulisan kode:
```bash
npm run lint
```

### Build Produksi (Production)
Lakukan kompilasi optimal untuk kebutuhan server produksi:
```bash
npm run build
```
Setelah build selesai tanpa error, Anda bisa menjalankannya menggunakan:
```bash
npm run start
```

---

## 🎨 Desain Visual & UI Guidelines
Aplikasi ini menerapkan standar estetika yang sangat tinggi:
* **Glassmorphism UI**: Menggunakan gradasi warna harmonis, efek blur dinamis pada latar belakang (`backdrop-blur`), serta sudut border melingkar yang halus (`rounded-2xl`).
* **Sistem Icon Konsisten**: Sepenuhnya menggunakan kumpulan icon PNG kustom beresolusi tinggi di dalam folder `/icons/` untuk memastikan tampilan visual tetap premium dan tajam di layar mana pun, terhindar dari isu font ligature eksternal yang gagal dimuat.
* **Micro-Animations**: Dilengkapi dengan transisi hover halus, animasi pulsa untuk pemuatan alamat, serta animasi spinner interaktif saat menghitung rute.

---

## 👨‍💻 Kontribusi
Dikelola oleh Tim Koperasi Mahasiswa (KOMAH). Silakan diskusikan penambahan fitur atau perbaikan bug di panel Issue repositori sebelum mengirimkan Pull Request. Terima kasih!
