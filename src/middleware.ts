import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Cache for session checks (in-memory, per request cycle)
const sessionCache = new WeakMap<NextRequest, boolean>()

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Fast path: Don't interfere with callbacks, API routes, or static files
  if (
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    console.log('[Middleware] Skipping auth check for:', pathname)
    return NextResponse.next()
  }

  // Define public and auth paths
  const isPublicPath = 
    pathname === '/' || 
    pathname.startsWith('/public/') ||
    pathname === '/privacy' ||
    pathname === '/terms'

  const isAuthPage = pathname === '/login' || pathname === '/signup'

  // Everything else is protected
  const isProtectedPath = !isPublicPath && !isAuthPage

  // Check cache first
  let hasSession = sessionCache.get(req)

  if (hasSession === undefined) {
    // Only create Supabase client if needed
    const res = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      hasSession = !!session
      sessionCache.set(req, hasSession)
    } catch (error) {
      console.error('[Middleware] Session check error:', error)
      hasSession = false
    }
  }

  // Redirect logic with return URL
  if (isProtectedPath && !hasSession) {
    const returnUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url))
  }

  if (isAuthPage && hasSession) {
    // If there's a return URL in the query params, use it
    const returnUrl = req.nextUrl.searchParams.get('returnUrl')
    const redirectUrl = returnUrl ? decodeURIComponent(returnUrl) : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Cache buster for authenticated pages to prevent showing stale data
  const response = NextResponse.next()
  if (hasSession && isProtectedPath) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
