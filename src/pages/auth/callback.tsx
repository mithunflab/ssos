import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBrowserClient } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createBrowserClient()
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')

        if (code) {
          const result = await Promise.race([
            supabase.auth.exchangeCodeForSession(code),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 10000)
            )
          ]) as any

          if (result.error) {
            setError(result.error.message)
            setTimeout(() => navigate('/login?error=oauth_failed'), 2000)
            return
          }
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          navigate('/dashboard')
        } else {
          setError('No session created')
          setTimeout(() => navigate('/login?error=no_session'), 2000)
        }
      } catch (e: any) {
        setError(e?.message || 'Unknown error')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          {error ? 'Authentication Failed' : 'Signing you in...'}
        </h1>
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-gray-400">Please wait...</p>
        )}
      </div>
    </div>
  )
}
