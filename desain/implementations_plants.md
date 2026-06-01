# Implementation Plan: Project KOMAH — Backend Integration

## Deskripsi

Project KOMAH adalah aplikasi Ojek Online kampus (UIN SUSKA) yang dibangun dengan Next.js 16 + Tailwind CSS v4. **Seluruh UI sudah selesai dibangun (~20 halaman)**, namun backend integration masih **0%** — semua data hardcoded, form tidak berfungsi, dan tidak ada koneksi ke Supabase.

Plan ini akan mengintegrasikan Supabase (Auth, Database, Storage) ke seluruh halaman yang ada **tanpa mengubah desain UI yang sudah jadi**.

### Status Saat Ini

| Area | UI | Backend |
|------|:--:|:-------:|
| Landing Page | ✅ | N/A |
| Login / Register | ✅ | ❌ |
| User Dashboard + 4 Order Forms | ✅ | ❌ (dummy) |
| User History & Profile | ✅ | ❌ (localStorage) |
| Driver Dashboard + Pesanan | ✅ | ❌ (dummy) |
| Driver History, Pendapatan, Profile | ✅ | ❌ (dummy) |
| Supabase Client | — | ❌ Belum ada |
| Auth Middleware | — | ❌ Belum ada |
| Leaflet Maps | ❌ | ❌ |
| OSRM Distance Calc | — | ❌ |
| PDF Export | UI ada | ❌ (jsPDF belum install) |

---

## User Review Required

> [!IMPORTANT]
> **Supabase Project**: Apakah project Supabase sudah dibuat? Jika sudah, saya butuh:
> - `NEXT_PUBLIC_SUPABASE_URL`
> - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
> - Konfirmasi SQL schema dari [DATABASE_SCHEMA.md](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/desain/DATABASE_SCHEMA.md) sudah dijalankan di SQL Editor Supabase

> [!IMPORTANT]
> **OSRM API**: Desain menyebut OSRM API untuk estimasi jarak. Apakah menggunakan:
> - OSRM public demo server (`router.project-osrm.org`) — gratis tapi rate-limited
> - Self-hosted OSRM instance
> - Atau alternatif lain (OpenRouteService, dll)?

> [!WARNING]
> **Driver Register Form**: Form register driver saat ini **tidak memiliki field** `Plat Nomor` dan `Jenis Kendaraan` — padahal database schema mewajibkannya (`CHECK constraint`). Field ini akan ditambahkan.

---

## Open Questions

1. **Storage Bucket**: Apakah perlu membuat bucket Supabase Storage untuk avatar/foto profil, atau cukup pakai Base64 di localStorage seperti saat ini?
2. **Email Verification**: Apakah perlu email verification setelah register, atau langsung aktif?
3. **Koordinat Default**: Apa koordinat default untuk center peta? (Kampus UIN SUSKA Riau: ~0.4634, 101.3505?)
4. **Tarif Formula**: Desain menyebut Rp 5.000 base + Rp 2.000/km. Apakah ini berlaku untuk semua tipe order, atau tiap tipe berbeda?

---

## Proposed Changes

### Fase 1: Setup Foundation (Dependencies & Supabase Client)

Install semua dependency yang dibutuhkan dan buat konfigurasi Supabase client.

---

#### [NEW] `.env.local`
- File environment variables untuk Supabase URL dan Anon Key
- Akan di-gitignore

#### [MODIFY] [package.json](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/package.json)
- Install dependencies:
  - `@supabase/supabase-js` — Supabase client
  - `@supabase/ssr` — Server-side Supabase client untuk Next.js
  - `leaflet` + `react-leaflet` — Peta interaktif
  - `jspdf` + `jspdf-autotable` — PDF export
- Total: 5 packages baru

#### [NEW] `lib/supabase/client.js`
- Browser-side Supabase client menggunakan `createBrowserClient` dari `@supabase/ssr`
- Dipakai di semua komponen `'use client'`

#### [NEW] `lib/supabase/server.js`
- Server-side Supabase client menggunakan `createServerClient` dari `@supabase/ssr`
- Dipakai di Server Components dan middleware

#### [NEW] `lib/constants.js`
- Konstanta: tarif base, tarif per-km, koordinat default kampus, OSRM endpoint
- Satu sumber kebenaran untuk semua kalkulasi harga

---

### Fase 2: Authentication System

Implementasi login, register, logout, dan route protection.

---

#### [NEW] `middleware.js` (root project)
- Protect routes `/user/*` dan `/driver/*` — redirect ke `/login` jika belum auth
- Redirect `/login` dan `/register` ke dashboard jika sudah auth
- Refresh session token otomatis
- Role-based redirect: customer → `/user`, driver → `/driver`

#### [MODIFY] [login/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(auth)/login/page.jsx)
- Ganti `e.preventDefault()` dengan `supabase.auth.signInWithPassword()`
- Tambah error handling (email/password salah)
- Tambah loading state pada tombol submit
- Redirect ke dashboard sesuai role setelah login berhasil
- Fetch profile dari tabel `profiles` untuk menentukan role

#### [MODIFY] [register/pengguna/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(auth)/register/pengguna/page.jsx)
- Ganti dummy `handleRegister` dengan `supabase.auth.signUp()` + `options.data`
- Kirim metadata: `full_name`, `phone_number`, `role: 'customer'`
- Tambah validasi: password match, format email, format nomor WA
- Tambah error handling dan loading state

#### [MODIFY] [register/driver/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(auth)/register/driver/page.jsx)
- **Tambah 2 field baru**: Plat Nomor Kendaraan, Jenis Kendaraan (dropdown/input)
- Ganti dummy handler dengan `supabase.auth.signUp()` + `options.data`
- Kirim metadata: `full_name`, `phone_number`, `role: 'driver'`, `license_plate`, `vehicle_type`
- Tambah validasi dan error handling

---

### Fase 3: Profile Integration

Ganti semua hardcoded name dan localStorage profile dengan data dari Supabase.

---

#### [NEW] `lib/hooks/useProfile.js`
- Custom hook `useProfile()` yang:
  - Fetch current user via `supabase.auth.getUser()`
  - Fetch profile dari tabel `profiles`
  - Return `{ profile, loading, error, refetch }`
- Dipakai oleh layout sidebar dan halaman profil

#### [MODIFY] [user/layout.js](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/layout.js)
- Ganti hardcoded "Lisa Harniati" dengan data dari `useProfile()`
- Ganti `localStorage` avatar dengan `profile.avatar_url` dari Supabase
- Implementasi `handleConfirmLogout` dengan `supabase.auth.signOut()`
- Tambah loading skeleton saat fetch profile

#### [MODIFY] [driver/layout.js](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/driver/layout.js)
- Sama seperti user layout: ganti hardcoded name, avatar, dan logout
- Ganti "Aqsya Aurora" dengan data dari `useProfile()`

#### [MODIFY] [user/profile/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/profile/page.jsx)
- Load data profil dari Supabase, bukan hardcoded
- Save perubahan profil dengan `supabase.from('profiles').update()`
- Upload foto profil ke Supabase Storage (opsional, tergantung jawaban Open Question)
- Tampilkan loading state dan success/error toast

#### [MODIFY] [driver/profile/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/driver/profile/page.jsx)
- Sama seperti user profile
- Tambah field display: Plat Nomor dan Jenis Kendaraan (read-only atau editable)

---

### Fase 4: Order System + Maps + Distance Calculation

Ini fase terbesar — integrasikan pemesanan dengan peta Leaflet, kalkulasi jarak OSRM, dan insert ke Supabase.

---

#### [NEW] `components/MapPicker.jsx`
- Komponen peta Leaflet untuk memilih lokasi (pickup & destination)
- Fitur:
  - Click pada peta untuk set marker
  - Reverse geocoding untuk nama lokasi (Nominatim API)
  - Marker draggable
  - Current location button (browser geolocation)
- Props: `onLocationSelect({ lat, lng, address })`
- Menggunakan dynamic import (`next/dynamic`) karena Leaflet tidak support SSR

#### [NEW] `lib/osrm.js`
- Fungsi `calculateRoute(pickupLat, pickupLng, destLat, destLng)`
- Call OSRM API untuk mendapatkan jarak (km) dan estimasi waktu
- Return `{ distance, duration }`

#### [NEW] `lib/pricing.js`
- Fungsi `calculatePrice(distance, orderType)`
- Formula: `Math.max(5000, Math.ceil(distance) * 2000)`
- Untuk helper: fixed Rp 5.000 minimum (harga final via nego WA)

#### [MODIFY] [user/ride/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/ride/page.jsx)
- Ganti text input lokasi dengan komponen `MapPicker`
- Kalkulasi jarak otomatis via OSRM saat kedua lokasi dipilih
- Kalkulasi harga otomatis berdasarkan jarak
- `handleOrder`:
  - `supabase.from('orders').insert(...)` sesuai [WORKFLOW_GUIDE](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/desain/WORKFLOW_GUIDE.md) §2
  - `type: 'bike'`, kirim koordinat, distance, price
  - Redirect ke `/user/history` setelah berhasil
- Tampilkan loading state dan error handling

#### [MODIFY] [user/delivery/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/delivery/page.jsx)
- Sama seperti ride: MapPicker, OSRM, auto-price
- `type: 'delivery'`
- `service_details: { recipient_name, package_description }`

#### [MODIFY] [user/food/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/food/page.jsx)
- MapPicker untuk lokasi pengantaran (tujuan saja, pickup = lokasi resto)
- `type: 'food'`
- `service_details: { restaurant_name, food_items }`
- Harga = ongkir saja (harga makanan dibayar terpisah, sesuai desain)

#### [MODIFY] [user/helper/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/helper/page.jsx)
- MapPicker untuk lokasi pengerjaan (pickup saja, tanpa destination)
- `type: 'helper'`
- `service_details: { task_description }`
- `total_price: 5000` (minimum, negosiasi via WA)
- `destination_*` fields = NULL

#### [MODIFY] [user/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/page.jsx)
- Ganti banner "Pesanan Aktif" hardcoded dengan query real:
  - `supabase.from('orders').select(...).in('status', ['searching','accepted','on_the_way'])`
- Tampilkan order aktif terbaru jika ada, atau sembunyikan banner

---

### Fase 5: Driver Dashboard + Take Order (RPC)

Integrasikan dashboard driver dengan data real dan implementasi sistem ambil pesanan anti-race-condition.

---

#### [MODIFY] [driver/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/driver/page.jsx)
- Ganti stats hardcoded dengan query real:
  - Pendapatan hari ini: `SUM(total_price)` WHERE `status = 'completed'` AND `driver_id = user.id` AND hari ini
  - Trip selesai hari ini: `COUNT(*)` filter sama
  - Total order minggu ini: `COUNT(*)` filter 7 hari terakhir
- Ganti order aktif hardcoded dengan query:
  - `supabase.from('orders').select('*, customer:profiles!customer_id(...)').eq('driver_id', user.id).in('status', ['accepted','on_the_way'])`
- Implementasi tombol "Selesaikan":
  - `supabase.from('orders').update({ status: 'completed' }).eq('id', orderId)`
- Implementasi WhatsApp link sesuai [WORKFLOW_GUIDE](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/desain/WORKFLOW_GUIDE.md) §5

#### [MODIFY] [driver/pesanan/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/driver/pesanan/page.jsx)
- Ganti `availableOrders` hardcoded dengan query real:
  - `supabase.from('orders').select('*, customer:profiles!customer_id(...)').eq('status', 'searching')`
- Implementasi "Ambil Pesanan" dengan **RPC `take_order`** (WAJIB, anti race condition):
  - `supabase.rpc('take_order', { order_uuid: orderId })`
  - Handle return `true` (berhasil) vs `false` (sudah diambil orang lain)
- Auto-refresh list setelah ambil pesanan
- Tambah real-time subscription (opsional): `supabase.channel('orders').on('postgres_changes', ...)` untuk auto-update saat ada order baru

#### [MODIFY] [driver/pendapatan/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/driver/pendapatan/page.jsx)
- Query pendapatan dari Supabase dengan filter waktu (hari/minggu/bulan)
- Kalkulasi total pendapatan, jumlah trip, tingkat penyelesaian dari data real
- Tabel transaksi dari query orders `WHERE driver_id = user.id AND status = 'completed'`

---

### Fase 6: History & WhatsApp Integration

Integrasikan riwayat pesanan dan fitur komunikasi.

---

#### [MODIFY] [user/history/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/history/page.jsx)
- Ganti `dummyOrders` dengan query real:
  - `supabase.from('orders').select('*, driver:profiles!driver_id(...)').eq('customer_id', user.id).order('created_at', { ascending: false })`
- Filter tabs berfungsi: filter berdasarkan `status`
- Implementasi "Hubungi Driver": WhatsApp link dengan template pesan + nomor order
- Implementasi "Batalkan Pesanan":
  - `supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)`
  - Hanya bisa jika `status = 'searching'`

#### [MODIFY] [driver/history/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/driver/history/page.jsx)
- Ganti `historyData` dengan query real:
  - `supabase.from('orders').select('*, customer:profiles!customer_id(...)').eq('driver_id', user.id).order('created_at', { ascending: false })`
- Filter tabs berfungsi berdasarkan `status`

---

### Fase 7: PDF Export

Implementasi cetak laporan dalam format PDF.

---

#### [NEW] `lib/pdf.js`
- Utility functions untuk generate PDF:
  - `generateOrderReceipt(order)` — Struk/bukti order untuk pelanggan
  - `generateDriverReport(orders, period)` — Rekap pendapatan driver
- Menggunakan `jsPDF` + `jspdf-autotable`
- Format: header KOMAH, detail order, tabel items, total harga, footer

#### [MODIFY] [user/history/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/history/page.jsx)
- Tambah tombol "Cetak Bukti" pada order `status = 'completed'`
- Panggil `generateOrderReceipt()` untuk download PDF

#### [MODIFY] [driver/pendapatan/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/driver/pendapatan/page.jsx)
- Implementasi tombol "Export PDF" yang sudah ada di UI
- Panggil `generateDriverReport()` dengan data dan filter periode aktif

---

## Verification Plan

### Automated Tests

Proyek ini tidak memiliki testing framework. Verifikasi dilakukan secara manual dan build check:

```bash
# Build check - pastikan tidak ada error
npm run build

# Lint check
npm run lint
```

### Manual Verification

Setiap fase diverifikasi sebelum lanjut ke fase berikutnya:

| Fase | Verifikasi |
|------|-----------|
| 1 | `npm run dev` berhasil, Supabase client bisa connect |
| 2 | Register → Login → Redirect ke dashboard sesuai role. Akses `/user` tanpa login → redirect ke `/login` |
| 3 | Nama dan foto profil tampil dari DB. Edit profil → data tersimpan ke Supabase |
| 4 | Peta Leaflet muncul, bisa pilih lokasi, jarak terhitung, harga otomatis, order tersimpan ke DB |
| 5 | Driver melihat order `searching`, ambil pesanan via RPC, order berpindah ke driver |
| 6 | Riwayat menampilkan data real, filter berfungsi, WhatsApp link berfungsi, batal order berfungsi |
| 7 | PDF terdownload dengan format benar untuk struk pelanggan dan rekap driver |

---

## Ringkasan File Changes

| Tipe | File | Fase |
|------|------|------|
| **NEW** | `.env.local` | 1 |
| **NEW** | `lib/supabase/client.js` | 1 |
| **NEW** | `lib/supabase/server.js` | 1 |
| **NEW** | `lib/constants.js` | 1 |
| **NEW** | `middleware.js` | 2 |
| **NEW** | `lib/hooks/useProfile.js` | 3 |
| **NEW** | `components/MapPicker.jsx` | 4 |
| **NEW** | `lib/osrm.js` | 4 |
| **NEW** | `lib/pricing.js` | 4 |
| **NEW** | `lib/pdf.js` | 7 |
| **MODIFY** | `package.json` | 1 |
| **MODIFY** | `app/(auth)/login/page.jsx` | 2 |
| **MODIFY** | `app/(auth)/register/pengguna/page.jsx` | 2 |
| **MODIFY** | `app/(auth)/register/driver/page.jsx` | 2 |
| **MODIFY** | `app/(dashboard)/user/layout.js` | 3 |
| **MODIFY** | `app/(dashboard)/driver/layout.js` | 3 |
| **MODIFY** | `app/(dashboard)/user/profile/page.jsx` | 3 |
| **MODIFY** | `app/(dashboard)/driver/profile/page.jsx` | 3 |
| **MODIFY** | `app/(dashboard)/user/page.jsx` | 4 |
| **MODIFY** | `app/(dashboard)/user/ride/page.jsx` | 4 |
| **MODIFY** | `app/(dashboard)/user/delivery/page.jsx` | 4 |
| **MODIFY** | `app/(dashboard)/user/food/page.jsx` | 4 |
| **MODIFY** | `app/(dashboard)/user/helper/page.jsx` | 4 |
| **MODIFY** | `app/(dashboard)/driver/page.jsx` | 5 |
| **MODIFY** | `app/(dashboard)/driver/pesanan/page.jsx` | 5 |
| **MODIFY** | `app/(dashboard)/driver/pendapatan/page.jsx` | 5, 7 |
| **MODIFY** | `app/(dashboard)/user/history/page.jsx` | 6, 7 |
| **MODIFY** | `app/(dashboard)/driver/history/page.jsx` | 6 |

**Total: 10 file baru, 18 file dimodifikasi**
