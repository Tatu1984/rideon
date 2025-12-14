'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../services/api'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalTrips: 0,
    activeTrips: 0
  })

  useEffect(() => {
    const token = localStorage.getItem('rideon_token')
    const userData = localStorage.getItem('rideon_user')

    if (!token) {
      router.push('/auth/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Load stats from backend
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const {data} = await api.get('/api/admin/users')
      
      setStats({
        totalUsers: data.data?.length || 0,
        totalDrivers: 0,
        totalTrips: 0,
        activeTrips: 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('rideon_token')
    localStorage.removeItem('rideon_user')
    router.push('/auth/login')
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RideOn Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.firstName}!</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDrivers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Trips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeTrips}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="text-3xl mb-2">👤</div>
              <div className="text-sm font-medium">Manage Users</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="text-3xl mb-2">🚗</div>
              <div className="text-sm font-medium">Manage Drivers</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="text-3xl mb-2">🗺️</div>
              <div className="text-sm font-medium">View Trips</div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="text-3xl mb-2">⚙️</div>
              <div className="text-sm font-medium">Settings</div>
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-4xl mr-4">✅</div>
            <div>
              <h3 className="text-lg font-bold text-green-900 mb-2">Admin Login Successful!</h3>
              <p className="text-green-800">
                You are now logged in as {user.email}. This is the admin dashboard where you can manage your RideOn platform.
              </p>
              <div className="mt-4 space-y-1 text-sm text-green-700">
                <p>✅ Backend API: Running on port 3001</p>
                <p>✅ Admin Panel: Running on port 3000</p>
                <p>✅ Mobile Apps: Check terminals for QR codes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
