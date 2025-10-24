import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Server-side OAuth callback handler: exchanges the code and redirects to dashboard
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  try {
    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('❌ Server-side code exchange failed:', error.message)
        return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
      }
    } else {
      console.error('❌ No code present in callback URL')
      return NextResponse.redirect(new URL('/login?error=no_code', req.url))
    }

    // On success, go straight to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch (e: any) {
    console.error('❌ OAuth callback handler error:', e?.message || e)
    return NextResponse.redirect(new URL('/login?error=unexpected_error', req.url))
  }
}
