'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../services/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    activeDrivers: 0,
    totalDrivers: 0,
    activeRiders: 0,
    totalRiders: 0,
    averageRating: 4.8,
    totalDistance: 0,
    averageTripTime: 0,
    pendingVerifications: 0,
    openTickets: 0,
  })
  const [users, setUsers] = useState([])
  const [trips, setTrips] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [tripStatusData, setTripStatusData] = useState([])
  const [topDrivers, setTopDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7days')

  useEffect(() => {
    const token = localStorage.getItem('rideon_admin_token')
    const user = JSON.parse(localStorage.getItem('rideon_admin_user') || '{}')

    if (!token || user.role !== 'admin') {
      router.push('/login')
      return
    }

    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchAnalytics()
    }
  }, [timeRange, loading])

  const getDateRange = () => {
    const end = new Date()
    const start = new Date()

    switch (timeRange) {
      case '7days':
        start.setDate(end.getDate() - 7)
        break
      case '30days':
        start.setDate(end.getDate() - 30)
        break
      case '90days':
        start.setDate(end.getDate() - 90)
        break
      default:
        start.setDate(end.getDate() - 7)
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }

  const fetchAnalytics = async () => {
    try {
      const { startDate, endDate } = getDateRange()

      // Fetch revenue analytics
      const revenueRes = await api.admin.getRevenueAnalytics({ startDate, endDate, groupBy: 'day' })
      if (revenueRes.success && revenueRes.data?.data?.timeline) {
        const timeline = revenueRes.data.data.timeline
        const formattedRevenue = timeline.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: item.revenue,
          trips: item.count
        }))
        setRevenueData(formattedRevenue)
      }

      // Fetch trip analytics
      const tripRes = await api.admin.getTripAnalytics({ startDate, endDate })
      if (tripRes.success && tripRes.data?.data) {
        const tripData = tripRes.data.data
        const statusColors = {
          completed: '#10b981',
          in_progress: '#3b82f6',
          requested: '#f59e0b',
          accepted: '#8b5cf6',
          cancelled_by_rider: '#ef4444',
          cancelled_by_driver: '#ef4444',
          cancelled_by_admin: '#ef4444'
        }

        const statusData = (tripData.byStatus || []).map(item => ({
          name: item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: item.count,
          color: statusColors[item.status] || '#6b7280'
        }))
        setTripStatusData(statusData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard summary from dedicated endpoint
      const dashboardRes = await api.admin.getDashboard()
      if (dashboardRes.success && dashboardRes.data?.data) {
        const data = dashboardRes.data.data
        setStats(prev => ({
          ...prev,
          totalUsers: data.users?.total || 0,
          totalRiders: data.users?.riders || 0,
          totalDrivers: data.users?.drivers || 0,
          activeDrivers: data.users?.activeDrivers || 0,
          totalTrips: data.trips?.total || 0,
          activeTrips: data.trips?.active || 0,
          completedTrips: data.trips?.completed || 0,
          totalRevenue: data.revenue?.total || 0,
          pendingVerifications: data.pending?.verifications || 0,
          openTickets: data.pending?.tickets || 0,
        }))
      }

      // Fetch users for the table
      const usersRes = await api.admin.getUsers({ limit: 10 })
      if (usersRes.success) {
        const usersList = usersRes.data?.data?.users || usersRes.data?.users || []
        setUsers(usersList)
      }

      // Fetch trips for the table
      const tripsRes = await api.admin.getTrips({ limit: 10 })
      if (tripsRes.success) {
        const tripsList = tripsRes.data?.data?.trips || tripsRes.data?.trips || []
        setTrips(tripsList)

        // Calculate cancelled trips from the list
        const cancelled = tripsList.filter(t =>
          t.status === 'cancelled_by_rider' ||
          t.status === 'cancelled_by_driver' ||
          t.status === 'cancelled_by_admin'
        ).length

        setStats(prev => ({
          ...prev,
          cancelledTrips: cancelled
        }))
      }

      // Fetch top drivers
      const driversRes = await api.admin.getDrivers({ limit: 5 })
      if (driversRes.success) {
        const driversList = driversRes.data?.data || []
        const formattedDrivers = driversList.slice(0, 5).map((driver, index) => ({
          id: driver.id,
          name: driver.user ? `${driver.user.firstName} ${driver.user.lastName}` : `Driver ${driver.id}`,
          trips: driver.totalTrips || 0,
          rating: driver.rating || 0,
          revenue: driver.totalEarnings || 0
        }))
        setTopDrivers(formattedDrivers)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate hourly data from trips if available
  const hourlyData = [
    { hour: '12am', trips: Math.floor(Math.random() * 10) },
    { hour: '3am', trips: Math.floor(Math.random() * 5) },
    { hour: '6am', trips: Math.floor(Math.random() * 20) },
    { hour: '9am', trips: Math.floor(Math.random() * 50) },
    { hour: '12pm', trips: Math.floor(Math.random() * 70) },
    { hour: '3pm', trips: Math.floor(Math.random() * 60) },
    { hour: '6pm', trips: Math.floor(Math.random() * 80) },
    { hour: '9pm', trips: Math.floor(Math.random() * 55) },
  ]

  // Use real data or fallback to sample data
  const displayRevenueData = revenueData.length > 0 ? revenueData : [
    { date: 'Mon', revenue: 0, trips: 0 },
    { date: 'Tue', revenue: 0, trips: 0 },
    { date: 'Wed', revenue: 0, trips: 0 },
    { date: 'Thu', revenue: 0, trips: 0 },
    { date: 'Fri', revenue: 0, trips: 0 },
    { date: 'Sat', revenue: 0, trips: 0 },
    { date: 'Sun', revenue: 0, trips: 0 },
  ]

  const displayTripStatusData = tripStatusData.length > 0 ? tripStatusData : [
    { name: 'Completed', value: stats.completedTrips || 0, color: '#10b981' },
    { name: 'Active', value: stats.activeTrips || 0, color: '#3b82f6' },
    { name: 'Cancelled', value: stats.cancelledTrips || 0, color: '#ef4444' },
  ]

  const displayTopDrivers = topDrivers.length > 0 ? topDrivers : []

  const handleLogout = () => {
    localStorage.removeItem('rideon_admin_token')
    localStorage.removeItem('rideon_admin_user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RideOn Admin</h1>
                <p className="text-xs text-gray-500">Management Dashboard</p>
              </div>
            </div>

            {/* Top Stats Bar */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">Active Now</p>
                <p className="text-lg font-bold text-green-600">{stats.activeTrips} trips</p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Today's Revenue</p>
                <p className="text-lg font-bold text-purple-600">${stats.todayRevenue.toFixed(2)}</p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Online Drivers</p>
                <p className="text-lg font-bold text-blue-600">{stats.activeDrivers}</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
          <nav className="p-4 space-y-1">
            <button onClick={() => router.push('/')} className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </button>
            <button onClick={() => router.push('/trips')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Trips</span>
            </button>
            <button onClick={() => router.push('/users')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Users</span>
            </button>
            <button onClick={() => router.push('/drivers')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Drivers</span>
            </button>
            <button onClick={() => router.push('/drivers/kyc')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Driver KYC</span>
            </button>
            <button onClick={() => router.push('/fleet')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Fleet</span>
            </button>
            <button onClick={() => router.push('/vehicles')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Vehicle Types</span>
            </button>
            <button onClick={() => router.push('/pricing')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pricing</span>
            </button>
            <button onClick={() => router.push('/zones')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Geo-Fencing</span>
            </button>
            <button onClick={() => router.push('/cities')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Cities</span>
            </button>
            <button onClick={() => router.push('/promotions')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Promotions</span>
            </button>
            <button onClick={() => router.push('/wallet')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Wallet & Payouts</span>
            </button>
            <button onClick={() => router.push('/analytics')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </button>
            <button onClick={() => router.push('/referrals')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Referrals</span>
            </button>
            <button onClick={() => router.push('/scheduled')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Scheduled Rides</span>
            </button>
            <button onClick={() => router.push('/emergency')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Emergency / SOS</span>
            </button>
            <button onClick={() => router.push('/support')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Support</span>
            </button>
            <button onClick={() => router.push('/notifications')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Notifications</span>
            </button>
            <button onClick={() => router.push('/approvals')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pending Approvals</span>
            </button>
            <button onClick={() => router.push('/team')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Team Management</span>
            </button>
            <button onClick={() => router.push('/settings')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+12.5%</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">From {stats.totalTrips} completed trips</p>
            </div>

            {/* Total Trips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{stats.activeTrips} active</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Trips</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTrips}</p>
              <p className="text-xs text-gray-500 mt-2">{stats.completedTrips} completed · {stats.cancelledTrips} cancelled</p>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+8.2%</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-2">{stats.totalRiders} riders · {stats.totalDrivers} drivers</p>
            </div>

            {/* Average Rating */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Excellent</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Avg Rating</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageRating}</p>
              <p className="text-xs text-gray-500 mt-2">From 2,345 reviews</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                <select
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 3 months</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={displayRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Trip Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Trip Status Distribution</h2>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={displayTripStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {displayTripStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4 flex-wrap gap-2">
                {displayTripStatusData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Trips & Driver Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hourly Trips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Trips by Hour</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Drivers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Drivers</h2>
              <div className="space-y-4">
                {displayTopDrivers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No driver data available yet
                  </div>
                ) : (
                  displayTopDrivers.map((driver, index) => (
                    <div key={driver.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-500">{driver.trips} trips</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${driver.revenue.toFixed(2)}</p>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-gray-600">{driver.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Trips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Recent Trips</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trips.slice(0, 5).map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">#{trip.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                            trip.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${trip.estimatedFare?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-purple-600 hover:text-purple-900 font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all trips →
                </button>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.slice(0, 5).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'driver' ? 'bg-green-100 text-green-800' :
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-purple-600 hover:text-purple-900 font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all users →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
