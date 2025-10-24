import { createClient } from '@supabase/supabase-js'

export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if environment variables are set
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE NOT CONFIGURED!')
    console.error('Please create .env.local file with:')
    console.error('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
    throw new Error('Supabase environment variables are not configured. See console for details.')
  }

  if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-')) {
    console.error('❌ SUPABASE CREDENTIALS ARE PLACEHOLDER VALUES!')
    console.error('Please update .env.local with your actual Supabase credentials')
    throw new Error('Please update Supabase credentials in .env.local')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Handle OAuth callbacks manually
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Use PKCE (recommended). The browser client will store code_verifier in localStorage
      // and handle exchanging the code for a session on the client.
      flowType: 'pkce',
    },
  })
}

export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
