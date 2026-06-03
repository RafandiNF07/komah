'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Custom hook untuk mengambil data profil user yang sedang login.
 * Menggunakan pola Stale-While-Revalidate (SWR) untuk performa instan (0ms delay).
 *
 * @returns {{ profile: object|null, user: object|null, loading: boolean, error: string|null, refetch: Function }}
 */
export function useProfile() {
  const supabase = createClient();

  // Lazy initial state untuk mengambil data dari cache localStorage saat mount di client
  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('komah_profile_cache');
        return cached ? JSON.parse(cached) : null;
      } catch (e) {
        console.error('Failed to parse cached profile:', e);
        return null;
      }
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('komah_user_cache');
        return cached ? JSON.parse(cached) : null;
      } catch (e) {
        console.error('Failed to parse cached user:', e);
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('komah_profile_cache');
      return !cached; // Jika ada cache, set loading = false (SWR)
    }
    return true;
  });

  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      }
      setError(null);

      // Ambil session saat ini secara instan dari memory/localStorage bawaan Supabase client
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const currentUser = session?.user || null;

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('komah_profile_cache');
          localStorage.removeItem('komah_user_cache');
        }
        setLoading(false);
        return;
      }

      setUser(currentUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('komah_user_cache', JSON.stringify(currentUser));
      }

      // Ambil data profil dari tabel profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      setProfile(profileData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('komah_profile_cache', JSON.stringify(profileData));
      }
    } catch (err) {
      console.error('useProfile error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Jalankan fetch pertama kali (silent refresh jika sudah ada cache)
    const hasCache = !!profile;
    const timer = setTimeout(() => {
      fetchProfile(hasCache);
    }, 0);

    // Dengar perubahan status autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('komah_profile_cache');
          localStorage.removeItem('komah_user_cache');
        }
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase.auth, profile]);

  return { profile, user, loading, error, refetch: () => fetchProfile(false) };
}
