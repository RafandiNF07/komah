'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Email atau password salah');
        setLoading(false);
        return;
      }

      // Fetch user role from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        setError('Gagal memuat profil pengguna');
        setLoading(false);
        return;
      }

      // Redirect based on role using window.location.href to ensure middleware runs
      if (profile.role === 'driver') {
        window.location.href = '/driver';
      } else if (profile.role === 'customer') {
        window.location.href = '/user';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
  console.error(err);
  setError(err?.message || 'Terjadi kesalahan. Silakan coba lagi.');
  setLoading(false);
}
  };

  return (
    <main className="h-[100dvh] w-screen flex items-center justify-center p-4 md:p-8 bg-primary-container overflow-hidden">
      
      {/* Login Container */}
      <div className="relative z-10 w-full max-w-[900px]">

        {/* Login Card */}
        <div className="rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[550px] backdrop-blur-xl bg-surface-container/80 border border-white/5">

          {/* Left Side: Branding (Hanya muncul di Desktop) */}
          <div className="hidden md:flex md:w-5/12 bg-surface-container-high p-8 flex-col justify-center items-center text-center border-r border-outline-variant/30 relative">
            
            {/* Logo KOMAH di Pojok Kiri Atas */}
            <div className="absolute top-6 left-6">
              <Image
                src="/icons/logo.png"
                alt="Logo KOMAH"
                width={150} 
                height={150}
              />
            </div>

            <div className="mb-6 mt-8 flex justify-center">
              <Image 
                src="/icons/welcome_user.png" /* <--- Ganti dengan nama file gambarmu yang ada di folder public/icons/ */
                alt="Ikon login" 
                width={200} 
                height={200} 
                className="opacity-90 hover:opacity-100 transition-opacity" /* Opsional: Sedikit efek menyala saat disorot */
              />
            </div>
            <h2 className="font-headline-md text-[24px] text-text-primary mb-3">Selamat Datang</h2>
            <p className="font-body-sm text-[14px] text-text-secondary leading-relaxed px-4">
              Akses layanan transportasi mahasiswa UIN Suska Riau dalam satu genggaman.
            </p>

            {/* Hak Cipta di Pojok Kiri Bawah */}
            <div className="absolute bottom-6 left-0 right-0 text-center px-6">
              <p className="font-label-mono text-[12px] text-outline-variant opacity-60">
                © 2026 KOMAH UIN SUSKA RIAU. Kece &amp; Terpercaya.
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-6 md:p-12 flex flex-col justify-center bg-surface-container">
            
            {/* Logo Khusus Mobile (Muncul jika layar kecil) */}
            <div className="md:hidden flex justify-center mb-4">
              <Image
                src="/icons/logo.png"
                alt="Logo KOMAH"
                width={80}
                height={80}
              />
            </div>

            <div className="mb-6 text-center md:text-left">
              {/* TOMBOL KEMBALI */}
              <Link 
                href="/" /* <--- Ini adalah rute menuju Landing Page utama kamu */
                className="flex items-center gap-2 text-on-surface-variant hover:text-tertiary transition-colors mb-4 group font-body-sm mr-auto w-4"
              >
                {/* Ikon Panah Kembali menggunakan gambar lokal */}
                <Image 
                  src="/icons/back.png" /* <-- Pastikan nama file gambarnya sesuai (misal: back.png atau arrow-left.png) */
                  alt="kembali" 
                  width={20} 
                  height={20} 
                  // transition-transform & group-hover:-translate-x-1 membuat efek geser ke kiri tetap berfungsi!
                  className="transition-all duration-200 group-hover:-translate-x-1 opacity-70 group-hover:opacity-100" 
                />
                <span className="font-medium text-sm">Kembali</span>
              </Link>

              <h1 className="font-headline-md text-[24px] text-text-primary mb-2">Masuk ke Dashboard</h1>
              <p className="font-body-sm text-[14px] text-text-secondary">Silakan masukkan kredensial kampus Anda.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-[13px] font-body-sm text-center">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>

              {/* NIM / Email Input */}
              <div className="space-y-1.5">
                <label className="block mb-2 font-label-mono text-[14px] md:text-[16px] text-on-surface-variant ml-1" htmlFor="identity">
                  Email Students
                </label>
                <div className="relative flex items-center">
                  
                  {/* INI BAGIAN IKON GAMBARNYA */}
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Image 
                      src="/icons/email_login.png" /* <--- Pastikan nama file ini sesuai dengan yang ada di folder public/icons kamu */
                      alt="icon email" 
                      width={20} 
                      height={20} 
                      className="opacity-50" /* Memberikan efek agak redup (transparan) agar menyatu dengan warna placeholder teks */
                    />
                  </div>

                  <input
                    id="identity"
                    name="identity"
                    type="text"
                    autoComplete="username"
                    placeholder="nama@student.uin-suska.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // pl-12 (padding-left) berfungsi agar teks ketikan tidak menabrak gambar ikonmu
                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[15px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-mono text-[14px] md:text-[16px] text-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative flex items-center">
                  
                  {/* Ikon Kunci (Kiri) menggunakan gambar lokal */}
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <Image 
                      src="/icons/key.png" /* <-- Ganti dengan nama file gambar kuncimu */
                      alt="icon lock" 
                      width={22} 
                      height={22} 
                      className="opacity-50" /* Dibuat redup agar senada dengan teks placeholder */
                    />
                  </div>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[15px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                  
                  {/* Tombol Mata (Kanan) menggunakan gambar lokal */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan atau sembunyikan password"
                    className="absolute right-4 flex items-center opacity-50 hover:opacity-100 transition-opacity"
                  >
                    {/* Logika Ganti Gambar Mata */}
                    {showPassword ? (
                      <Image 
                        src="/icons/visibility_off.png" /* <-- Ganti dengan nama file gambar mata coret/silang */
                        alt="sembunyikan password" 
                        width={22} 
                        height={22} 
                      />
                    ) : (
                      <Image 
                        src="/icons/visibility.png" /* <-- Ganti dengan nama file gambar mata terbuka */
                        alt="tampilkan password" 
                        width={22} 
                        height={22} 
                      />
                    )}
                  </button>
                  
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-tertiary hover:bg-tertiary-fixed-dim text-on-tertiary font-bold rounded-xl shadow-lg shadow-tertiary/20 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,82,0.4)] active:scale-[0.98] transition-all duration-300 font-headline-sm text-[18px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
              </button>

            </form>

            {/* Registration Footer */}
            <div className="mt-6 text-center md:text-center">
              <p className="font-body-sm text-[14px] text-on-surface-variant">
                Belum punya akun?{' '}
                <Link href="/register" className="text-tertiary font-bold hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </div>

            {/* Hak Cipta Khusus Mobile (Karena card kiri disembunyikan di HP) */}
            <div className="md:hidden mt-8 text-center">
              <p className="font-label-mono text-[11px] text-outline-variant opacity-60">
                © 2026 KOMAH UIN SUSKA RIAU.
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}