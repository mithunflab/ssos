// Check if Supabase environment variables are configured
export const checkSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('❌ Supabase is not configured!')
    console.error('Please create a .env.local file with:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL=your-url')
    console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
    console.error('')
    console.error('See AUTH_SETUP.md for detailed instructions.')
    return false
  }

  if (url.includes('your-project') || key.includes('your-anon-key')) {
    console.error('❌ Please update your .env.local with actual Supabase credentials')
    console.error('See AUTH_SETUP.md for instructions.')
    return false
  }

  console.log('✅ Supabase configuration detected')
  return true
}

// Check in development mode
if (process.env.NODE_ENV === 'development') {
  checkSupabaseConfig()
}
