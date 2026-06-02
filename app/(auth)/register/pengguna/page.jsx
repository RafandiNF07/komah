'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerCustomerSchema } from '@/lib/validators/schemas';
import { translateError } from '@/lib/errors/errorHandler';

export default function RegisterPelangganPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerCustomerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      whatsappNumber: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    if (!isAgreed) {
      setError('Anda harus menyetujui syarat dan ketentuan terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone_number: data.whatsappNumber,
            role: 'customer'
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message || 'Gagal mendaftar. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const appError = translateError(err);
      setError(appError.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center p-3 md:p-6 bg-primary-container overflow-hidden">
      
      <div className="relative z-10 w-full max-w-[900px]">

        <div className="rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto backdrop-blur-xl bg-surface-container/80 border border-white/5">

          {/* SEKARANG DI KIRI: Form Pendaftaran */}
          <div className="flex-1 p-5 md:p-8 flex flex-col justify-center bg-surface-container">
            
            <div className="md:hidden flex justify-center mb-3">
              <Image src="/icons/logo.png" alt="Logo KOMAH" width={70} height={70} />
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

              <h1 className="font-headline-md text-[20px] md:text-[22px] text-text-primary mb-1">Daftar Akun Pelanggan</h1>
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

            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>

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
                      width={16} 
                      height={16} 
                      className="opacity-50" 
                    />
                  </div>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    {...register('fullName')}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-error mt-0.5 ml-1">{errors.fullName.message}</p>}
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
                      width={16} 
                      height={16} 
                      className="opacity-50" 
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@student.uin-suska.ac.id"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-error mt-0.5 ml-1">{errors.email.message}</p>}
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
                      width={16} 
                      height={16} 
                      className="opacity-50" 
                    />
                  </div>
                  <input
                    id="whatsapp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    {...register('whatsappNumber')}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                  />
                </div>
                {errors.whatsappNumber && <p className="text-[11px] text-error mt-0.5 ml-1">{errors.whatsappNumber.message}</p>}
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
                        width={16} 
                        height={16} 
                        className="opacity-50" 
                      />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      {...register('password')}
                      className="w-full pl-10 pr-10 py-2.5 bg-surface-container-high border border-outline-variant/50 rounded-xl text-on-surface placeholder:text-outline/50 font-body-md text-[13px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-tertiary focus:ring-0 transition-all duration-200 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,border-color_0.2s_ease-in-out_0s]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 flex items-center opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? (
                        <Image src="/icons/visibility_off.png" alt="hide" width={18} height={18} />
                      ) : (
                        <Image src="/icons/visibility.png" alt="show" width={18} height={18} />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] text-error mt-0.5 ml-1">{errors.password.message}</p>}
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
                        width={16} 
                        height={16} 
                        className="opacity-50" 
                      />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Ulangi password"
                      {...register('confirmPassword')}
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
                          width={18} 
                          height={18} 
                        />
                      ) : (
                        <Image 
                          src="/icons/visibility.png" 
                          alt="show" 
                          width={18} 
                          height={18} 
                        />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[11px] text-error mt-0.5 ml-1">{errors.confirmPassword.message}</p>}
                </div>

              </div>

              {/* Checkbox Persetujuan */}
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
                  Saya setuju mendaftar sebagai Pelanggan dan mematuhi <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-tertiary underline font-bold hover:text-tertiary-fixed-dim inline-block">kebijakan privasi</button>.
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

          {/* SEKARANG DI KANAN: Branding (Hanya muncul di Desktop) */}
          {/* PERUBAHAN BORDER: border-r diubah menjadi border-l */}
          <div className="hidden md:flex md:w-5/12 bg-surface-container-high p-6 flex-col justify-center items-center text-center border-l border-outline-variant/30 relative">
            
            {/* Logo KOMAH digeser ke pojok Kanan Atas agar seimbang */}
            <div className="absolute top-5 right-5">
              <Image
                src="/icons/logo.png"
                alt="Logo KOMAH"
                width={125} 
                height={125}
              />
            </div>

            <div className="mb-4 mt-12 flex justify-center">
              <Image 
                src="/icons/welcome_user.png" 
                alt="Ikon Pendaftaran" 
                width={250} 
                height={250} 
                className="opacity-90 hover:opacity-100 transition-opacity" 
              />
            </div>
            <h2 className="font-headline-md text-[20px] text-text-primary mb-2">Bergabung Bersama Kami</h2>
            <p className="font-body-sm text-[13px] text-text-secondary leading-relaxed px-2">
              Nikmati kemudahan layanan transportasi mahasiswa UIN Suska Riau dalam satu genggaman.
            </p>

            <div className="absolute bottom-5 left-0 right-0 text-center px-4">
              <p className="font-label-mono text-[11px] text-outline-variant opacity-60">
                © 2026 KOMAH UIN SUSKA RIAU. Kece &amp; Terpercaya.
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
              <p>Kami mengumpulkan data pribadi seperti nama lengkap, alamat email student, nomor WhatsApp, guna kelancaran layanan ojek kampus.</p>
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