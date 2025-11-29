'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const router = useRouter()
  const [overview, setOverview] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) router.push('/login')
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/analytics/overview'),
        fetch('http://localhost:3001/api/admin/analytics/revenue')
      ])
      const [overviewData, revData] = await Promise.all([overviewRes.json(), revenueRes.json()])
      if (overviewData.success) setOverview(overviewData.data)
      if (revData.success) setRevenueData(revData.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/')} className="text-purple-600 hover:text-purple-700">← Back</button>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? <div className="text-center py-12">Loading...</div> : (
          <>
            {overview && (
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="text-sm opacity-90">Total Revenue</div>
                  <div className="text-3xl font-bold mt-2">${overview.totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="text-sm opacity-90">Total Trips</div>
                  <div className="text-3xl font-bold mt-2">{overview.totalTrips}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="text-sm opacity-90">Total Users</div>
                  <div className="text-3xl font-bold mt-2">{overview.totalUsers}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="text-sm opacity-90">Completion Rate</div>
                  <div className="text-3xl font-bold mt-2">{overview.completionRate}%</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Trips Volume</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="trips" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Average Rating</div>
                  <div className="text-2xl font-bold text-yellow-600">{overview?.averageRating || 0}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Total Drivers</div>
                  <div className="text-2xl font-bold text-green-600">{overview?.totalDrivers || 0}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Active Users</div>
                  <div className="text-2xl font-bold text-blue-600">{overview?.totalUsers || 0}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
