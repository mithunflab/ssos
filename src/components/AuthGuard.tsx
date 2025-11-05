import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { usePathname } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const pathname = usePathname()

  // Public paths that don't require authentication
  const isPublicPath = 
    pathname === '/' || 
    pathname.startsWith('/public/') ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/')

  useEffect(() => {
    // Only show modal if user is not authenticated and path is not public
    if (!authLoading && !user && !isPublicPath) {
      setShowModal(true)
    }
  }, [user, authLoading, isPublicPath])

  if (isPublicPath) {
    return <>{children}</>
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-200 rounded-2xl mb-4"></div>
          <div className="h-4 w-32 bg-orange-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {user ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-orange-600 mb-4">Please Sign In</h1>
            <p className="text-gray-700 mb-6">
              You need to be signed in to access this page
            </p>
          </div>
        </div>
      )}
      
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        returnUrl={pathname}
      />
    </>
  )
}