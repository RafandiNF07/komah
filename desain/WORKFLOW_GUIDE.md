# Panduan Workflow (Untuk Tim Frontend)

Dokumen ini berisi panduan teknis bagaimana aplikasi Frontend (Next.js) harus berinteraksi dengan database Supabase, Maps, dan fitur lainnya.

## 1. Pendaftaran Pengguna (Sign Up)

Saat pengguna melakukan registrasi, pastikan mengirimkan `options.data` agar trigger Supabase otomatis membuat profil di tabel `profiles`.

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'student@example.com', // Validasi email dilakukan di FE
  password: 'password123',
  options: {
    data: {
      full_name: 'Budi Santoso',
      phone_number: '62812345678', // Format WA, tanpa '+'
      role: 'customer', // atau 'driver'
      // Hanya kirim field di bawah ini jika role == 'driver'
      license_plate: 'BM 1234 ABC',
      vehicle_type: 'Honda Vario'
    }
  }
});
```

## 2. Membuat Pesanan (Insert Order)

Pembuatan pesanan disesuaikan dengan `order_type`. Simpan detail spesifik ke dalam `service_details` (JSONB).

```javascript
const { data, error } = await supabase.from('orders').insert({
  customer_id: user.id, // ID pengguna saat ini
  type: 'food', // 'bike', 'delivery', 'helper', 'food'
  total_price: 25000, // Harus >= 5000
  distance_estimate: 5.2, // dalam KM
  
  pickup_location: 'Gedung Rektorat',
  pickup_lat: 0.463,
  pickup_lng: 101.350,
  destination_location: 'Kantin Fakultas',
  destination_lat: 0.465,
  destination_lng: 101.352,
  
  pickup_time: new Date().toISOString(),
  notes: 'Tolong cepat ya mas',
  
  // Masukkan data spesifik sesuai layanan
  service_details: {
    restaurant_name: "Ayam Geprek Kampus",
    food_items: ["2x Ayam Geprek", "1x Es Teh"]
  }
});
```

## 3. Menampilkan Pesanan / Riwayat (Join Data)

Untuk menampilkan nama dan telepon Customer/Driver di tabel order, gunakan Supabase Relational Query. Jangan panggil tabel profiles secara manual.

```javascript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    customer:profiles!customer_id (
      full_name,
      phone_number,
      avatar_url
    ),
    driver:profiles!driver_id (
      full_name,
      phone_number,
      license_plate,
      vehicle_type
    )
  `)
  .eq('status', 'completed'); // atau filter lainnya
```

## 4. Driver Menerima Pesanan (Wajib Pakai RPC!)

**SANGAT PENTING:** Jangan gunakan `supabase.from('orders').update(...)` untuk menerima pesanan guna mencegah _race condition_ (rebutan order). Gunakan fungsi RPC `take_order`.

```javascript
// orderId = id order (UUID)
const { data, error } = await supabase.rpc('take_order', {
  order_uuid: orderId
});

if (error) {
  console.error("Gagal ambil order:", error);
} else if (data === true) {
  console.log("Berhasil ambil order!");
} else {
  console.log("Order sudah diambil driver lain atau tidak valid.");
}
```

## 5. Direct WhatsApp Link

Karena pembayaran dan negosiasi dilakukan di luar sistem, sediakan tombol untuk langsung membuka WhatsApp partner transaksi.

```javascript
const phoneNumber = order.driver?.phone_number || order.customer?.phone_number;
const message = \`Halo, saya terkait pesanan Ojek Online dengan nomor \${order.order_number}...\`;
const waUrl = \`https://wa.me/\${phoneNumber}?text=\${encodeURIComponent(message)}\`;

// Buka link
window.open(waUrl, '_blank');
```

## 6. Cetak Laporan PDF

Gunakan library seperti `jspdf` atau `react-to-print` untuk mencetak invoice pelanggan atau riwayat driver.

- **Pelanggan:** Sediakan tombol "Cetak Bukti" pada pesanan dengan `status = 'completed'`.
- **Driver:** Sediakan filter tanggal di halaman Riwayat, lalu buat tabel rekap order (`status = 'completed'`) yang bisa diunduh sebagai PDF.
