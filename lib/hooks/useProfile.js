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

  // States initialized to null/true to ensure server-client HTML consistency on initial render
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    let hasCache = false;
    try {
      const cachedProfile = localStorage.getItem('komah_profile_cache');
      if (cachedProfile) {
        hasCache = true;
      }
    } catch (e) {
      // Ignored for synchronous check
    }

    // Load cache and fetch asynchronously to prevent hydration mismatch and avoid linter set-state-in-effect warning
    const timer = setTimeout(() => {
      try {
        const cachedProfile = localStorage.getItem('komah_profile_cache');
        const cachedUser = localStorage.getItem('komah_user_cache');
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
        }
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
        if (cachedProfile) {
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load profile/user cache:', e);
      }

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
  }, [fetchProfile, supabase.auth]);

  return { profile, user, loading, error, refetch: () => fetchProfile(false) };
}
