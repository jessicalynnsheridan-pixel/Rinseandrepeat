import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/pricing', '/quiz']
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

  // Logged in + onboarding check (skip for /onboarding and /auth/* paths)
  if (session && !path.startsWith('/onboarding') && !path.startsWith('/auth/')) {
    // `rrc_ob` cookie is set after a confirmed onboarding completion.
    // If it exists we skip the DB round-trip entirely - critical for mobile
    // performance since this runs on every page navigation.
    const onboardedCookie = req.cookies.get('rrc_ob')

    if (!onboardedCookie) {
      // No cookie yet - need to check DB (happens only once per session/device)
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (profile && profile.onboarding_completed === false && path !== '/') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      // Onboarding is complete - write the cookie so future requests skip this
      if (profile?.onboarding_completed === true) {
        res.cookies.set('rrc_ob', '1', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
          httpOnly: false, // must be false so client JS can clear it on sign-out
        })
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
