'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Custom hook untuk mengambil data profil user yang sedang login.
 * Dipakai di layout sidebar dan halaman profil.
 *
 * @returns {{ profile: object|null, user: object|null, loading: boolean, error: string|null, refetch: Function }}
 */
export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Ambil user yang sedang login
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // 2. Ambil data profil dari tabel profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      setProfile(profileData);
    } catch (err) {
      console.error('useProfile error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);

    // Listen untuk perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile();
      } else {
        setTimeout(() => {
          setUser(null);
          setProfile(null);
        }, 0);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase.auth]);

  return { profile, user, loading, error, refetch: fetchProfile };
}
