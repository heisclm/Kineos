import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return supabaseResponse;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Performance Fast-Path: Only verify auth on admin, settings, and login routes
    const pathname = request.nextUrl.pathname;
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin-login');
    const isProtectedRoute = (pathname.startsWith('/admin') && !pathname.startsWith('/admin-login')) || pathname.startsWith('/settings');

    if (!isProtectedRoute && !isAuthRoute) {
      return supabaseResponse;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin-login'
      return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      if (request.nextUrl.pathname.startsWith('/admin-login')) {
        url.pathname = '/admin'
      } else {
        url.pathname = '/'
      }
      return NextResponse.redirect(url)
    }
  } catch (e) {
    // Graceful fail for local dev without env vars
  }

  return supabaseResponse
}
