'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { ReminderEngine } from '@/components/ReminderEngine'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show sidebar on auth pages
  const isAuthPage =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/auth')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <ReminderEngine />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
