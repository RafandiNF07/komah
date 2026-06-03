'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { createClient } from '@/lib/supabase/client';

export default function RegisterDriverPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Clear cache on mount to prevent showing other users' avatars/data if any leftovers exist
  useEffect(() => {
    localStorage.removeItem('komah_profile_cache');
    localStorage.removeItem('komah_user_cache');
    localStorage.removeItem('driverProfilePic');
    localStorage.removeItem('userProfilePic');
  }, []);

  // Form fields
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [nomorWhatsApp, setNomorWhatsApp] = useState('');
  const [platNomor, setPlatNomor] = useState('');
  const [ciriKendaraan, setCiriKendaraan] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAgreed) {
      setError('Anda harus menyetujui syarat dan ketentuan terlebih dahulu.');
      return;
    }

    if (!platNomor.trim()) {
      setError('Plat nomor kendaraan wajib diisi.');
      return;
    }

    if (!ciriKendaraan.trim()) {
      setError('Ciri kendaraan wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: namaLengkap,
            phone_number: nomorWhatsApp,
            role: 'driver',
            license_plate: platNomor,
            vehicle_type: ciriKendaraan
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message || 'Gagal mendaftar. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      // Supabase auto-logs in the user. Sign out immediately to prevent auto-login & redirect
      await supabase.auth.signOut();
      localStorage.removeItem('komah_profile_cache');
      localStorage.removeItem('komah_user_cache');
      localStorage.removeItem('driverProfilePic');
      localStorage.removeItem('userProfilePic');

      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center p-3 md:p-6 bg-primary-container overflow-hidden">
      
      <div className="relative z-10 w-full max-w-[900px]">

        <div className="rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto backdrop-blur-xl bg-surface-container/80 border border-white/5">

          {/* SEKARANG DI KIRI: Branding (Hanya muncul di Desktop) */}
          {/* PERUBAHAN: border-l diubah menjadi border-r */}
          <div className="hidden md:flex md:w-5/12 bg-surface-container-high p-6 flex-col justify-center items-center text-center border-r border-outline-variant/30 relative">
            
            {/* Logo KOMAH dikembalikan ke pojok Kiri Atas */}
            <div className="absolute top-5 left-5">
              <Image
                src="/icons/logo.png"
                alt="Logo KOMAH"
                width={125} 
                height={125}
              />
            </div>

            <div className="mt-8 flex justify-center">
              <Image 
                src="/icons/bike.png" 
                alt="bike" 
                width={250} 
                height={250} 
              />
            </div>
            <h2 className="font-headline-md text-[20px] text-text-primary mb-2">Bergabung Bersama Kami</h2>
            <p className="font-body-sm text-[13px] text-text-secondary leading-relaxed px-2">
              Mulai hasilkan pendapatan dan jadilah pahlawan transportasi mahasiswa UIN Suska Riau.
            </p>

            <div className="absolute bottom-5 left-0 right-0 text-center px-4">
              <p className="font-label-mono text-[11px] text-outline-variant opacity-60">
                © 2026 KOMAH UIN SUSKA RIAU. Kece &amp; Terpercaya.
              </p>
            </div>
          </div>


          {/* SEKARANG DI KANAN: Form Pendaftaran */}
          <div className="flex-1 p-5 md:p-8 flex flex-col justify-center bg-surface-container">
            
            <div className="md:hidden flex justify-center mb-3">
              <Image 
                src="/icons/logo.png" 
                alt="Logo KOMAH" 
                width={70} 
                height={70} 
              />
            </div>

            <div className="mb-4 text-center md:text-left">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-on-surface-variant hover:text-tertiary transition-colors mb-3 group font-body-sm mr-auto w-fit"
              >
                <Image 
                  src="/icons/back.png" 
                  alt="kembali" 
                  width={18} 
                  height={18} 
                  className="transition-all duration-200 group-hover:-translate-x-1 opacity-70 group-hover:opacity-100" 
                />
                <span className="font-medium text-[13px]">Kembali</span>
              </button>

              <h1 className="font-headline-md text-[20px] md:text-[22px] text-text-primary mb-1">Daftar Akun Driver</h1>
              <p className="font-body-sm text-[13px] text-text-secondary">Silakan lengkapi data diri Anda di bawah ini.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-error-container/30 border border-error/30 text-error text-[12px] font-body-sm text-center">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-3 p-2.5 rounded-xl bg-tertiary/10 border border-tertiary/30 text-tertiary text-[12px] font-body-sm text-center">
                {success}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleRegister}>

              {/* Nama Lengkap Input */}
              <div className="space-y-1">
                <label className="block mb-1 font-label-mono text-[12px] md:text-[13px] text-on-surface-variant ml-1" htmlFor="fullname">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Image 
                      src="/icons/email_login.png" 
                      alt="icon email" 
                      width={16} height={16} 
                      className="opacity-50" 
                    />
                  </div>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                </div>
              </div>

              {/* Email Students Input */}
              <div className="space-y-1">
                <label className="block mb-1 font-label-mono text-[12px] md:text-[13px] text-on-surface-variant ml-1" htmlFor="email">
                  Email Students
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Image 
                      src="/icons/email2.png" 
                      alt="icon email" 
                      width={16} height={16} 
                      className="opacity-50" 
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="nama@student.uin-suska.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                </div>
              </div>

              {/* WhatsApp Input */}
              <div className="space-y-1">
                <label className="block mb-1 font-label-mono text-[12px] md:text-[13px] text-on-surface-variant ml-1" htmlFor="whatsapp">
                  Nomor WhatsApp
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Image 
                      src="/icons/call.png" 
                      alt="icon whatsapp" 
                      width={16} height={16} 
                      className="opacity-50" 
                    />
                  </div>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={nomorWhatsApp}
                    onChange={(e) => setNomorWhatsApp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                </div>
              </div>

              {/* Plat Nomor & Ciri Kendaraan - Layout Berdampingan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Plat Nomor Kendaraan Input */}
                <div className="space-y-1">
                  <label className="block mb-1 font-label-mono text-[12px] md:text-[13px] text-on-surface-variant ml-1" htmlFor="platNomor">
                    Plat Nomor Kendaraan
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center pointer-events-none">
                      <Image 
                        src="/icons/notes.png" 
                        alt="icon plat" 
                        width={16} 
                        height={16} 
                        className="opacity-50" 
                      />
                    </div>
                    <input
                      id="platNomor"
                      name="platNomor"
                      type="text"
                      required
                      placeholder="BM 1234 XX"
                      value={platNomor}
                      onChange={(e) => setPlatNomor(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                    />
                  </div>
                </div>

                {/* Ciri Kendaraan Input */}
                <div className="space-y-1">
                  <label className="block mb-1 font-label-mono text-[12px] md:text-[13px] text-on-surface-variant ml-1" htmlFor="ciriKendaraan">
                    Ciri Kendaraan
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center pointer-events-none">
                      <Image 
                        src="/icons/motor.png" 
                        alt="icon motor" 
                        width={16} 
                        height={16} 
                        className="opacity-50" 
                      />
                    </div>
                    <input
                      id="ciriKendaraan"
                      name="ciriKendaraan"
                      type="text"
                      required
                      placeholder="Contoh: Beat Hitam / Vario Putih"
                      value={ciriKendaraan}
                      onChange={(e) => setCiriKendaraan(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200"
                    />
                  </div>
                </div>

              </div>

              {/* Layout Berdampingan untuk Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Password Input */}
                <div className="space-y-1">
                  <label className="block mb-1 font-label-mono text-[12px] md:text-[13px] text-on-surface-variant ml-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center pointer-events-none">
                      <Image 
                        src="/icons/key.png" 
                        alt="icon lock" 
                        width={16} height={16} 
                        className="opacity-50" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 flex items-center opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? (
                        <Image 
                          src="/icons/visibility_off.png" 
                          alt="hide" 
                          width={18} height={18} 
                        />
                      ) : (
                        <Image 
                          src="/icons/visibility.png" 
                          alt="show" 
                          width={18} height={18} 
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <label className="block mb-1 font-label-mono text-[12px] md:text-[13px] text-on-surface-variant ml-1" htmlFor="confirmPassword">
                    Konfirmasi Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center pointer-events-none">
                      <Image 
                        src="/icons/key.png" 
                        alt="icon lock" 
                        width={16} height={16} 
                        className="opacity-50" 
                      />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 flex items-center opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {showConfirmPassword ? (
                        <Image 
                          src="/icons/visibility_off.png" 
                          alt="hide" 
                          width={18} height={18} 
                        />
                      ) : (
                        <Image 
                          src="/icons/visibility.png" 
                          alt="show" 
                          width={18} height={18} 
                        />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Checkbox Persetujuan (Diset untuk Driver) */}
              <div className="flex items-start gap-3 mt-3">
                <div className="flex items-center h-4">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    required
                    className="w-3.5 h-3.5 rounded border-outline-variant/50 bg-surface-container-high text-tertiary focus:ring-tertiary/30 focus:ring-2 transition-colors cursor-pointer"
                  />
                </div>
                <label htmlFor="terms" className="font-body-sm text-[12px] text-text-secondary cursor-pointer leading-tight">
                  Saya setuju mendaftar sebagai Driver dan mematuhi <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-tertiary underline font-bold hover:text-tertiary-fixed-dim inline-block">kebijakan privasi</button>.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-1 bg-tertiary hover:bg-tertiary-fixed-dim text-on-tertiary font-bold rounded-xl shadow-lg shadow-tertiary/20 hover:shadow-[0_0_15px_rgba(240,192,82,0.4)] hover:-translate-y-0.5 transform active:scale-[0.98] transition-all duration-200 font-headline-sm text-[15px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>

            </form>

            {/* Login Footer */}
            <div className="mt-4 text-center">
              <p className="font-body-sm text-[13px] text-on-surface-variant">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-tertiary font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-surface-container border border-outline-variant/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline-sm text-[18px] font-bold text-text-primary">Kebijakan Privasi KOMAH</h3>
              <button 
                type="button" 
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center transition-colors"
              >
                <Image src="/icons/close.png" alt="tutup" width={14} height={14} />
              </button>
            </div>
            <div className="font-body-sm text-[13px] text-text-secondary max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-outline-variant">
              <p className="font-bold text-text-primary">1. Pengumpulan Informasi</p>
              <p>Kami mengumpulkan data pribadi seperti nama lengkap, alamat email student, nomor WhatsApp, serta informasi kendaraan (untuk driver) guna kelancaran layanan ojek kampus.</p>
              <p className="font-bold text-text-primary">2. Penggunaan Layanan</p>
              <p>Lokasi GPS (koordinat pickup/tujuan) Anda digunakan secara eksklusif untuk perhitungan rute jalan nyata lewat OSRM dan pencarian driver terdekat secara real-time.</p>
              <p className="font-bold text-text-primary">3. Keamanan Data</p>
              <p>Akun dan data transaksi Anda dilindungi dengan enkripsi Supabase database terenkripsi. Kami berkomitmen untuk menjaga data pribadi Anda tetap aman di lingkungan kampus.</p>
              <p className="font-bold text-text-primary">4. Komunikasi Langsung</p>
              <p>Nomor WhatsApp digunakan oleh driver dan pelanggan untuk komunikasi langsung terkait penjemputan pesanan ojek atau barang.</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-2.5 bg-tertiary text-on-tertiary font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-sm"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}