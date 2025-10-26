import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
    supabaseKey: supabaseKey ? 'SET (length: ' + supabaseKey.length + ')' : 'NOT SET',
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'YES' : 'NO',
  })
}