'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { profile, user, loading, refetch } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state — initialized from profile data
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorWA, setNomorWA] = useState('');

  // Mode switching state
  const [switchingRole, setSwitchingRole] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [modalPlat, setModalPlat] = useState('');
  const [modalKendaraan, setModalKendaraan] = useState('');
  
  // Referensi untuk memicu klik pada input file tersembunyi
  const fileInputRef = useRef(null);

  // Switch role handler
  const handleSwitchRole = async () => {
    if (!user || !profile) return;
    
    // Cek apakah data kendaraan sudah ada (pernah daftar driver)
    if (profile.license_plate && profile.vehicle_type) {
      setSwitchingRole(true);
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'driver' })
          .eq('id', user.id);
          
        if (error) throw error;
        
        setFeedback({ type: 'success', message: 'Berhasil beralih ke Mode Driver!' });
        setTimeout(() => {
          window.location.href = '/driver';
        }, 1000);
      } catch (err) {
        console.error('Error switching to driver:', err);
        setFeedback({ type: 'error', message: 'Gagal beralih peran. Silakan coba lagi.' });
        setSwitchingRole(false);
      }
    } else {
      // Belum pernah daftar driver, buka modal pendaftaran kendaraan
      setShowDriverModal(true);
    }
  };

  // Register driver & switch handler
  const handleRegisterDriver = async (e) => {
    e.preventDefault();
    if (!modalPlat.trim() || !modalKendaraan.trim()) {
      alert('Semua bidang wajib diisi!');
      return;
    }
    
    setSwitchingRole(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'driver',
          license_plate: modalPlat.trim(),
          vehicle_type: modalKendaraan.trim()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setShowDriverModal(false);
      setFeedback({ type: 'success', message: 'Pendaftaran Driver Berhasil!' });
      setTimeout(() => {
        window.location.href = '/driver';
      }, 1000);
    } catch (err) {
      console.error('Error registering driver:', err);
      setFeedback({ type: 'error', message: 'Gagal mendaftar driver. Silakan coba lagi.' });
      setSwitchingRole(false);
    }
  };

  // Sync form state when profile data loads
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setNamaLengkap(profile.full_name || '');
        setNomorWA(profile.phone_number || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // Memuat foto profil dari penyimpanan lokal (saat web pertama kali dibuka)
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfilePic');
    if (savedImage) {
      const timer = setTimeout(() => {
        setProfileImage(savedImage);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-hide feedback after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Logika saat pengguna memilih gambar dari galeri & mengunggah ke Supabase Storage
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    // Validasi 1: Harus berkas gambar
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Berkas harus berupa gambar!' });
      return;
    }

    // Validasi 2: Ukuran maksimal 2MB
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran foto maksimal adalah 2MB!' });
      return;
    }

    setUploadingImage(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      
      // Buat path unik berbasis folder UUID user & timestamp untuk mencegah cache-stale
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // 1. Unggah gambar ke Supabase Storage (bucket 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Ambil URL publik dari file yang baru diunggah
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Simpan URL publik ke kolom avatar_url di tabel profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Salin cadangan Base64 ke localStorage agar komponen navbar ter-update instan
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        localStorage.setItem('userProfilePic', base64String);
        window.dispatchEvent(new Event('profilePictureUpdated'));
      };
      reader.readAsDataURL(file);

      // 5. Segarkan data useProfile
      refetch();
      setFeedback({ type: 'success', message: 'Foto profil berhasil diperbarui!' });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setFeedback({ type: 'error', message: err.message || 'Gagal mengunggah foto profil.' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handler simpan profil ke Supabase
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setFeedback(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('profiles').update({
        full_name: namaLengkap,
        phone_number: nomorWA,
      }).eq('id', user.id);

      if (error) throw error;

      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profil berhasil diperbarui!' });
      // Refetch profile data so sidebar also updates
      refetch();
      // Dispatch event so layout sidebar name updates immediately
      window.dispatchEvent(new Event('profilePictureUpdated'));
    } catch (err) {
      console.error('Save profile error:', err);
      setFeedback({ type: 'error', message: 'Gagal menyimpan profil. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel — reset form values to current profile
  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setNamaLengkap(profile.full_name || '');
      setNomorWA(profile.phone_number || '');
    }
  };

  // Determine the avatar source: profile.avatar_url from Supabase, fallback to localStorage
  const avatarSrc = profile?.avatar_url || profileImage;

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto pb-4">
        <div className="mb-4 pt-2 md:pt-0 flex items-end justify-center">
          <div className="text-center">
            <h1 className="font-headline-md text-[35px] font-bold text-text-primary">Profil Saya</h1>
            <p className="font-body-sm text-[14px] text-text-secondary mt-0.5">Kelola informasi akun Anda.</p>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-md">
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-outline-variant/30">
            <div className="w-24 h-24 rounded-full bg-surface-container-high animate-pulse mb-3"></div>
            <div className="h-5 w-32 bg-surface-container-high animate-pulse rounded-md mb-1"></div>
            <div className="h-4 w-40 bg-surface-container-high animate-pulse rounded-md mt-0.5"></div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-surface-container-high animate-pulse rounded-md ml-1"></div>
                <div className="h-10 w-full bg-surface-container-high animate-pulse rounded-xl"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-surface-container-high animate-pulse rounded-md ml-1"></div>
                <div className="h-10 w-full bg-surface-container-high animate-pulse rounded-xl"></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-surface-container-high animate-pulse rounded-md ml-1"></div>
              <div className="h-10 w-full bg-surface-container-high animate-pulse rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Dibuat lebih rapat agar muat di satu layar (halaman)
    <div className="w-full max-w-2xl mx-auto pb-4">
      
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-xl shadow-lg text-[13px] font-label-mono transition-all duration-300 ${
          feedback.type === 'success' 
            ? 'bg-success/90 text-on-tertiary' 
            : 'bg-cancel/90 text-on-tertiary'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Header Profil (Dikecilkan jaraknya) */}
      <div className="mb-4 pt-2 md:pt-0 flex items-end justify-center">
        <div className="text-center">
          <h1 className="font-headline-md text-[35px] font-bold text-text-primary">Profil Saya</h1>
          <p className="font-body-sm text-[14px] text-text-secondary mt-0.5">Kelola informasi akun Anda.</p>
        </div>
      </div>

      {/* Card Profil Utama */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-md">
        
        {/* FOTO PROFIL (Sekarang tombol pensil yang diklik untuk upload) */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-outline-variant/30">
          
          {/* Input File Tersembunyi */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
          />

          {/* Container Profil & Tombol Edit */}
          <div className="relative">
            {/* Bingkai Foto (Tidak lagi bisa diklik secara langsung) */}
            <div className={`w-24 h-24 rounded-full bg-surface-container-high border-[3px] transition-all duration-300 overflow-hidden flex items-center justify-center relative ${isEditing ? 'border-tertiary shadow-md' : 'border-tertiary/30'}`}>
               {avatarSrc ? (
                 <img src={avatarSrc} alt="Profil" className="w-full h-full object-cover" />
               ) : (
                 <Image
                    src="/icons/person.png"
                    alt="person"
                    width={80} 
                    height={80}
                  />
               )}
               {uploadingImage && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                   <Image 
                     src="/icons/loading.png" 
                     alt="loading" 
                     width={24} 
                     height={24} 
                     className="animate-spin" 
                   />
                 </div>
               )}
            </div>
            
            {/* Tombol Pensil Kecil (Muncul saat mode edit aktif) */}
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-tertiary rounded-full flex items-center justify-center shadow-lg border-2 border-surface transition-transform hover:scale-110 active:scale-95"
                title="Ganti Foto Profil"
              >
                <Image 
                  src="/icons/pencil.png" 
                  alt="Ubah Foto" 
                  width={14} 
                  height={14} 
                  className="object-contain"
                />
              </button>
            )}
          </div>
          
          <h2 className="font-headline-md text-[20px] font-bold text-text-primary mt-3">{profile?.full_name || 'User'}</h2>
          <p className="font-label-mono text-[12px] text-text-secondary mt-0.5">{profile?.role === 'customer' ? 'Pelanggan' : (profile?.role || 'Pelanggan')}</p>
          
        </div>

        {/* Form Data Diri (Lebih Rapat) */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] disabled:opacity-60 focus:border-tertiary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Nomor WhatsApp</label>
              <input 
                type="tel" 
                value={nomorWA}
                onChange={(e) => setNomorWA(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] disabled:opacity-60 focus:border-tertiary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Email Students</label>
            <div className="relative flex items-center">
              <Image
                    src="/icons/email.png"
                    alt="email"
                    width={20} 
                    height={20}
                    className="absolute left-3"
                  />
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="w-full pl-10 pr-4 py-2.5 bg-surface-variant/20 border border-outline-variant/20 rounded-xl text-text-secondary font-body-md text-[13px] cursor-not-allowed"
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 mt-2 border-t border-outline-variant/30 flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-[1] py-3 bg-close text-primary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-close/30 transition-all font-label-mono text-[13px] disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] py-3 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-tertiary/30 transition-all font-label-mono text-[13px] disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                // Tambahkan 'group' di depan agar elemen di dalamnya bisa merespon hover bersamaan
                className="group w-full py-3 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-tertiary/30 active:scale-95 font-label-mono text-[14px] flex items-center justify-center gap-2.5"
              >
              <Image
                src="/icons/edit1.png"
                alt="edit"
                width={20} 
                height={20}
                // Perbaikan 'object-contain' dan penambahan animasi rotasi/skala saat tombol di-hover
                className="object-contain transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
              />
                <span>Edit Profil</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= CARD TUKAR MODE ================= */}
      <div className="mt-6 bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-md transition-all duration-300 hover:shadow-lg">
        <h3 className="font-headline-md text-[18px] font-bold text-text-primary mb-2 flex items-center gap-2">
          <Image src="/icons/drivers.png" alt="mode" width={24} height={24} />
          Beralih Peran (Mode Akun)
        </h3>
        <p className="font-body-sm text-[13px] text-text-secondary mb-4 leading-relaxed">
          Anda saat ini masuk sebagai <strong>Pelanggan</strong>. 
          Ingin beralih ke mode <strong>Driver</strong> untuk menerima pesanan dan menambah penghasilan?
        </p>
        <button
          onClick={handleSwitchRole}
          disabled={switchingRole}
          className="group w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-secondary-container/30 active:scale-95 font-label-mono text-[13px] flex items-center justify-center gap-2"
        >
          {switchingRole ? (
            <span>Memproses...</span>
          ) : (
            <>
              <Image 
                src="/icons/drivers.png" 
                alt="switch" 
                width={18} 
                height={18} 
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span>Beralih ke Mode Driver</span>
            </>
          )}
        </button>
      </div>

      {/* ================= MODAL PENDAFTARAN DRIVER ================= */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/50 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in relative">
            <h3 className="font-headline-md text-[20px] font-bold text-text-primary mb-2 flex items-center gap-2">
              <Image src="/icons/drivers.png" alt="driver" width={24} height={24} />
              Daftar Sebagai Mitra Driver
            </h3>
            <p className="font-body-sm text-[13px] text-text-secondary mb-5 leading-relaxed">
              Lengkapi data kendaraan Anda di bawah ini untuk mengaktifkan akun driver dan mulai menerima pesanan.
            </p>
            
            <form onSubmit={handleRegisterDriver} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Jenis Kendaraan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Honda Beat, Yamaha Mio"
                  value={modalKendaraan}
                  onChange={(e) => setModalKendaraan(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] focus:border-tertiary focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Plat Nomor Kendaraan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: AB 1234 CD"
                  value={modalPlat}
                  onChange={(e) => setModalPlat(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] focus:border-tertiary focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  disabled={switchingRole}
                  className="flex-1 py-3 bg-close text-primary font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all font-label-mono text-[13px] disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={switchingRole}
                  className="flex-[2] py-3 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-tertiary/30 transition-all font-label-mono text-[13px] disabled:opacity-50"
                >
                  {switchingRole ? 'Mendaftar...' : 'Daftar & Beralih'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}