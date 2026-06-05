# ⚙️ Panduan Setup & Deploy - KOMAH

> **KOMAH** — Ojek Kampus Hemat & Aman  
> Panduan ini menjelaskan langkah demi langkah cara mengonfigurasi proyek KOMAH di lingkungan pengembangan lokal (*local development*) hingga peluncuran ke server produksi (*production deployment*).

---

## Prasyarat (Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah memasang:
* **Node.js** versi 18+ (Disarankan versi 20 LTS ke atas).
* **npm** (biasanya langsung terinstal bersama Node.js).
* Akun **Supabase** aktif (tingkat gratis/free-tier sudah cukup).
* Akun **Cloudinary** aktif (tingkat gratis/free-tier sudah cukup).
* Browser modern dengan izin akses layanan lokasi/GPS aktif.

---

## 1. Clone & Install Dependensi

Buka terminal Anda, lalu jalankan perintah berikut:

```bash
# Clone repository proyek (Ganti URL dengan link repo yang valid)
git clone <repo-url>

# Masuk ke direktori proyek (sesuaikan dengan nama folder hasil clone)
cd <repo-folder>

# Pasang seluruh dependensi yang diperlukan
npm install
```

### Ringkasan Dependensi Utama
Proyek ini dibangun menggunakan framework modern:
* **next**: `16.2.6` (Next.js dengan dukungan App Router)
* **react** & **react-dom**: `19.2.4`
* **@supabase/ssr** & **@supabase/supabase-js**: Integrasi otentikasi dan database Supabase sisi client & server.
* **cloudinary**: SDK untuk manajemen foto profil di sisi server.
* **leaflet** & **react-leaflet**: Peta interaktif berbasis Leaflet.
* **jspdf** & **jspdf-autotable**: Pembuatan laporan riwayat pendapatan driver dan struk pesanan secara dinamis dalam format PDF.
* **tailwindcss** & **@tailwindcss/postcss**: Framework styling v4.

---

## 2. Konfigurasi Environment Variables

Buat file baru bernama `.env.local` pada direktori utama (*root*) proyek, lalu isi dengan variabel berikut:

```env
# Supabase API Configuration (Dapat diakses di Sisi Client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# Cloudinary Configuration (Hanya Diakses di Sisi Server / Route Handlers)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> [!IMPORTANT]
> Jangan pernah mengunggah file `.env.local` ke repositori publik (seperti GitHub). File ini sudah terdaftar di `.gitignore`.
> Variabel dengan awalan `NEXT_PUBLIC_` akan diekspos ke browser client, sedangkan variabel `CLOUDINARY_` bersifat privat di server.

---

## 3. Setup Database (Supabase)

Aplikasi KOMAH bergantung pada struktur database relasional PostgreSQL di Supabase.

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Setelah proyek siap, buka menu **SQL Editor** pada menu sidebar kiri.
3. Klik **New Query**.
4. Salin seluruh skrip SQL yang ada pada berkas [DATABASE_SCHEMA.md](../desain/DATABASE_SCHEMA.md).
5. Klik tombol **Run** di bagian kanan bawah editor SQL.
6. Skrip ini akan otomatis membuat:
   * Tipe ENUM (`user_role`, `order_type`, `order_status`).
   * Tabel `profiles` dan `orders` beserta relasi dan kekangan (*constraint*).
   * Indeks performa database.
   * Trigger otomatis untuk update tanggal (`updated_at`), pendaftaran user baru (`handle_new_user`), dan proteksi harga sisi server (`calculate_order_price`).
   * Kebijakan Row Level Security (RLS).
   * Fungsi RPC (`take_order` dan `release_order`).
   * Mengaktifkan sinkronisasi realtime pada tabel `orders`.

---

## 4. Konfigurasi Cloudinary

Cloudinary digunakan untuk menyimpan foto profil pengguna dengan aman.

1. Masuk ke [Cloudinary Console](https://cloudinary.com).
2. Cari nilai **Cloud Name**, **API Key**, dan **API Secret** pada bagian atas dashboard utama Cloudinary Anda.
3. Salin nilai tersebut dan tempelkan ke variabel yang sesuai di dalam file `.env.local` proyek Anda.
4. Folder penyimpanan untuk customer (`customer_profiles/`) dan driver (`driver_profiles/`) akan dibuat otomatis oleh API saat pertama kali user mengunggah foto profil.

---

## 5. Menjalankan Server Pengembangan

Jalankan server lokal dengan perintah:

```bash
npm run dev
```

Buka browser Anda di alamat [http://localhost:3000](http://localhost:3000).

---

## 6. Struktur Rute Aplikasi (Routing)

Aplikasi ini menggunakan Next.js App Router dengan pemisah akses role:

| Rute Halaman | Hak Akses | Deskripsi |
|---|---|---|
| `/` | Publik | Landing page utama, pengenalan layanan KOMAH. |
| `/login` | Publik (Dialihkan jika sudah login) | Form login email & password. |
| `/register` | Publik | Pilihan peran pendaftaran (Pengguna vs Driver). |
| `/register/pengguna` | Publik | Form pendaftaran akun Customer. |
| `/register/driver` | Publik | Form pendaftaran akun Driver (dilengkapi plat nomor & tipe motor). |
| `/kebijakan` | Publik | Ketentuan layanan dan privasi aplikasi. |
| `/user` | Proteksi (Customer) | Dashboard utama pelanggan (menu pilihan layanan). |
| `/user/ride` | Proteksi (Customer) | Pemesanan ojek jemput/antar kampus. |
| `/user/delivery` | Proteksi (Customer) | Pengiriman barang/dokumen di area kampus. |
| `/user/food` | Proteksi (Customer) | Pemesanan makanan/minuman dari kantin. |
| `/user/helper` | Proteksi (Customer) | Pemesanan jasa bantuan umum (Helper). |
| `/user/history` | Proteksi (Customer) | Riwayat pesanan & unduh bukti struk PDF. |
| `/user/profile` | Proteksi (Customer) | Pengaturan akun dan unggah foto profil customer. |
| `/driver` | Proteksi (Driver) | Dashboard radar pesanan masuk bagi driver. |
| `/driver/pesanan` | Proteksi (Driver) | Informasi pesanan aktif yang sedang dijalankan & navigasi rute. |
| `/driver/history` | Proteksi (Driver) | Riwayat trip yang telah diselesaikan driver. |
| `/driver/pendapatan` | Proteksi (Driver) | Statistik penghasilan driver & unduh laporan PDF bulanan. |
| `/driver/profile` | Proteksi (Driver) | Pengaturan akun, kendaraan, dan foto profil driver. |

---

## 7. Middleware & Auth Guard

Akses ke rute dasbor dilindungi oleh file `middleware.js` di root proyek yang berjalan di level server:
* **Autentikasi**: Jika pengguna belum login mencoba mengakses `/user/*` atau `/driver/*`, sistem otomatis mengalihkan ke halaman `/login`.
* **Proteksi Silang Role**:
  * Pelanggan dengan role `customer` tidak diperbolehkan mengakses halaman `/driver/*`. Jika dipaksa masuk, middleware akan mengalihkan ke `/user`.
  * Driver dengan role `driver` tidak diperbolehkan mengakses halaman `/user/*`. Jika dipaksa masuk, middleware akan mengalihkan ke `/driver`.
* **Pengalihan Login**: Jika pengguna sudah login dan mencoba mengakses `/login` atau `/register`, mereka akan langsung dialihkan ke dasbor role masing-masing.

---

## 8. Skrip NPM Tersedia

Jalankan perintah ini di root proyek menggunakan terminal:

* `npm run dev`: Memulai server pengembangan lokal dengan fitur *Hot Reload*.
* `npm run build`: Membangun aset aplikasi versi produksi yang teroptimasi.
* `npm run start`: Menjalankan server aplikasi versi produksi yang sudah dibangun.
* `npm run lint`: Memvalidasi kode program menggunakan ESLint untuk deteksi error penulisan secara statis.

---

## 9. Panduan Deployment Produksi (Vercel)

Vercel adalah platform terbaik untuk meng-hosting aplikasi Next.js:

1. Buat repositori baru di GitHub/GitLab, lalu unggah proyek KOMAH Anda ke sana.
2. Buka dashboard [Vercel](https://vercel.com) dan hubungkan dengan akun git Anda.
3. Klik **Add New Project**, lalu pilih repositori proyek KOMAH.
4. Pada bagian **Environment Variables**, masukkan seluruh variabel lingkungan yang ada di file `.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   * `CLOUDINARY_CLOUD_NAME`
   * `CLOUDINARY_API_KEY`
   * `CLOUDINARY_API_SECRET`
5. Klik **Deploy**. Vercel akan otomatis mendeteksi konfigurasi Next.js, melakukan *build*, dan meluncurkan aplikasi Anda secara online.

> [!TIP]
> Domain asal gambar Cloudinary (`res.cloudinary.com`) telah dikonfigurasi di berkas `next.config.mjs` untuk mendukung fitur optimasi gambar `<Image />` bawaan Next.js tanpa kendala CORS.

---

## 10. Troubleshooting (Penyelesaian Masalah)

* **Error 500 saat mengunggah foto profil**:
  Periksa kembali variabel `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, dan `CLOUDINARY_API_SECRET` di `.env.local` atau dashboard deployment. Pastikan nilainya tepat dan tidak ada spasi tambahan.
* **Halaman blank / memuat terus setelah login**:
  Pastikan nilai `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` Anda diatur dengan benar dan Supabase project Anda tidak dalam keadaan ditangguhkan (*paused*).
* **Peta tidak muncul atau styling berantakan**:
  Pastikan koneksi internet stabil (Leaflet menarik library tile OSM secara online). CSS Leaflet wajib diimpor di komponen peta (`import 'leaflet/dist/leaflet.css'`).
* **OSRM gagal menghitung rute**:
  OSRM gratisan yang digunakan memiliki batas kuota. Jika OSRM offline, sistem KOMAH secara otomatis akan mengaktifkan *fallback* kalkulasi jarak garis lurus (formula Haversine) sehingga proses transaksi pesanan tidak terganggu.
