import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require age verification
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/age-verification',
  '/recruiter-login',
  '/request-recruiter-access',
  '/terms',
  '/privacy',
  '/support',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/apple-touch-icon.png',
]

// Static assets
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.svg', '.ico', '.woff', '.woff2']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const path = req.nextUrl.pathname

  // Skip static assets
  if (STATIC_EXTENSIONS.some((ext) => path.endsWith(ext))) {
    return res
  }

  // Skip public routes
  if (PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route + '/'))) {
    return res
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect recruiter routes
  if (path.startsWith('/recruiter-dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/recruiter-login', req.url))
    }

    // Check if user is a recruiter
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, recruiter_approved, age_verified')
      .eq('user_id', session.user.id)
      .single()

    if (!profile || profile.role !== 'recruiter') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/recruiter-login', req.url))
    }

    if (!profile.recruiter_approved) {
      return NextResponse.redirect(new URL('/recruiter-login?message=pending', req.url))
    }

    // Check age verification for recruiters too
    if (!profile.age_verified) {
      return NextResponse.redirect(new URL('/age-verification', req.url))
    }
  }

  // Redirect recruiters away from athlete dashboard
  if (path.startsWith('/dashboard') && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, age_verified')
      .eq('user_id', session.user.id)
      .single()

    if (profile?.role === 'recruiter') {
      return NextResponse.redirect(new URL('/recruiter-dashboard', req.url))
    }

    // Check age verification for athlete dashboard
    if (!profile?.age_verified) {
      return NextResponse.redirect(new URL('/age-verification?returnUrl=' + encodeURIComponent(path), req.url))
    }
  }

  // Check age verification for other protected athlete routes
  const PROTECTED_ATHLETE_ROUTES = ['/profile', '/edit-profile', '/search', '/players']
  
  if (PROTECTED_ATHLETE_ROUTES.some((route) => path.startsWith(route)) && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('age_verified')
      .eq('user_id', session.user.id)
      .single()

    if (!profile?.age_verified) {
      return NextResponse.redirect(new URL('/age-verification?returnUrl=' + encodeURIComponent(path), req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/recruiter-dashboard/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/edit-profile/:path*',
    '/search/:path*',
    '/players/:path*',
  ],
}