import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-container-margin overflow-hidden bg-pattern">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-display-lg text-[36px] md:text-[48px] md:leading-[56px] font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-white">
            Ojek Kampus Hemat & Aman untuk Mahasiswa UIN SUSKA
          </h1>
          <p className="font-body-lg text-[18px] text-text-secondary mb-10 max-w-2xl mx-auto">
            Solusi transportasi, makanan, dan kurir terpercaya di lingkungan kampus. Lebih cepat, lebih murah, dan pastinya Kece.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-tertiary text-on-tertiary px-8 py-4 rounded-full font-headline-sm text-[20px] hover:scale-95 transition-transform shadow-xl font-bold flex items-center justify-center">
              Pesan Sekarang
            </Link>
            <Link href="/register" className="bg-transparent border-2 border-tertiary text-tertiary px-8 py-4 rounded-full font-headline-sm text-[20px] hover:bg-tertiary hover:text-on-tertiary transition-all font-bold flex items-center justify-center">
              Daftar Jadi Driver
            </Link>
          </div>
        </div>
        {/* Abstract decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-secondary-container rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-tertiary rounded-full blur-3xl opacity-10"></div>
      </section>


      {/* About Section */}
<section className="py-20 px-container-margin bg-background relative overflow-hidden" id="tentang">
  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-tertiary/10 rounded-full blur-[120px] pointer-events-none"></div>

  <div className="max-w-4xl mx-auto relative z-10">
    <div className="text-center mb-10">
      <span className="font-label-mono text-[14px] text-tertiary uppercase tracking-[0.2em]">Tentang Kami</span>
      <h2 className="font-display-lg text-[28px] md:text-[36px] mt-3 font-bold text-text-primary">
        Apa Itu KOMAH?
      </h2>
    </div>

    <div className="space-y-6 text-justify">
      <p className="font-body-lg text-[16px] text-text-secondary leading-relaxed">
        <span className="font-bold text-tertiary">KOMAH (Kece Ojek Mahasiswa)</span> adalah
        layanan transportasi dan kurir berbasis website yang dibuat khusus untuk
        memenuhi kebutuhan sehari-hari mahasiswa UIN SUSKA RIAU. Berawal dari masalah
        sederhana — telat ke kelas, malas keluar mencari makan, atau butuh kirim tugas
        mendadak — KOMAH hadir sebagai solusi yang cepat, hemat, dan dapat diandalkan
        di lingkungan kampus.
      </p>

      <p className="font-body-md text-[16px] text-text-secondary leading-relaxed">
        Yang membuat KOMAH berbeda adalah seluruh driver-nya merupakan rekan
        mahasiswa dari kampus yang sama. Hal ini bukan hanya menciptakan rasa aman dan
        nyaman, tetapi juga membuka peluang penghasilan tambahan bagi mahasiswa yang
        ingin bergabung menjadi driver. Kami percaya transportasi kampus seharusnya
        terasa seperti dibantu oleh teman sendiri, bukan orang asing.
      </p>

      <p className="font-body-md text-[16px] text-text-secondary leading-relaxed">
        Dengan tarif yang transparan dan bersahabat untuk dompet mahasiswa, kemudahan
        memilih driver ikhwan atau akhwat, serta akses langsung lewat browser tanpa
        perlu mengunduh aplikasi berat, KOMAH berkomitmen menjadi sahabat perjalanan
        terpercaya bagi seluruh civitas UIN SUSKA RIAU. Lebih cepat, lebih murah, dan
        pastinya tetap kece.
      </p>
    </div>

    {/* Statistik singkat */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
      <div className="bg-surface-container-high rounded-xl p-6 text-center border border-outline-variant">
        <p className="font-display-lg text-[32px] font-bold text-tertiary">4</p>
        <p className="font-body-sm text-[14px] text-text-secondary mt-1">Layanan Utama</p>
      </div>
      <div className="bg-surface-container-high rounded-xl p-6 text-center border border-outline-variant">
        <p className="font-display-lg text-[32px] font-bold text-tertiary">Rp5.000</p>
        <p className="font-body-sm text-[14px] text-text-secondary mt-1">Tarif Mulai Dari</p>
      </div>
      <div className="bg-surface-container-high rounded-xl p-6 text-center border border-outline-variant">
        <p className="font-display-lg text-[32px] font-bold text-tertiary">100%</p>
        <p className="font-body-sm text-[14px] text-text-secondary mt-1">Driver Mahasiswa</p>
      </div>
    </div>
  </div>
</section>


      {/* Services Section */}
      <section className="py-20 px-container-margin bg-surface-container" id="layanan">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display-lg text-[28px] md:text-[36px] text-center mb-3 font-bold text-text-primary">Layanan Kami</h2>
                <span className="font-body-md text-[16px] text-text-secondary text-center mb-12 block">KOMAH(Kece Ojek Mahasiswa).</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/motor.png" 
                  alt="motor" 
                  width={40} 
                  height={40} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Antar/Jemput</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Tumpangan motor cepat ke kelas, kos, atau gerbang kampus. Tanpa telat.</p>
            </div>

            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/food.png" 
                  alt="food" 
                  width={35} 
                  height={35} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Food</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Pesan makanan dari luar langsung diantar ke tempatmu.</p>
            </div>

            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/delivery.png" 
                  alt="delivery" 
                  width={40} 
                  height={40} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Delivery</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Kirim dokumen, tugas, atau paket ringan dengan aman ke seluruh area kampus.</p>
            </div>

            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/helper.png" 
                  alt="helper" 
                  width={45} 
                  height={45} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Helper</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Jasa titip beli barang atau bantuan ringan lainnya sesuai kebutuhanmu.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-container-margin bg-background" id="keunggulan">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display-lg text-[28px] md:text-[36px] text-center mb-16 font-bold text-text-primary">Keunggulan KOMAH</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/rupiah.png" 
                  alt="rupiah" 
                  width={40} 
                  height={40} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Tarif Terjangkau</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Biaya perjalanan sangat bersahabat untuk dompet mahasiswa.</p>
            </div>

            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/mahasiswa.png" 
                  alt="mahasiswa" 
                  width={40} 
                  height={40} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Driver Mahasiswa</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Keamanan ekstra karena driver adalah rekan mahasiswa dari kampus yang sama.</p>
            </div>

            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/drivers.png" 
                  alt="drivers" 
                  width={35} 
                  height={35} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Request Ikhwan/Akhwat</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Bebas request driver laki-laki atau perempuan untuk kenyamanan perjalanan Anda.</p>
            </div>

            <div className="bg-surface-container-high rounded-xl p-card-padding shadow-xl hover:scale-95 hover:shadow-2xl transition-all border border-outline-variant group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
                <Image 
                  src="/icons/website.png" 
                  alt="website" 
                  width={35} 
                  height={35} 
                />
              </div>
              <h3 className="font-headline-md text-[24px] mb-2 font-bold text-text-primary">Order via Website</h3>
              <p className="font-body-sm text-[14px] text-text-secondary">Tidak perlu install aplikasi berat, cukup buka website langsung dari browser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarif Section */}
      <section className="py-24 px-container-margin relative overflow-hidden" id="tarif">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display-lg text-[28px] md:text-[36px] mb-12 font-bold text-text-primary tracking-tight">Tarif Transparan</h2>
          <div className="backdrop-blur-xl bg-surface-container-highest/40 border border-white/10 rounded-[32px] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] mx-auto transform transition-all duration-500 hover:shadow-tertiary/10 hover:border-tertiary/30 group max-w-3xl">
            <div className="space-y-2 mb-8">
              <p className="font-body-md text-[16px] text-gray-400 uppercase tracking-[0.2em]">Biaya Perjalanan</p>
              <div className="flex flex-col items-center gap-1">
                <span className="font-body-sm text-[14px] text-text-secondary">Mulai dari</span>
                <span className="font-display-lg text-[56px] leading-none font-bold text-[#E8B84B] drop-shadow-sm">Rp5.000</span>
                <span className="font-body-sm text-[14px] text-gray-400 mt-1">Setiap +1km tambah Rp2.000</span>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant to-transparent mb-10"></div>
            <div className="grid grid-cols-1 gap-6 mb-12 text-left">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors group-hover:bg-white/[0.08]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Image 
                  src="/icons/check.png" 
                  alt="helper" 
                  width={25} 
                  height={25} 
                />
                </div>
                <span className="font-body-md text-[16px] text-text-primary">Tanpa biaya tersembunyi</span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors group-hover:bg-white/[0.08]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Image 
                  src="/icons/lokasi1.png" 
                  alt="lokasi1" 
                  width={25} 
                  height={25} 
                />
                </div>
                <span className="font-body-md text-[16px] text-text-primary">Tarif menjangkau area luar & dalam kampus</span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors group-hover:bg-white/[0.08]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Image 
                  src="/icons/money.png" 
                  alt="money" 
                  width={25} 
                  height={25} 
                />
                </div>
                <span className="font-body-md text-[16px] text-text-primary">Bayar tunai</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}