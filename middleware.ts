import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Protect recruiter routes
  if (path.startsWith('/recruiter-dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/recruiter-login', req.url))
    }

    // Check if user is a recruiter
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, recruiter_approved')
      .eq('user_id', session.user.id)
      .single()

    if (!profile || profile.role !== 'recruiter') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/recruiter-login', req.url))
    }

    if (!profile.recruiter_approved) {
      return NextResponse.redirect(new URL('/recruiter-login?message=pending', req.url))
    }
  }

  // Redirect recruiters away from athlete dashboard
  if (path.startsWith('/dashboard') && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (profile?.role === 'recruiter') {
      return NextResponse.redirect(new URL('/recruiter-dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/recruiter-dashboard/:path*',
    '/dashboard/:path*',
  ],
}
