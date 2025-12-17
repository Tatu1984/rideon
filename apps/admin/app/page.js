'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '../services/api'

// Dynamically import map components (client-side only)
const LiveTrackingMap = dynamic(() => import('../components/dashboard/LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  )
})

const ActiveRidesList = dynamic(() => import('../components/dashboard/ActiveRidesList'), {
  ssr: false
})

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
    pendingVerifications: 0,
    openTickets: 0,
  })
  const [activeTrips, setActiveTrips] = useState([])
  const [onlineDrivers, setOnlineDrivers] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('live') // 'live' or 'analytics'

  useEffect(() => {
    const token = localStorage.getItem('rideon_admin_token')
    const user = JSON.parse(localStorage.getItem('rideon_admin_user') || '{}')

    if (!token || user.role !== 'admin') {
      router.push('/login')
      return
    }

    fetchDashboardData()

    // Set up polling for live data
    const interval = setInterval(() => {
      fetchLiveData()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchLiveData = useCallback(async () => {
    try {
      // Fetch active trips
      const tripsRes = await api.admin.getTrips({ status: 'in_progress,accepted,requested', limit: 50 })
      if (tripsRes.success) {
        const tripsList = tripsRes.data?.data?.trips || tripsRes.data?.trips || []
        setActiveTrips(tripsList.filter(t =>
          ['requested', 'accepted', 'arrived', 'in_progress'].includes(t.status)
        ))
      }

      // Fetch online drivers
      const driversRes = await api.admin.getDrivers({ status: 'available,busy', limit: 100 })
      if (driversRes.success) {
        const driversList = driversRes.data?.data || driversRes.data?.drivers || []
        setOnlineDrivers(driversList.filter(d => d.status === 'available' || d.status === 'busy'))
      }
    } catch (error) {
      console.error('Error fetching live data:', error)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard summary
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

      // Fetch live data
      await fetchLiveData()

      // Fetch revenue analytics for mini chart
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 7)

      const revenueRes = await api.admin.getRevenueAnalytics({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        groupBy: 'day'
      })
      if (revenueRes.success && revenueRes.data?.data?.timeline) {
        const timeline = revenueRes.data.data.timeline
        setRevenueData(timeline.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: item.revenue || 0
        })))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('rideon_admin_token')
    localStorage.removeItem('rideon_admin_user')
    router.push('/login')
  }

  const handleViewTripDetails = (trip) => {
    router.push(`/trips?id=${trip.id}`)
  }

  // Sidebar menu items
  const menuItems = [
    { name: 'Dashboard', icon: 'home', path: '/', active: true },
    { name: 'Live Tracking', icon: 'map', path: '/', onClick: () => setViewMode('live') },
    { name: 'Trips', icon: 'route', path: '/trips' },
    { name: 'Users', icon: 'users', path: '/users' },
    { name: 'Drivers', icon: 'car', path: '/drivers' },
    { name: 'Driver KYC', icon: 'document', path: '/drivers/kyc' },
    { name: 'Fleet', icon: 'fleet', path: '/fleet' },
    { name: 'Vehicles', icon: 'vehicle', path: '/vehicles' },
    { name: 'Pricing', icon: 'dollar', path: '/pricing' },
    { name: 'Zones', icon: 'zone', path: '/zones' },
    { name: 'Cities', icon: 'city', path: '/cities' },
    { name: 'Promotions', icon: 'tag', path: '/promotions' },
    { name: 'Wallet', icon: 'wallet', path: '/wallet' },
    { name: 'Analytics', icon: 'chart', path: '/analytics' },
    { name: 'Referrals', icon: 'referral', path: '/referrals' },
    { name: 'Scheduled', icon: 'calendar', path: '/scheduled' },
    { name: 'Emergency', icon: 'emergency', path: '/emergency' },
    { name: 'Support', icon: 'support', path: '/support' },
    { name: 'Notifications', icon: 'bell', path: '/notifications' },
    { name: 'Approvals', icon: 'check', path: '/approvals' },
    { name: 'Team', icon: 'team', path: '/team' },
    { name: 'Settings', icon: 'settings', path: '/settings' },
  ]

  const getIcon = (iconName) => {
    const icons = {
      home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      map: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
      route: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
      car: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      fleet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
      vehicle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />,
      dollar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      zone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
      city: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      tag: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
      wallet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
      chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      referral: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
      calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      emergency: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
      support: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />,
      bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
      check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      team: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
      settings: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
    }
    return icons[iconName] || icons.home
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
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Quick Stats */}
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">{activeTrips.length} Active Trips</span>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-green-600">{onlineDrivers.filter(d => d.status === 'available').length}</span> drivers online
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="text-sm text-gray-600">
            Revenue: <span className="font-medium text-purple-600">${stats.totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {stats.openTickets > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {stats.openTickets}
              </span>
            )}
          </button>
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-medium text-sm">A</span>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Active Trips</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{activeTrips.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Online Drivers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{onlineDrivers.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalRevenue.toFixed(0)}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingVerifications}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Live Tracking Section */}
          <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 280px)' }}>
            {/* Map - Takes 2/3 of width */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-lg font-bold text-gray-900">Live Tracking</h2>
                </div>
                <button
                  onClick={fetchLiveData}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
              <div className="h-[calc(100%-56px)]">
                <LiveTrackingMap
                  activeTrips={activeTrips}
                  onlineDrivers={onlineDrivers}
                  selectedTrip={selectedTrip}
                  onSelectTrip={setSelectedTrip}
                />
              </div>
            </div>

            {/* Active Rides List - Takes 1/3 of width */}
            <div className="col-span-1 h-full">
              <ActiveRidesList
                trips={activeTrips}
                selectedTrip={selectedTrip}
                onSelectTrip={setSelectedTrip}
                onViewDetails={handleViewTripDetails}
              />
            </div>
          </div>
        </main>

      {/* Add Leaflet CSS */}
      <style jsx global>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }

        .leaflet-popup-content {
          margin: 8px 12px;
        }
      `}</style>
    </div>
  )
}
