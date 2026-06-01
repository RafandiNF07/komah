import { createClient } from '@/lib/supabase/client';

/**
 * Repository untuk berinteraksi dengan profil pengguna dan Supabase Storage.
 * Mengisolasi kueri basis data profil dan pengunggahan berkas gambar.
 */
export const profileRepository = {
  
  /**
   * Mengambil data profil berdasarkan ID Pengguna
   */
  async fetchProfile(userId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Memperbarui informasi profil pengguna (Nama Lengkap, No WhatsApp, Plat, Kendaraan)
   */
  async updateProfile(userId, profileData) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mengunggah berkas foto profil baru ke bucket Supabase Storage 'avatars'
   */
  async uploadAvatar(filePath, fileBody) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBody, { upsert: true });

    if (error) throw error;
    return data;
  },

  /**
   * Memperoleh URL publik berkas yang ada di bucket 'avatars'
   */
  getAvatarPublicUrl(filePath) {
    const supabase = createClient();
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Memperbarui kolom avatar_url di tabel profil database
   */
  async updateAvatarUrl(userId, avatarUrl) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mengalihkan peran akun pengguna (Customer ke Driver atau sebaliknya)
   */
  async switchRole(userId, newRole) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
