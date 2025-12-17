'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ToastProvider } from '@/components/ui/Toast'
import { ConfirmProvider } from '@/components/ui/ConfirmModal'
import { SocketProvider, useSocket } from '@/components/providers/SocketProvider'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'User Management', href: '/admin/users', icon: '👥', sub: [
    { name: 'Riders', href: '/admin/users/riders' },
    { name: 'Drivers', href: '/admin/users/drivers' },
    { name: 'Fleet Owners', href: '/admin/users/fleet' },
    { name: 'Admin Staff', href: '/admin/users/staff' },
  ]},
  { name: 'Trips & Booking', href: '/admin/trips', icon: '🗺️', sub: [
    { name: 'All Trips', href: '/admin/trips/all' },
    { name: 'Live Monitor', href: '/admin/trips/live' },
    { name: 'Manual Booking', href: '/admin/trips/manual' },
    { name: 'Scheduled Rides', href: '/admin/trips/scheduled' },
  ]},
  { name: 'Pricing & Fares', href: '/admin/pricing', icon: '💰' },
  { name: 'Payments & Wallet', href: '/admin/payments', icon: '💳' },
  { name: 'Geography & Zones', href: '/admin/geography', icon: '🌍' },
  { name: 'Promotions', href: '/admin/promotions', icon: '🎁' },
  { name: 'Support', href: '/admin/support', icon: '🎧' },
  { name: 'Ratings & Quality', href: '/admin/ratings', icon: '⭐' },
  { name: 'Onboarding', href: '/admin/onboarding', icon: '✅' },
  { name: 'System Config', href: '/admin/config', icon: '⚙️' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Security & Logs', href: '/admin/security', icon: '🔒' },
  { name: 'Integrations', href: '/admin/integrations', icon: '🔌' },
  { name: 'War Room', href: '/admin/warroom', icon: '🚨' },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('rideon_token')
    const userData = localStorage.getItem('rideon_user')

    if (!token) {
      router.push('/auth/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('rideon_token')
    localStorage.removeItem('rideon_user')
    router.push('/auth/login')
  }

  const toggleExpand = (name) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  if (!mounted || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <SocketProvider>
    <ToastProvider>
    <ConfirmProvider>
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-bold text-xl">R</span>
              </div>
              <span className="font-bold text-lg">RideOn Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((item) => (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 hover:bg-blue-700 transition ${
                  pathname === item.href ? 'bg-blue-700 border-l-4 border-white' : ''
                }`}
                onClick={(e) => {
                  if (item.sub) {
                    e.preventDefault()
                    toggleExpand(item.name)
                  }
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="ml-3 flex-1">{item.name}</span>
                    {item.sub && (
                      <span>{expandedItems[item.name] ? '▼' : '▶'}</span>
                    )}
                  </>
                )}
              </Link>

              {/* Sub-navigation */}
              {item.sub && expandedItems[item.name] && sidebarOpen && (
                <div className="bg-blue-800 bg-opacity-50">
                  {item.sub.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={`flex items-center px-12 py-2 hover:bg-blue-700 transition text-sm ${
                        pathname === subItem.href ? 'bg-blue-700' : ''
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-blue-700">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{user.firstName?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.firstName}</p>
                  <p className="text-xs text-blue-300 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-xl">⚙️</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
    </ConfirmProvider>
    </ToastProvider>
    </SocketProvider>
  )
}
