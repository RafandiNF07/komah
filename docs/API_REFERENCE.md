# 🔌 Referensi API & Database - KOMAH

> **KOMAH** — Ojek Kampus Hemat & Aman  
> Dokumen ini menjelaskan seluruh endpoint API, fungsi RPC (Remote Procedure Call), skema database, pemicu (trigger), kebijakan keamanan RLS, serta integrasi API pihak ketiga dalam proyek KOMAH.

---

## Daftar Isi
1. [Route Handlers (API Upload)](#1-route-handlers-api-upload)
2. [Supabase Remote Procedure Calls (RPC)](#2-supabase-remote-procedure-calls-rpc)
3. [Database Triggers](#3-database-triggers)
4. [Skema Database (Tables & ENUMs)](#4-skema-database-tables--enums)
5. [Row Level Security (RLS) Policies](#5-row-level-security-rls-policies)
6. [Supabase Realtime](#6-supabase-realtime)
7. [Integrasi API Eksternal](#7-integrasi-api-eksternal)

---

## 1. Route Handlers (API Upload)

Aplikasi menggunakan Route Handlers Next.js (`app/api/upload/route.js`) untuk interaksi server-side yang aman dengan Cloudinary dalam mengelola foto profil.

### A. POST `/api/upload`
* **Deskripsi**: Mengunggah foto profil baru ke Cloudinary dan memperbarui kolom `avatar_url` pada tabel `profiles`.
* **Autentikasi**: Wajib (Validasi sesi Supabase menggunakan cookies).
* **Content-Type**: `multipart/form-data`
* **Payload (Body)**:
  * `foto` (File, Wajib): File gambar (JPEG, PNG, GIF, WEBP) dengan ukuran maksimal ~2MB.
  * `role` (string, Opsional): `'customer'` | `'driver'` (Default: `'customer'`). Menentukan sub-folder Cloudinary (`customer_profiles` atau `driver_profiles`).
* **Alur Kerja**:
  1. Validasi sesi aktif pengguna melalui cookie.
  2. Validasi tipe file (MIME type).
  3. Ambil `avatar_url` lama dari database.
  4. Hapus foto profil lama dari Cloudinary (jika ada).
  5. Unggah foto baru ke Cloudinary.
  6. Perbarui `avatar_url` di tabel `profiles` dengan URL baru.
* **Respons Sukses (200 OK)**:
  ```json
  {
    "imageUrl": "https://res.cloudinary.com/diuo4ukoo/image/upload/v1234567890/customer_profiles/user_id.png"
  }
  ```
* **Respons Error**:
  * `401 Unauthorized`: `"Akses ditolak. Silakan login terlebih dahulu."`
  * `400 Bad Request`: `"Format file tidak didukung..."` atau `"Tidak ada file yang diunggah."`
  * `500 Internal Server Error`: `"Gagal mengunggah foto profil di server."`

### B. DELETE `/api/upload`
* **Deskripsi**: Menghapus foto profil aktif pengguna dari Cloudinary dan mengubah nilai `avatar_url` pada database menjadi `NULL`.
* **Autentikasi**: Wajib.
* **Payload**: Tidak ada.
* **Alur Kerja**:
  1. Validasi sesi aktif pengguna.
  2. Ambil `avatar_url` saat ini dari tabel `profiles` secara langsung di sisi server (untuk keamanan).
  3. Jika `avatar_url` kosong, kembalikan status sukses.
  4. Hapus file dari Cloudinary menggunakan Public ID yang diparsing dari URL.
  5. Perbarui kolom `avatar_url` menjadi `NULL` di database.
* **Respons Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Foto profil berhasil dihapus."
  }
  ```
* **Respons Error**:
  * `401 Unauthorized`: `"Akses ditolak. Silakan login terlebih dahulu."`
  * `500 Internal Server Error`: `"Gagal menghapus foto profil di server."`

---

## 2. Supabase Remote Procedure Calls (RPC)

Fungsi database disimpan di sisi server (PostgreSQL plpgsql) untuk memastikan konsistensi transaksi data (atomic operations) dan mencegah *race conditions*.

### A. `take_order(order_uuid UUID)`
* **Tipe Kembalian**: `BOOLEAN`
* **Security**: `SECURITY DEFINER` (Dijalankan dengan hak akses pembuat fungsi, aman dari pembatasan RLS driver saat klaim).
* **Deskripsi**: Digunakan oleh Driver untuk mengambil pesanan yang berstatus mencari (`searching`). Mencegah dua driver mengambil pesanan yang sama secara bersamaan.
* **Logika**:
  ```sql
  UPDATE public.orders
  SET driver_id = auth.uid(), status = 'accepted'
  WHERE id = order_uuid AND driver_id IS NULL AND status = 'searching';
  ```
* **Contoh Pemanggilan (Javascript)**:
  ```javascript
  const { data: success, error } = await supabase
    .rpc('take_order', { order_uuid: 'uuid-pesanan' });
  ```

### B. `release_order(order_uuid UUID)`
* **Tipe Kembalian**: `BOOLEAN`
* **Security**: `SECURITY DEFINER`
* **Deskripsi**: Digunakan oleh Driver untuk membatalkan klaim/melepas pesanan yang sudah diterima sebelumnya agar kembali ke status mencari (`searching`).
* **Logika**:
  ```sql
  UPDATE public.orders
  SET driver_id = NULL, status = 'searching'
  WHERE id = order_uuid AND driver_id = auth.uid() AND status = 'accepted';
  ```
* **Contoh Pemanggilan (Javascript)**:
  ```javascript
  const { data: success, error } = await supabase
    .rpc('release_order', { order_uuid: 'uuid-pesanan' });
  ```

---

## 3. Database Triggers

### A. `trg_calculate_order_price` (BEFORE INSERT on `orders`)
* **Tujuan**: Proteksi harga sisi server untuk mencegah manipulasi tarif oleh client.
* **Logika Perhitungan**:
  * Jika tipe layanan adalah `'helper'`, maka harga diset ke harga minimum layanan helper (`Rp 5.000`), sisa pembayaran dinegosiasikan via WhatsApp.
  * Untuk layanan lainnya (`bike`, `delivery`, `food`), harga dihitung berdasarkan rumus:
    $$\text{Tarif} = \max(5000, \lceil\text{distance\_estimate}\rceil \times 2000)$$
* **SQL**:
  ```sql
  CREATE OR REPLACE FUNCTION public.calculate_order_price()
  RETURNS TRIGGER AS $$
  DECLARE
    base_price NUMERIC := 5000.00;
    price_per_km NUMERIC := 2000.00;
    helper_min_price NUMERIC := 5000.00;
    calculated_price NUMERIC;
  BEGIN
    IF NEW.type = 'helper' THEN
      NEW.total_price := helper_min_price;
    ELSE
      IF NEW.distance_estimate IS NULL OR NEW.distance_estimate <= 0 THEN
        NEW.total_price := base_price;
      ELSE
        calculated_price := CEIL(NEW.distance_estimate) * price_per_km;
        NEW.total_price := GREATEST(base_price, calculated_price);
      END IF;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

### B. `on_auth_user_created` (AFTER INSERT on `auth.users`)
* **Tujuan**: Otomatis membuat baris profil di tabel `profiles` sesaat setelah pengguna berhasil mendaftar melalui modul Auth Supabase.
* **SQL**:
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
      INSERT INTO public.profiles (id, full_name, email, phone_number, role, license_plate, vehicle_type)
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'), 
        COALESCE(new.email, ''), 
        COALESCE(new.raw_user_meta_data->>'phone_number', ''), 
        COALESCE(new.raw_user_meta_data->>'role', 'customer')::user_role,
        new.raw_user_meta_data->>'license_plate',
        new.raw_user_meta_data->>'vehicle_type'
      );
      RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

---

## 4. Skema Database (Tables & ENUMs)

### ENUMs
* **`user_role`**: `'customer'`, `'driver'`
* **`order_type`**: `'bike'`, `'delivery'`, `'helper'`, `'food'`
* **`order_status`**: `'searching'`, `'accepted'`, `'on_the_way'`, `'completed'`, `'cancelled'`

### Tabel: `profiles`
Tabel profil terhubung secara relasional 1-ke-1 dengan tabel default milik Supabase (`auth.users`).

| Nama Kolom | Tipe Data | Atribut & Constraint | Deskripsi |
|---|---|---|---|
| `id` | `UUID` | PK, REFERENCES `auth.users` ON DELETE CASCADE | ID unik sinkron dengan auth. |
| `full_name` | `TEXT` | `NOT NULL` | Nama lengkap pengguna. |
| `email` | `TEXT` | `NOT NULL` | Alamat email. |
| `phone_number` | `TEXT` | `NOT NULL`, `UNIQUE` | Nomor WhatsApp aktif. |
| `role` | `user_role` | `NOT NULL`, `DEFAULT 'customer'` | Peran pengguna. |
| `avatar_url` | `TEXT` | `NULL` | Tautan gambar foto profil (Cloudinary). |
| `license_plate` | `TEXT` | `NULL` | Plat nomor kendaraan (Wajib jika driver). |
| `vehicle_type` | `TEXT` | `NULL` | Merek/tipe kendaraan (Wajib jika driver). |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu pendaftaran akun. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu modifikasi terakhir profil. |

* **Constraint**: `CHECK (role = 'customer' OR (role = 'driver' AND license_plate IS NOT NULL AND vehicle_type IS NOT NULL))`

### Tabel: `orders`
Tabel transaksi pesanan utama di aplikasi KOMAH.

| Nama Kolom | Tipe Data | Atribut & Constraint | Deskripsi |
|---|---|---|---|
| `id` | `UUID` | PK, `DEFAULT gen_random_uuid()` | ID unik pesanan. |
| `order_number` | `TEXT` | `UNIQUE`, `NOT NULL`, `DEFAULT 'ORD-00000X'` | Nomor nota unik yang diurutkan oleh sequence. |
| `customer_id` | `UUID` | FK, REFERENCES `profiles.id` | Pengguna yang memesan. |
| `driver_id` | `UUID` | FK, REFERENCES `profiles.id` | Driver yang menerima pesanan (nullable). |
| `type` | `order_type` | `NOT NULL` | Jenis layanan pesanan. |
| `status` | `order_status` | `NOT NULL`, `DEFAULT 'searching'` | Tahapan status pesanan. |
| `total_price` | `NUMERIC` | `NOT NULL`, `CHECK >= 5000` | Tarif akhir pesanan (minimal Rp 5.000). |
| `distance_estimate` | `NUMERIC` | `NULL` | Perkiraan jarak rute (dalam km). |
| `notes` | `TEXT` | `NULL` | Catatan pesanan dari customer. |
| `pickup_location` | `TEXT` | `NOT NULL` | Alamat/nama titik penjemputan. |
| `pickup_lat` | `NUMERIC(9,6)` | `NOT NULL`, `CHECK -90 to 90` | Latitude titik penjemputan. |
| `pickup_lng` | `NUMERIC(9,6)` | `NOT NULL`, `CHECK -180 to 180` | Longitude titik penjemputan. |
| `destination_location` | `TEXT` | `NULL` (Dapat kosong jika Helper) | Alamat/nama titik tujuan. |
| `destination_lat` | `NUMERIC(9,6)` | `NULL`, `CHECK -90 to 90` | Latitude titik tujuan. |
| `destination_lng` | `NUMERIC(9,6)` | `NULL`, `CHECK -180 to 180` | Longitude titik tujuan. |
| `service_details` | `JSONB` | `DEFAULT '{}'::jsonb` | Metadata dinamis (contoh: detail makanan/barang). |
| `pickup_time` | `TIMESTAMPTZ` | `NOT NULL` | Tanggal dan jam penjemputan. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu pemesanan dibuat. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu modifikasi terakhir data pesanan. |

---

## 5. Row Level Security (RLS) Policies

ROW Level Security diaktifkan pada tabel `profiles` dan `orders` untuk membatasi akses baca/tulis data antar pengguna.

### Kebijakan Keamanan pada `profiles`
1. **"Authenticated users can view profiles"** (SELECT):
   * Hak Akses: Pengguna yang sudah login (`authenticated`).
   * Aturan: `USING (true)`. Diperlukan agar fitur pencarian data profil pengemudi oleh pelanggan (dan sebaliknya) melalui query JOIN relasional di sisi client dapat berjalan lancar.
2. **"Users update own profile"** (UPDATE):
   * Hak Akses: Pemilik akun saja.
   * Aturan: `USING (auth.uid() = id)`. Hanya user bersangkutan yang bisa mengedit datanya sendiri.

### Kebijakan Keamanan pada `orders`
1. **"Customers see own orders"** (SELECT):
   * Hak Akses: Pengguna pembuat pesanan.
   * Aturan: `USING (auth.uid() = customer_id)`.
2. **"Drivers see active or assigned orders"** (SELECT):
   * Hak Akses: Driver.
   * Aturan: `USING (status IN ('searching', 'cancelled') OR auth.uid() = driver_id)`. Driver dapat melihat pesanan baru yang sedang mencari pengemudi atau pesanan yang telah diklaim/ditugaskan kepada dirinya.
3. **"Customers create orders"** (INSERT):
   * Hak Akses: Pelanggan yang login.
   * Aturan: `WITH CHECK (auth.uid() = customer_id)`. Pengguna hanya boleh memesan atas nama dirinya sendiri.
4. **"Update own orders"** (UPDATE):
   * Hak Akses: Pelanggan pembuat atau Driver yang bertugas.
   * Aturan: `USING (auth.uid() = customer_id OR auth.uid() = driver_id)`.

---

## 6. Supabase Realtime

Aplikasi memanfaatkan sistem publikasi realtime Supabase untuk menyinkronkan status pesanan secara instan tanpa melakukan polling HTTP secara berulang.

### Publikasi
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### Flow Sinkronisasi Realtime:
1. **Driver Dashboard (`app/(dashboard)/driver/page.jsx`)**:
   Mendengarkan event `INSERT` dan `UPDATE` pada tabel `orders` untuk memunculkan daftar pesanan baru yang berstatus `searching` secara instan di peta radar dan daftar trip driver.
2. **Customer Order Status**:
   Mendengarkan event `UPDATE` pada data pesanan miliknya. Ketika status berubah dari `searching` menjadi `accepted` (karena diproses oleh fungsi `take_order` oleh pengemudi), tampilan halaman secara otomatis akan memunculkan informasi profil driver beserta tombol WhatsApp.

---

## 7. Integrasi API Eksternal

| Nama Layanan | Endpoint Utama | Penggunaan di KOMAH |
|---|---|---|
| **OSRM** (Open Source Routing Machine) | `https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}` | Menghitung jarak rute (km), estimasi durasi (menit), dan koordinat garis polyline rute untuk dirender di komponen peta. |
| **Nominatim** (Reverse Geocoding) | `https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}` | Menerjemahkan koordinat klik pin peta menjadi alamat tekstual nyata secara dinamis di form order. |
| **Nominatim** (Geocoding Search) | `https://nominatim.openstreetmap.org/search?format=json&q={query}` | Mencari koordinat lokasi berdasarkan kata kunci pencarian alamat yang diinputkan pengguna. |
| **Cloudinary** (SDK v2) | Server-side upload via API Cloud | Mengunggah foto profil, mengoptimasi ukuran file, dan menghapus gambar lama secara otomatis di sisi server. |
