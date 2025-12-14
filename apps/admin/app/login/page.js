'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@rideon.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const {data} = await api.post('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (data.success && data.data.user.role === 'admin') {
        // Store token and user info
        localStorage.setItem('rideon_admin_token', data.data.accessToken)
        localStorage.setItem('rideon_admin_user', JSON.stringify(data.data.user))

        // Redirect to dashboard
        router.push('/')
      } else if (data.success && data.data.user.role !== 'admin') {
        setError('Access denied. Admin credentials required.')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      setError('Failed to login. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                RideOn Admin
              </h1>
              <p className="text-xs text-gray-500">Dashboard & Management</p>
            </div>
          </div>
          <p className="text-gray-600">Admin access required</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rideon.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md"
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-purple-900 mb-2">🔑 Demo Admin Credentials:</p>
            <div className="text-xs text-purple-800 space-y-1 font-mono">
              <p>Email: admin@rideon.com</p>
              <p>Password: admin123</p>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              ⚠️ For demo purposes only. Change in production.
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">🛡️ Secure Admin Access</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Only admin users can access this panel</li>
              <li>• All actions are logged for security</li>
              <li>• Two-factor authentication coming soon</li>
            </ul>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="mt-4 text-center">
          <a href="http://localhost:3000" className="text-sm text-purple-600 hover:text-purple-700">
            ← Back to RideOn Main Site
          </a>
        </div>
      </div>
    </div>
  )
}
