import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  try {
    if (!code) {
      console.error('[OAuth] No code present in API callback')
      return NextResponse.redirect(new URL('/login?error=no_code', req.url))
    }

    const supabase = createRouteHandlerClient({ cookies })
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
