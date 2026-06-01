# Cetak Biru Arsitektur Hybrid & Peta Navigasi Jalan (End-to-End Roadmap): Project KOMAH

Dokumen ini merancang rencana integrasi backend dan navigasi peta yang komprehensif untuk **seluruh proyek KOMAH hingga selesai**. Dokumen ini memperluas arsitektur **Hybrid (Client-Server)** Next.js dan merinci cara menggambar **rute jalan yang presisi (mengikuti jalan raya, bukan garis lurus)** menggunakan OSRM API dan Leaflet Polyline untuk **Pelanggan** dan **Driver**.

---

## 1. Spesifikasi Teknis Peta Navigasi Jalan (Real Street Routing)

Untuk menggambar rute jalan yang meliuk mengikuti jalan raya asli di dalam peta Leaflet, kita tidak bisa menggunakan garis lurus. Kita wajib mengambil data **geometri rute** dari OSRM API.

### A. Modifikasi API Request OSRM (`lib/osrm.js`)
Kita perlu mengubah parameter pemanggilan OSRM API agar mengembalikan koordinat geometris lengkap (`overview=full` dan `geometries=geojson`):

```javascript
// URL baru untuk mendapatkan koordinat jalan riil
const url = `${OSRM_BASE_URL}/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=geojson`;
```

Respon JSON dari OSRM akan memiliki struktur seperti ini:
```json
{
  "code": "Ok",
  "routes": [
    {
      "geometry": {
        "coordinates": [
          [101.3505, 0.4634], // [lng, lat]
          [101.3512, 0.4638],
          [101.3520, 0.4645]
        ],
        "type": "LineString"
      },
      "distance": 1250.4, // meter
      "duration": 180.2 // detik
    }
  ]
}
```

### B. Konversi Koordinat (GeoJSON ➔ Leaflet)
OSRM mengembalikan koordinat dalam format GeoJSON standar yaitu `[longitude, latitude]`. Namun, peta Leaflet di Next.js menggunakan format `[latitude, longitude]`. 

Kita harus membalik urutan koordinat tersebut di sisi Client sebelum digambar di peta:
```javascript
// Membalik urutan dari [lng, lat] menjadi [lat, lng] untuk Leaflet
const leafletCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
```

---

## 2. Rancang Bangun Komponen Peta Interaktif

### A. Sisi Pelanggan: `components/MapPicker.jsx` (Diperbarui)
Peta ini digunakan pelanggan saat memesan. Jika pelanggan menandai lokasi jemput dan tujuan, peta otomatis menggambar garis jalan raya berwarna biru.

```javascript
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
// ... import default icons ...

export default function MapPicker({ pickup, destination, routeCoords, onMapClick }) {
  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant h-[250px]">
      <MapContainer center={pickup?.position || [-0.4634, 101.3505]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Handler klik peta */}
        <MapEventsHandler onMapClick={onMapClick} />
        
        {/* Marker Jemput (Hijau) */}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        
        {/* Marker Tujuan (Merah) */}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}
        
        {/* Garis Jalan Mengikuti Jalan Raya (Bukan Garis Lurus) */}
        {routeCoords && routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
```

### B. Sisi Driver: `components/RouteMap.jsx` (Baru - Read-Only)
Peta ini ditampilkan di Dashboard Driver ketika driver menerima pesanan aktif. Peta ini otomatis membaca koordinat jemput & tujuan dari database dan menggambar rute navigasi jalan.

```javascript
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { calculateRoute } from '@/lib/osrm';

export default function RouteMap({ pickupLat, pickupLng, destinationLat, destinationLng }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouteGeometry = async () => {
      if (pickupLat && pickupLng && destinationLat && destinationLng) {
        try {
          // Panggil OSRM helper yang sudah dimodifikasi untuk return geometry
          const route = await calculateRoute(pickupLat, pickupLng, destinationLat, destinationLng);
          setRouteCoords(route.coordinates); // Koordinat yang sudah di-flip [lat, lng]
        } catch (err) {
          console.error("Gagal memuat geometri rute driver:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRouteGeometry();
  }, [pickupLat, pickupLng, destinationLat, destinationLng]);

  const center = [
    (parseFloat(pickupLat) + parseFloat(destinationLat)) / 2,
    (parseFloat(pickupLng) + parseFloat(destinationLng)) / 2
  ];

  if (loading) return <div className="h-[200px] bg-surface-container-high animate-pulse rounded-xl flex items-center justify-center text-text-secondary text-sm">Memuat peta rute...</div>;

  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant h-[200px] w-full">
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Penanda Lokasi Jemput */}
        <Marker position={[pickupLat, pickupLng]} icon={pickupIcon} />
        
        {/* Penanda Lokasi Tujuan */}
        <Marker position={[destinationLat, destinationLng]} icon={destinationIcon} />
        
        {/* Garis Jalan Raya */}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
```

---

## 3. Peta Jalan Seluruh Fase Integrasi (End-to-End Roadmap)

Di bawah ini adalah rencana kerja lengkap untuk mengubah sisa halaman aplikasi menjadi **Arsitektur Hybrid** dan mengintegrasikan peta rute jalan raya.

### Fase 4: Sisa Order Forms Pelanggan (Delivery, Food, Helper)
*   **Target**: Semua pemesanan menggunakan peta jalan rute OSRM dan pembayaran/order tercatat aman di server.

1.  **Antar Barang (Delivery Page)**:
    *   Pasang `MapPicker` untuk input titik ambil barang dan tujuan.
    *   Server Endpoint `/api/orders/create` memproses koordinat, menghitung rute, harga, dan melakukan insert ke database dengan `type: 'delivery'` dan metadata barang di `service_details: { recipient_name, package_description }`.
2.  **Pesan Makanan (Food Page)**:
    *   Peta digunakan untuk menentukan alamat antar pelanggan (tujuan). Titik ambil makanan (pickup) menggunakan data koordinat resto yang di-hardcode di sistem.
    *   Garis rute jalan ditarik dari koordinat resto ke rumah pelanggan.
    *   Tipe pesanan `type: 'food'`, data makanan disimpan di `service_details: { restaurant_name, food_items }`.
3.  **Bantuan Tugas (Helper Page)**:
    *   Hanya memerlukan satu koordinat pengerjaan tugas (pickup), tanpa titik tujuan.
    *   Peta menampilkan satu marker (lokasi kerja). Tanpa rute garis jalan. Tarif default diatur minimum Rp 5.000 (sesuai nego WA).
4.  **Dashboard Aktif Pelanggan (User Dashboard)**:
    *   Client melakukan query langsung ke database Supabase untuk mengecek pesanan dengan status `searching`, `accepted`, atau `on_the_way`.
    *   Jika ada, tampilkan *floating banner* detail pesanan aktif.

---

### Fase 5: Integrasi Peta & Ambil Order Sisi Driver
*   **Target**: Driver dapat melihat lokasi riil pesanan dalam rute jalan raya pada peta, serta mengambil pesanan secara *thread-safe*.

1.  **Daftar Pesanan Driver (`/driver/pesanan`)**:
    *   Tampilkan daftar pesanan bertipe `searching` dari Supabase.
    *   Setiap kartu pesanan dilengkapi dengan **Peta Rute Mini (RouteMap)** yang memperlihatkan jalur jalan raya yang harus dilalui jika driver mengambil pesanan tersebut.
2.  **Pengambilan Order Berbasis Server (Take Order)**:
    *   Ketika tombol "Ambil Order" ditekan, client menembak `/api/orders/take`.
    *   Server Next.js memanggil SQL RPC `take_order` Supabase untuk memvalidasi alokasi driver secara instan.
3.  **Dashboard Driver Aktif (`/driver`)**:
    *   Jika driver memiliki orderan aktif, tampilkan kartu pesanan yang berisi **RouteMap** interaktif secara real-time.
    *   Sediakan tombol **Hubungi Pelanggan** (Link WA instan) dan **Selesaikan Perjalanan** (menembak `/api/orders/complete` untuk memvalidasi status).

---

### Fase 6: Riwayat & Komunikasi WhatsApp
*   **Target**: Riwayat order menampilkan data dinamis dari Supabase dengan filter tab status yang berfungsi penuh.

1.  **Riwayat Pelanggan & Driver**:
    *   Client-side query ke Supabase menggunakan JOIN syntax untuk menarik data profil pelanggan/driver secara efisien.
    *   Filter tab (Semua, Berjalan, Selesai, Batal) menyaring data secara real-time berdasarkan kolom `status`.
2.  **Integrasi WhatsApp**:
    *   Membuat tombol chat WhatsApp yang menghasilkan URL dinamis (`wa.me/nomorterdaftar?text=...`) dengan pesan template yang mencantumkan *Order Number* untuk mempermudah negosiasi.

---

### Fase 7: Cetak Laporan PDF
*   **Target**: Ekspor laporan berformat bersih menggunakan `jspdf` dan `jspdf-autotable`.

1.  **Bukti Pembayaran Pelanggan (Receipt)**:
    *   Di halaman riwayat, jika status order `completed`, tampilkan tombol **Cetak Bukti**.
    *   Membuat dokumen PDF berlogo KOMAH yang berisi detail tanggal, rute, jarak, nama driver, plat kendaraan, dan total tarif.
2.  **Laporan Mingguan/Bulanan Driver (Earnings Report)**:
    *   Di halaman pendapatan driver, sediakan tombol **Export PDF**.
    *   Sistem mengekstrak daftar seluruh trip sukses driver dalam periode aktif, menghitung total pendapatan, tingkat pembatalan, lalu mendownloadnya dalam bentuk tabel laporan keuangan PDF.

---

## 4. Rencana Kerja Pengerjaan (Action Checklist)

- [ ] **Langkah 1**: Modifikasi `lib/osrm.js` agar mendukung pencarian rute geometris lengkap (`overview=full&geometries=geojson`) dan mengembalikan array koordinat `[lat, lng]`.
- [ ] **Langkah 2**: Buat endpoint server Next.js `/api/orders/create` untuk memproses dan memvalidasi order baru.
- [ ] **Langkah 3**: Integrasikan rute jalan raya interaktif pada halaman pemesanan Ojek ([ride/page.jsx](file:///home/rafa/Kuliah/WebPrograming/mogakelar/Project-KOMAH/app/(dashboard)/user/ride/page.jsx)) dan migrasikan agar menembak API `/api/orders/create`.
- [ ] **Langkah 4**: Integrasikan peta rute jalan raya dan endpoint API pada halaman sisa (Delivery, Food, Helper).
- [ ] **Langkah 5**: Buat komponen `components/RouteMap.jsx` untuk peta visual khusus Driver.
- [ ] **Langkah 6**: Integrasikan peta navigasi jalan pada dashboard Driver dan buat API `/api/orders/take` / `/api/orders/complete`.
- [ ] **Langkah 7**: Selesaikan fungsionalitas halaman Riwayat, WhatsApp chat generator, dan sistem Ekspor PDF.
