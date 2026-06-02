'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({ 
  children, 
  menuItems = [], 
  roleLabel = 'Pelanggan', 
  profilePicKey = 'userProfilePic', 
  profilePicEvent = 'profilePictureUpdated' 
}) {
  const pathname = usePathname();
  const { profile, loading, refetch } = useProfile();

  // State untuk menyimpan foto Navbar (localStorage fallback)
  const [navProfilePic, setNavProfilePic] = useState(null);

  // State untuk mengontrol Sidebar di Mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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

  // Pasang pendengar (Listener) untuk foto profil
  useEffect(() => {
    const loadProfilePic = () => {
      const savedPic = localStorage.getItem(profilePicKey);
      if (savedPic) setNavProfilePic(savedPic);
    };

    loadProfilePic();

    window.addEventListener(profilePicEvent, loadProfilePic);
    return () => window.removeEventListener(profilePicEvent, loadProfilePic);
  }, [profilePicKey, profilePicEvent]);

  const avatarSrc = profile?.avatar_url || navProfilePic;

  return (
    <div className="flex h-[100dvh] w-full bg-background text-text-primary font-body-md antialiased overflow-hidden relative">
      
      {/* ================= HEADER KHUSUS MOBILE (TOP APP BAR) ================= */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between px-4 z-40">
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

        <Image
          src="/icons/logo.png"
          alt="Logo KOMAH"
          width={100} 
          height={100}
        />
      </div>

      {/* ================= OVERLAY GELAP (MOBILE) ================= */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
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

        {/* Profil Singkat */}
        <div className="flex flex-col items-center mb-8 pb-4 border-b border-outline-variant w-full mt-10 md:mt-0">
          <div className="w-24 h-24 rounded-full mb-3 overflow-hidden ring-2 ring-tertiary relative bg-surface-container-high flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full bg-surface-container-high animate-pulse rounded-full"></div>
            ) : avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Foto Profil"
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
            <>
              <div className="h-5 w-32 bg-surface-container-high animate-pulse rounded-md mb-1"></div>
              <div className="h-4 w-20 bg-surface-container-high animate-pulse rounded-md mt-1"></div>
            </>
          ) : (
            <>
              <h3 className="font-headline-sm text-[20px] text-text-primary text-center truncate w-full max-w-[200px]">
                {profile?.full_name || 'User'}
              </h3>
              <span className="font-label-mono text-[14px] text-text-secondary mt-1">{roleLabel}</span>
            </>
          )}
        </div>

        {/* Menu Navigasi */}
        <ul className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.href) 
                    ? 'bg-secondary-container text-on-secondary-container scale-95' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20} 
                  height={20}
                  className={isActive(item.href) ? 'opacity-100' : 'opacity-70'}
                />
                <span className={`font-label-mono text-[16px] transition-all ${isActive(item.href) ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Tombol Keluar (Modal) */}
        <div className="mt-auto pt-4 border-t border-outline-variant">
          <button 
            onClick={() => {
              setIsMobileSidebarOpen(false);
              setShowLogoutModal(true);
            }}
            className="flex items-center gap-3 w-full text-on-surface-variant px-4 py-3 rounded-lg transition-all duration-200 hover:bg-surface-container-high active:scale-95"          
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
              Sesi Anda akan diakhiri. Anda harus login kembali untuk masuk ke akun KOMAH.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="btn-close-glowing"
              >
                Batal
              </button>
              
              <button 
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="btn-primary-glowing"
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
