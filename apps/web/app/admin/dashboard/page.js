'use client'

import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalTrips: 0,
    activeTrips: 0,
    onlineDrivers: 0,
    todayRevenue: 0,
    pendingSupport: 0,
    activeSurgeZones: 0
  })

  const [recentTrips, setRecentTrips] = useState([])
  const [systemHealth, setSystemHealth] = useState({
    api: 'healthy',
    database: 'healthy',
    payments: 'healthy',
    maps: 'healthy'
  })

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load users
      const usersRes = await fetch('http://localhost:3001/api/admin/users')
      const usersData = await usersRes.json()

      // Load drivers
      const driversRes = await fetch('http://localhost:3001/api/admin/drivers')
      const driversData = await driversRes.json()

      setStats({
        totalUsers: usersData.data?.length || 0,
        totalDrivers: driversData.data?.length || 0,
        totalTrips: 0,
        activeTrips: 0,
        onlineDrivers: driversData.data?.filter(d => d.status === 'online').length || 0,
        todayRevenue: 0,
        pendingSupport: 0,
        activeSurgeZones: 0
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
          change="+12%"
        />
        <StatCard
          title="Total Drivers"
          value={stats.totalDrivers}
          icon="🚗"
          color="green"
          subtitle={`${stats.onlineDrivers} online`}
        />
        <StatCard
          title="Active Trips"
          value={stats.activeTrips}
          icon="🗺️"
          color="yellow"
          subtitle={`${stats.totalTrips} total`}
        />
        <StatCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue}`}
          icon="💰"
          color="purple"
          change="+8%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MiniStatCard title="Online Drivers" value={stats.onlineDrivers} icon="🟢" />
        <MiniStatCard title="Surge Zones" value={stats.activeSurgeZones} icon="⚡" />
        <MiniStatCard title="Support Tickets" value={stats.pendingSupport} icon="🎧" />
        <MiniStatCard title="System Health" value="100%" icon="✅" />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Trip Monitor */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Live Trip Monitor</h3>
          <div className="space-y-3">
            {recentTrips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active trips at the moment
              </div>
            ) : (
              recentTrips.map((trip) => (
                <TripItem key={trip.id} trip={trip} />
              ))
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <HealthItem name="API Server" status={systemHealth.api} />
            <HealthItem name="Database" status={systemHealth.database} />
            <HealthItem name="Payment Gateway" status={systemHealth.payments} />
            <HealthItem name="Maps Service" status={systemHealth.maps} />
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview (Last 7 Days)</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {[120, 150, 180, 160, 200, 220, 250].map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition cursor-pointer"
                style={{ height: `${(value / 250) * 100}%` }}
                title={`$${value}`}
              ></div>
              <span className="text-xs text-gray-500 mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon="👤" label="Add User" href="/admin/users/riders" />
          <QuickAction icon="🚗" label="Add Driver" href="/admin/users/drivers" />
          <QuickAction icon="🗺️" label="Manual Booking" href="/admin/trips/manual" />
          <QuickAction icon="🎁" label="Create Promo" href="/admin/promotions" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, change, subtitle }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {change && (
          <span className="text-green-600 text-sm font-medium">{change}</span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

function MiniStatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function TripItem({ trip }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xl">🚗</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{trip.rider}</p>
          <p className="text-xs text-gray-500">{trip.route}</p>
        </div>
      </div>
      <span className="text-xs text-green-600 font-medium">In Progress</span>
    </div>
  )
}

function HealthItem({ name, status }) {
  const isHealthy = status === 'healthy'
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      <div className="flex items-center space-x-2">
        <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className={`text-xs font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
          {isHealthy ? 'Healthy' : 'Down'}
        </span>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, href }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  )
}
