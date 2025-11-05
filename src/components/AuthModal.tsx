import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Loader2, X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  returnUrl?: string
}

export function AuthModal({ isOpen, onClose, returnUrl }: AuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('[AuthModal] Initiating Google OAuth...')
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      if (returnUrl) {
        callbackUrl.searchParams.set('returnUrl', returnUrl)
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Browser will redirect to Google
      console.log('[AuthModal] OAuth initiated, redirecting...')
    } catch (err) {
      console.error('[AuthModal] Login error:', err)
      setError('Failed to initiate login. Please try again.')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
            <p className="text-gray-600">Please sign in to access this page</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full btn-primary justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <button
              onClick={() => {
                window.location.replace(`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`)
              }}
              className="w-full btn-secondary"
            >
              Sign in with email
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => {
                window.location.href = `/signup${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`
                onClose()
              }}
              className="text-orange-600 hover:text-orange-500 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}