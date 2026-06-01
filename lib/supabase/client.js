'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client untuk digunakan di komponen 'use client'.
 * Singleton pattern — satu instance per tab browser.
 */
let supabase = null;

export function createClient() {
  if (supabase) return supabase;

  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return supabase;
}
