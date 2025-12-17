'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()

  // Don't show sidebar on login page
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
