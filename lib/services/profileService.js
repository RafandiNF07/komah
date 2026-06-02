import { profileRepository } from '@/lib/repositories/profileRepository';

export const profileService = {
  /**
   * Mengubah data profil dasar milik user (pelanggan / driver) melalui repository
   */
  async updateProfile(userId, { fullName, phoneNumber, licensePlate, vehicleType }) {
    const profileData = {
      full_name: fullName,
      phone_number: phoneNumber,
      license_plate: licensePlate || null,
      vehicle_type: vehicleType || null,
    };
    return await profileRepository.updateProfile(userId, profileData);
  },

  /**
   * Mengunggah foto profil baru ke bucket Supabase Storage 'avatars' melalui repository
   */
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    // 1. Unggah gambar melalui repository
    await profileRepository.uploadAvatar(filePath, file);

    // 2. Ambil URL publik dari file yang baru diunggah melalui repository
    const publicUrl = profileRepository.getAvatarPublicUrl(filePath);

    // 3. Simpan URL publik ke tabel profiles melalui repository
    await profileRepository.updateAvatarUrl(userId, publicUrl);

    return publicUrl;
  },

  /**
   * Mengubah status peran aktif pengguna melalui repository
   */
  async switchRole(userId, newRole) {
    return await profileRepository.switchRole(userId, newRole);
  }
};
