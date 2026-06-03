'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';

export default function DriverDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, loading, refetch } = useProfile();

  // State untuk mengontrol Sidebar di Mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // State untuk menyimpan foto Profil Navbar
  const [navProfilePic, setNavProfilePic] = useState(null);
  
  // State untuk mengontrol Pop-up Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // State untuk loading logout
  const [loggingOut, setLoggingOut] = useState(false);

  // Fungsi untuk mendeteksi halaman yang sedang aktif
  const isActive = (path) => pathname === path;

  // Fungsi eksekusi Logout
  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setShowLogoutModal(false);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  // Pasang pendengar (Listener) untuk update foto profil otomatis
  useEffect(() => {
    const loadProfilePic = () => {
      // Menggunakan key 'driverProfilePic' agar konsisten dengan profile page
      const savedPic = localStorage.getItem('driverProfilePic');
      if (savedPic) setNavProfilePic(savedPic);
    };

    loadProfilePic();
    
    const handleProfilePicUpdate = () => {
      loadProfilePic();
      refetch();
    };

    window.addEventListener('driverProfilePictureUpdated', handleProfilePicUpdate);
    return () => window.removeEventListener('driverProfilePictureUpdated', handleProfilePicUpdate);
  }, [refetch]);

  const avatarSrc = profile?.avatar_url || navProfilePic;


  return (
    <div className="flex h-[100dvh] w-full bg-background text-text-primary font-body-md antialiased overflow-hidden relative">
      
      {/* ================= HEADER KHUSUS MOBILE (TOP APP BAR) ================= */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between px-4 z-40">
        
        {/* Tombol Hamburger */}
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 -ml-2 text-on-surface hover:text-tertiary transition-colors focus:outline-none active:scale-95"
        >
          <Image
            src="/icons/hamburger.png"
            alt="menu"
            width={32}
            height={32}
          />
        </button>

        {/* Logo KOMAH */}
        <Image
          src="/icons/logo.png"
          alt="Logo KOMAH"
          width={100} 
          height={100}
        />
      </div>

      {/* ================= OVERLAY GELAP (UNTUK MOBILE) ================= */}
      {/* Muncul saat sidebar mobile terbuka */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR (DESKTOP & MOBILE) ================= */}
      <nav className={`flex flex-col h-screen p-4 border-r border-outline-variant bg-surface-container shadow-2xl md:shadow-none w-64 fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Logo Utama KOMAH */}
        <div className="mb-6 pl-2 hidden md:block">
          <Image
            src="/icons/logo.png"
            alt="Logo KOMAH"
            width={100} 
            height={100}
          />
        </div>

        {/* Profil Singkat Driver */}
        <div className="flex flex-col items-center mb-8 pb-4 border-b border-outline-variant w-full mt-10 md:mt-0">
          <div className="w-24 h-24 rounded-full mb-3 overflow-hidden ring-2 ring-tertiary relative bg-surface-container-high flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full bg-surface-container-high animate-pulse rounded-full"></div>

                        ) : avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Foto Profil"
                width={96}
                height={96}
                unoptimized
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src="/icons/person.png"
                alt="person"
                width={80} 
                height={80}
              />
            )}
          </div>
          {loading ? (
            <div className="h-6 w-32 bg-surface-container-high animate-pulse rounded mb-1"></div>
          ) : (
            <h3 className="font-headline-sm text-[20px] text-text-primary">{profile?.full_name || 'Driver'}</h3>
          )}
          <span className="font-label-mono text-[14px] text-text-secondary mt-1">Driver KOMAH</span>
        </div>

        {/* Menu Navigasi Driver */}
        <ul className="flex flex-col gap-1.5 flex-1">
          
          {/* 1. Menu Dashboard */}
          <li>
            <Link 
              href="/driver" 
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/driver') 
                  ? 'bg-secondary-container text-on-secondary-container scale-95' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Image
                src="/icons/dashboard.png"
                alt="dashboard"
                width={20} 
                height={20}
                className={isActive('/driver') ? 'opacity-100' : 'opacity-70'}
              />
              <span className={`font-label-mono text-[16px] transition-all ${isActive('/driver') ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
                Dashboard
              </span>
            </Link>
          </li>

          {/* 2. Menu Pesanan */}
          <li>
            <Link 
              href="/driver/pesanan"
              onClick={() => setIsMobileSidebarOpen(false)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/driver/pesanan') 
                  ? 'bg-secondary-container text-on-secondary-container scale-95' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Image
                src="/icons/pesanan.png" // Pastikan kamu punya gambar pesanan.png atau bike.png di folder icons
                alt="pesanan"
                width={25} 
                height={25}
                className={isActive('/driver/pesanan') ? 'opacity-100' : 'opacity-70'}
              />
              <span className={`font-label-mono text-[16px] transition-all ${isActive('/driver/pesanan') ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
                Pesanan
              </span>
            </Link>
          </li>

          {/* 3. Menu Riwayat */}
          <li>
            <Link 
              href="/driver/history"
              onClick={() => setIsMobileSidebarOpen(false)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/driver/history') 
                  ? 'bg-secondary-container text-on-secondary-container scale-95' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Image
                src="/icons/history.png"
                alt="history"
                width={20} 
                height={20}
                className={isActive('/driver/history') ? 'opacity-100' : 'opacity-70'}
              />
              <span className={`font-label-mono text-[16px] transition-all ${isActive('/driver/history') ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
                Riwayat
              </span>
            </Link>
          </li>

          {/* 4. Menu Pendapatan */}
          <li>
            <Link 
              href="/driver/pendapatan"
              onClick={() => setIsMobileSidebarOpen(false)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/driver/pendapatan') 
                  ? 'bg-secondary-container text-on-secondary-container scale-95' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Image
                src="/icons/pendapatan.png" // Pastikan kamu punya gambar wallet.png / dompet.png
                alt="pendapatan"
                width={25} 
                height={25}
                className={isActive('/driver/pendapatan') ? 'opacity-100' : 'opacity-70'}
              />
              <span className={`font-label-mono text-[16px] transition-all ${isActive('/driver/pendapatan') ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
                Pendapatan
              </span>
            </Link>
          </li>

          {/* 5. Menu Profil */}
          <li>
            <Link 
              href="/driver/profile" 
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/driver/profile') 
                  ? 'bg-secondary-container text-on-secondary-container scale-95' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Image
                src="/icons/profil.png"
                alt="profil"
                width={20} 
                height={20}
                className={isActive('/driver/profile') ? 'opacity-100' : 'opacity-70'}
              />
              <span className={`font-label-mono text-[16px] transition-all ${isActive('/driver/profile') ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
                Profil
              </span>
            </Link>
          </li>

        </ul>

        {/* Tombol Keluar (Memicu Modal) */}
        <div className="mt-auto pt-4 border-t border-outline-variant">
          <button 
            onClick={() => {
              setIsMobileSidebarOpen(false); 
              setShowLogoutModal(true); 
            }}
            className="flex items-center gap-3 w-full text-danger px-4 py-3 rounded-lg transition-all duration-200 hover:bg-surface-container-high active:scale-95"
          >
            <Image
              src="/icons/logout.png"
              alt="logout"
              width={20} 
              height={20}
            />
            <span className="font-label-mono text-[16px] font-medium">
              Keluar
            </span>
          </button>
        </div>
      </nav>

      {/* ================= AREA KONTEN UTAMA ================= */}
      {/* pt-20 ditambahkan agar di versi Mobile, konten tidak tertutup oleh Header Hamburger */}
      <main className="flex-1 ml-0 md:ml-64 p-4 pt-20 md:pt-6 md:p-6 overflow-y-auto w-full bg-surface-dim pb-6">
        {children}
      </main>

      {/* ================= MODAL KONFIRMASI LOGOUT ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all">
            
            <div className="w-16 h-16 rounded-full bg-cancel/10 flex items-center justify-center mx-auto mb-4 border border-cancel/20">
              <Image
                src="/icons/logout.png"
                alt="logout"
                width={35} 
                height={35}
              />
            </div>
            
            <h3 className="font-headline-md text-[20px] font-bold text-text-primary text-center mb-2">
              Keluar dari Dashboard?
            </h3>
            <p className="font-body-sm text-[14px] text-text-secondary text-center mb-8">
              Sesi Anda akan diakhiri. Anda harus login kembali untuk masuk.
            </p>
            

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              {/* Tombol Batal */}
              <button 
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="flex-1 py-3 bg-tertiary hover:bg-tertiary-fixed-dim text-on-tertiary text-[14px] font-bold rounded-xl shadow-lg shadow-tertiary/20 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,82,0.4)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              >
                Batal
              </button>
              
              {/* Tombol Keluar (Animasi Timbul & Glowing Tertiary) */}
              <button 
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="flex-1 py-3 bg-tertiary hover:bg-tertiary-fixed-dim text-on-tertiary text-[14px] font-bold rounded-xl shadow-lg shadow-tertiary/20 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(240,192,82,0.4)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              >
                {loggingOut ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}