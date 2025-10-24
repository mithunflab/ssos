import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token, expires_at, expires_in } = await req.json()

    console.log('🔐 Setting auth cookies...', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expiresAt: expires_at,
      expiresIn: expires_in,
    })

    if (!access_token || !refresh_token) {
      console.error('❌ Missing tokens')
      return NextResponse.json({ ok: false, error: 'Missing tokens' }, { status: 400 })
    }

    const expiresInSeconds = typeof expires_in === 'number' ? expires_in : 60 * 60 * 24 * 7
    const cookieOptions = {
      path: '/',
      maxAge: expiresInSeconds,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set('sb-access-token', access_token, cookieOptions)
    res.cookies.set('sb-refresh-token', refresh_token, cookieOptions)

    console.log('✅ Auth cookies set successfully')
    return res
  } catch (err) {
    console.error('❌ Error setting cookies:', err)
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
}
