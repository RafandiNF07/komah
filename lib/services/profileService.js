import { z } from 'zod';
import { profileRepository } from '../repositories/profileRepository';

// 1. Skema Validasi Zod untuk pembaharuan profil dasar
export const profileUpdateSchema = z.object({
  full_name: z.string().min(3, "Nama lengkap minimal terdiri dari 3 karakter"),
  phone_number: z.string().regex(/^628[0-9]{8,11}$/, "Format WhatsApp tidak valid (Wajib diawali 628 tanpa +)"),
  role: z.enum(['customer', 'driver']).optional(),
  license_plate: z.string().optional().nullable(),
  vehicle_type: z.string().optional().nullable()
}).refine((data) => {
  // Jika perannya adalah 'driver', plat nomor dan jenis kendaraan wajib diisi
  if (data.role === 'driver') {
    return !!data.license_plate && !!data.vehicle_type;
  }
  return true;
}, {
  message: "Informasi plat nomor dan jenis kendaraan wajib diisi untuk Mitra Driver",
  path: ["license_plate"]
});

// 2. Skema Validasi Zod untuk metadata berkas gambar profil
export const avatarFileSchema = z.object({
  name: z.string(),
  size: z.number().max(2 * 1024 * 1024, "Ukuran file foto maksimal adalah 2MB"),
  type: z.string().refine((val) => {
    return ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(val);
  }, {
    message: "Format foto tidak valid. Wajib berupa berkas PNG, JPG, JPEG, atau WEBP"
  })
});

/**
 * Service Layer untuk bisnis logika profil pengguna.
 */
export const profileService = {
  
  /**
   * Validasi profil sebelum diperbarui di database
   */
  async updateValidatedProfile(userId, rawProfileData) {
    const validatedData = profileUpdateSchema.parse(rawProfileData);
    return await profileRepository.updateProfile(userId, validatedData);
  },

  /**
   * Mengunggah foto profil baru dengan pemeriksaan tipe berkas dan batas kapasitas (2MB)
   */
  async validateAndUploadAvatar(userId, file) {
    if (!userId) throw new Error("ID Pengguna wajib disertakan");
    if (!file) throw new Error("Berkas foto wajib dipilih");

    // 1. Validasi berkas foto menggunakan skema Zod
    avatarFileSchema.parse({
      name: file.name,
      size: file.size,
      type: file.type
    });

    // 2. Buat file path unik berbasis UUID pengguna & timestamp
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    // 3. Serahkan proses pengunggahan ke Repository
    await profileRepository.uploadAvatar(filePath, file);

    // 4. Ambil URL publik dari berkas yang diunggah
    const publicUrl = profileRepository.getAvatarPublicUrl(filePath);

    // 5. Perbarui kolom avatar_url di profil pengguna
    await profileRepository.updateAvatarUrl(userId, publicUrl);

    return publicUrl;
  },

  /**
   * Mengalihkan peran akun pengguna secara aman
   */
  async switchRoleSecurely(userId, targetRole, currentProfile) {
    if (!userId) throw new Error("ID Pengguna wajib disertakan");
    
    // Validasi apakah pengguna layak beralih peran
    if (targetRole === 'driver') {
      const hasVehicleInfo = currentProfile?.license_plate && currentProfile?.vehicle_type;
      if (!hasVehicleInfo) {
        throw new Error("Informasi kendaraan Anda belum lengkap untuk beralih ke Mode Driver.");
      }
    }

    return await profileRepository.switchRole(userId, targetRole);
  }
};
