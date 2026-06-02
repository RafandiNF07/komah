'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useProfile } from '@/lib/hooks/useProfile';
import { profileService } from '@/lib/services/profileService';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import RegisterDriverModal from '@/components/profile/RegisterDriverModal';
import { translateError } from '@/lib/errors/errorHandler';

export default function UnifiedProfilePage() {
  const { profile, user, loading, refetch } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorWA, setNomorWA] = useState('');
  const [platNomor, setPlatNomor] = useState('');
  const [jenisKendaraan, setJenisKendaraan] = useState('');

  // Mode switching state
  const [switchingRole, setSwitchingRole] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [modalPlat, setModalPlat] = useState('');
  const [modalKendaraan, setModalKendaraan] = useState('');
  
  const fileInputRef = useRef(null);

  const isDriver = profile?.role === 'driver';
  const profilePicKey = isDriver ? 'driverProfilePic' : 'userProfilePic';
  const profilePicEvent = isDriver ? 'driverProfilePictureUpdated' : 'profilePictureUpdated';

  // Sync form state when profile data loads
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setNamaLengkap(profile.full_name || '');
        setNomorWA(profile.phone_number || '');
        setPlatNomor(profile.license_plate || '');
        setJenisKendaraan(profile.vehicle_type || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // Load avatar from localStorage fallback
  useEffect(() => {
    if (profilePicKey) {
      const savedImage = localStorage.getItem(profilePicKey);
      if (savedImage) {
        setTimeout(() => {
          setProfileImage(savedImage);
        }, 0);
      }
    }
  }, [profilePicKey]);

  // Auto-hide feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Switch role handler (Customer <-> Driver)
  const handleSwitchRole = async () => {
    if (!user || !profile) return;
    
    if (isDriver) {
      // Driver to Customer
      setSwitchingRole(true);
      try {
        await profileService.switchRole(user.id, 'customer');
        setFeedback({ type: 'success', message: 'Berhasil beralih ke Mode Pelanggan!' });
        setTimeout(() => {
          window.location.href = '/user';
        }, 1000);
      } catch (err) {
        console.error('Error switching to customer:', err);
        setFeedback({ type: 'error', message: 'Gagal beralih peran.' });
        setSwitchingRole(false);
      }
    } else {
      // Customer to Driver
      if (profile.license_plate && profile.vehicle_type) {
        setSwitchingRole(true);
        try {
          await profileService.switchRole(user.id, 'driver');
          setFeedback({ type: 'success', message: 'Berhasil beralih ke Mode Driver!' });
          setTimeout(() => {
            window.location.href = '/driver';
          }, 1000);
        } catch (err) {
          console.error('Error switching to driver:', err);
          setFeedback({ type: 'error', message: 'Gagal beralih peran.' });
          setSwitchingRole(false);
        }
      } else {
        // Show vehicle registration modal
        setShowDriverModal(true);
      }
    }
  };

  // Register driver vehicle & switch role
  const handleRegisterDriverSubmit = async (e) => {
    e.preventDefault();
    if (!modalPlat.trim() || !modalKendaraan.trim()) {
      setFeedback({ type: 'error', message: 'Semua bidang wajib diisi!' });
      return;
    }
    
    setSwitchingRole(true);
    try {
      await profileService.updateProfile(user.id, {
        fullName: namaLengkap,
        phoneNumber: nomorWA,
        licensePlate: modalPlat.trim(),
        vehicleType: modalKendaraan.trim()
      });
      await profileService.switchRole(user.id, 'driver');
      
      setShowDriverModal(false);
      setFeedback({ type: 'success', message: 'Pendaftaran Driver Berhasil!' });
      setTimeout(() => {
        window.location.href = '/driver';
      }, 1000);
    } catch (err) {
      const appError = translateError(err);
      setFeedback({ type: appError.severity, message: appError.message });
      setSwitchingRole(false);
    }
  };

  // Handle profile image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Berkas harus berupa gambar!' });
      return;
    }

    // Naikkan batas ukuran input asli karena kita mengompresnya di klien secara otomatis
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran berkas asli maksimal adalah 10MB!' });
      return;
    }

    setUploadingImage(true);
    setFeedback(null);

    try {
      const { compressAndSquareImage } = await import('@/lib/utils/imageCompressor');
      const { base64, blob } = await compressAndSquareImage(file, 256);

      // Buat file baru terkompresi berukuran sangat kecil (~10KB) dan berdimensi persegi (square)
      const compressedFile = new File([blob], `avatar-${user.id}.webp`, { type: 'image/webp' });

      const publicUrl = await profileService.uploadAvatar(user.id, compressedFile);

      // Simpan Base64 berukuran sangat kecil ke localStorage
      setProfileImage(base64);
      localStorage.setItem(profilePicKey, base64);
      window.dispatchEvent(new Event(profilePicEvent));

      refetch();
      setFeedback({ type: 'success', message: 'Foto profil berhasil diperbarui!' });
    } catch (err) {
      const appError = translateError(err);
      setFeedback({ type: appError.severity, message: appError.message });
    } finally {
      setUploadingImage(false);
    }
  };

  // Save text fields
  const handleSave = async () => {
    if (!user) return;
    
    if (isDriver) {
      if (!platNomor.trim()) {
        setFeedback({ type: 'error', message: 'Plat nomor kendaraan wajib diisi.' });
        return;
      }
      if (!jenisKendaraan.trim()) {
        setFeedback({ type: 'error', message: 'Jenis kendaraan wajib diisi.' });
        return;
      }
    }

    setSaving(true);
    setFeedback(null);
    try {
      await profileService.updateProfile(user.id, {
        fullName: namaLengkap,
        phoneNumber: nomorWA,
        licensePlate: isDriver ? platNomor : profile.license_plate,
        vehicleType: isDriver ? jenisKendaraan : profile.vehicle_type
      });

      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profil berhasil diperbarui!' });
      refetch();
      window.dispatchEvent(new Event(profilePicEvent));
    } catch (err) {
      const appError = translateError(err);
      setFeedback({ type: appError.severity, message: appError.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setNamaLengkap(profile.full_name || '');
      setNomorWA(profile.phone_number || '');
      setPlatNomor(profile.license_plate || '');
      setJenisKendaraan(profile.vehicle_type || '');
    }
  };

  const avatarSrc = profile?.avatar_url || profileImage;

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-4">
      {/* Toast Alert */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-[500] px-4 py-3 rounded-xl shadow-lg text-[13px] font-label-mono transition-all duration-300 ${
          feedback.type === 'success' ? 'bg-success/90 text-on-tertiary' : 'bg-cancel/90 text-on-tertiary'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-4 pt-2 md:pt-0 flex items-end justify-center">
        <div className="text-center">
          <h1 className="font-headline-md text-[35px] font-bold text-text-primary">Profil Saya</h1>
          <p className="font-body-sm text-[14px] text-text-secondary mt-0.5">Kelola informasi akun Anda.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-md">
        
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-outline-variant/30">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
          />

          <div className="relative">
            <div className={`w-24 h-24 rounded-full bg-surface-container-high border-[3px] transition-all duration-300 overflow-hidden flex items-center justify-center relative ${isEditing ? 'border-tertiary shadow-md' : 'border-tertiary/30'}`}>
               {avatarSrc ? (
                 <img src={avatarSrc} alt="Profil" className="w-full h-full object-cover" />
               ) : (
                 <Image src="/icons/person.png" alt="person" width={80} height={80} />
               )}
               {uploadingImage && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                   <Image src="/icons/loading.png" alt="loading" width={24} height={24} className="animate-spin" />
                 </div>
               )}
            </div>
            
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-tertiary rounded-full flex items-center justify-center shadow-lg border-2 border-surface transition-transform hover:scale-110 active:scale-95"
                title="Ganti Foto Profil"
              >
                <Image src="/icons/pencil.png" alt="Ubah Foto" width={14} height={14} className="object-contain" />
              </button>
            )}
          </div>
          
          <h2 className="font-headline-md text-[20px] font-bold text-text-primary mt-3">{profile?.full_name || 'User'}</h2>
          <p className="font-label-mono text-[12px] text-text-secondary mt-0.5">{isDriver ? 'Driver KOMAH' : 'Pelanggan'}</p>
        </div>

        {/* Input Form Fields */}
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
              <Image src="/icons/email.png" alt="email" width={20} height={20} className="absolute left-3" />
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="w-full pl-10 pr-4 py-2.5 bg-surface-variant/20 border border-outline-variant/20 rounded-xl text-text-secondary font-body-md text-[13px] cursor-not-allowed"
              />
            </div>
          </div>

          {/* Conditional Fields for Driver */}
          {isDriver && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
              <div className="space-y-1.5">
                <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Jenis Kendaraan</label>
                <input 
                  type="text" 
                  value={jenisKendaraan}
                  onChange={(e) => setJenisKendaraan(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] disabled:opacity-60 focus:border-tertiary focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Plat Nomor Kendaraan</label>
                <input 
                  type="text" 
                  value={platNomor}
                  onChange={(e) => setPlatNomor(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] disabled:opacity-60 focus:border-tertiary focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
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
                className="group w-full py-3 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-tertiary/30 active:scale-95 font-label-mono text-[14px] flex items-center justify-center gap-2.5"
              >
                <Image
                  src="/icons/edit1.png"
                  alt="edit"
                  width={20} 
                  height={20}
                  className="object-contain transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
                />
                <span>Edit Profil</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Switching Panel */}
      <div className="mt-6 bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-md transition-all duration-300 hover:shadow-lg">
        <h3 className="font-headline-md text-[18px] font-bold text-text-primary mb-2 flex items-center gap-2">
          <Image src="/icons/drivers.png" alt="mode" width={24} height={24} />
          Beralih Peran (Mode Akun)
        </h3>
        <p className="font-body-sm text-[13px] text-text-secondary mb-4 leading-relaxed">
          Anda saat ini masuk sebagai <strong>{isDriver ? 'Driver' : 'Pelanggan'}</strong>. 
          Ingin beralih ke mode <strong>{isDriver ? 'Pelanggan' : 'Driver'}</strong> untuk {isDriver ? 'melakukan pemesanan ojek kampus?' : 'mulai menerima pesanan dan menambah penghasilan?'}
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
              <span>Beralih ke Mode {isDriver ? 'Pelanggan' : 'Driver'}</span>
            </>
          )}
        </button>
      </div>

      {/* Vehicle Registration Modal */}
      <RegisterDriverModal 
        show={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        onSubmit={handleRegisterDriverSubmit}
        vehicleType={modalKendaraan}
        setVehicleType={setModalKendaraan}
        licensePlate={modalPlat}
        setLicensePlate={setModalPlat}
        isLoading={switchingRole}
      />
    </div>
  );
}
