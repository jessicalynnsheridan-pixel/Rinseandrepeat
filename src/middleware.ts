import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/pricing']
const AUTH_PATHS = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  const isPublic =
    PUBLIC_PATHS.includes(path) ||
    path.startsWith('/auth/') ||
    path.startsWith('/_next') ||
    path.startsWith('/api/')

  // Not logged in → redirect to login
  if (!session && !isPublic) {
    const url = new URL('/login', req.url)
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Logged in + trying to visit login/signup → send to dashboard
  if (session && AUTH_PATHS.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Logged in + onboarding not complete → force onboarding (except if already there)
  if (session && !path.startsWith('/onboarding') && !path.startsWith('/auth/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single()

    // Only redirect if profile exists AND onboarding is explicitly false
    // (null profile = brand-new user, trigger may not have run yet)
    if (profile && profile.onboarding_completed === false && path !== '/') {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
