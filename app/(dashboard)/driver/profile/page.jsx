'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function DriverProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Referensi untuk memicu klik pada input file tersembunyi
  const fileInputRef = useRef(null);

  // Memuat foto profil dari penyimpanan lokal (saat web pertama kali dibuka)
  useEffect(() => {
    // Menggunakan key yang berbeda agar tidak tertukar dengan profil user
    const savedImage = localStorage.getItem('driverProfilePic');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  // Logika saat driver memilih gambar dari galeri
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result;
        
        setProfileImage(base64String);
        localStorage.setItem('driverProfilePic', base64String);
        
        // Tembakkan sinyal ke Navbar Driver agar ikut berubah
        window.dispatchEvent(new Event('driverProfilePictureUpdated'));
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-4">
      
      {/* Header Profil */}
      <div className="mb-4 pt-2 md:pt-0 flex items-end justify-center">
        <div className="text-center">
          <h1 className="font-headline-md text-[35px] font-bold text-text-primary">Profil Driver</h1>
          <p className="font-body-sm text-[14px] text-text-secondary mt-0.5">Kelola informasi akun Anda.</p>
        </div>
      </div>

      {/* Card Profil Utama */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-md">
        
        {/* FOTO PROFIL */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-outline-variant/30">
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
          />

          <div className="relative">
            <div className={`w-24 h-24 rounded-full bg-surface-container-high border-[3px] transition-all duration-300 overflow-hidden flex items-center justify-center ${isEditing ? 'border-tertiary shadow-md' : 'border-tertiary/30'}`}>
               {profileImage ? (
                 <Image src={profileImage} alt="Profil Driver" width={96} height={96} className="w-full h-full object-cover" />
               ) : (
                 <Image
                    src="/icons/person.png"
                    alt="person"
                    width={80} 
                    height={80}
                  />
               )}
            </div>
            
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
          
          <h2 className="font-headline-md text-[20px] font-bold text-text-primary mt-3">Aqsya Aurora</h2>
          <p className="font-label-mono text-[12px] text-tertiary mt-0.5 font-bold">Mitra Driver KOMAH</p>
          
        </div>

        {/* Form Data Diri */}
        <div className="space-y-4">
          
          {/* Baris 1: Nama & WA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                defaultValue="Aqsya Aurora" 
                disabled={!isEditing}
                className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] disabled:opacity-60 focus:border-tertiary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Nomor WhatsApp</label>
              <input 
                type="tel" 
                defaultValue="081234567890" 
                disabled={!isEditing}
                className="w-full px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-text-primary font-body-md text-[13px] disabled:opacity-60 focus:border-tertiary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Baris 2: Email (Dikunci) */}
          <div className="space-y-1.5">
            <label className="font-label-mono text-[12px] text-on-surface-variant ml-1">Email Driver</label>
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
                value="budi.santoso@student.uin-suska.ac.id" 
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
                  onClick={() => setIsEditing(false)}
                  className="flex-[1] py-3 bg-close text-primary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-close/30 transition-all font-label-mono text-[13px]"
                >
                  Batal
                </button>
                <button 
                  onClick={() => { setIsEditing(false); alert("Profil Driver berhasil diperbarui!"); }}
                  className="flex-[2] py-3 bg-tertiary text-on-tertiary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-tertiary/30 transition-all font-label-mono text-[13px]"
                >
                  Simpan Perubahan
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

    </div>
  );
}