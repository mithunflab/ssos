import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr'

export const createBrowserClient = () => {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

  return createBrowserClientSSR(supabaseUrl, supabaseKey)
}
