import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  try {
    if (!code) {
      console.error('[OAuth] No code present in API callback')
      return NextResponse.redirect(new URL('/login?error=no_code', req.url))
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[OAuth] API code exchange failed:', error.message)
      return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
    }

    // Success: go to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch (e: any) {
    console.error('[OAuth] API callback error:', e?.message || e)
    return NextResponse.redirect(new URL('/login?error=unexpected_error', req.url))
  }
}
