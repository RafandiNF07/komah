import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Middleware untuk:
 * 1. Refresh session token otomatis
 * 2. Proteksi route /user/* dan /driver/* (harus login)
 * 3. Redirect /login dan /register ke dashboard jika sudah login
 * 4. Role-based redirect: customer → /user, driver → /driver
 */
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Route yang memerlukan autentikasi
  const protectedRoutes = ['/user', '/driver'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Route auth (login/register)
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !user) {
    // Belum login → redirect ke login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && user) {
    // Sudah login → redirect ke dashboard sesuai role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const redirectTo = profile?.role === 'driver' ? '/driver' : '/user';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Cek akses role: customer tidak boleh ke /driver dan sebaliknya
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (pathname.startsWith('/driver') && profile.role !== 'driver') {
        return NextResponse.redirect(new URL('/user', request.url));
      }
      if (pathname.startsWith('/user') && profile.role !== 'customer') {
        return NextResponse.redirect(new URL('/driver', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match semua route kecuali:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, icons/ (static assets)
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|api).*)',
  ],
};
