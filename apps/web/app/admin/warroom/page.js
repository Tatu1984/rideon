'use client'

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { useSocket } from '@/components/providers/SocketProvider'

export default function WarRoom() {
  const toast = useToast()
  const confirm = useConfirm()
  const { isConnected, joinAdminRoom, subscribe, emit } = useSocket()
  const [liveStats, setLiveStats] = useState({
    activeTrips: 0,
    onlineDrivers: 0,
    waitingRiders: 0,
    surgeZones: 0,
    emergencies: 0,
    avgETA: '5m'
  })
  const [incidents, setIncidents] = useState([])
  const [onlineDriversList, setOnlineDriversList] = useState([])

  // Load initial stats
  const loadStats = useCallback(async () => {
    try {
      const [tripsRes, driversRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/trips?status=active'),
        fetch('http://localhost:3001/api/admin/drivers')
      ])
      const tripsData = await tripsRes.json()
      const driversData = await driversRes.json()

      const onlineDrivers = driversData?.data?.filter(d => d.status === 'online') || []

      setLiveStats(prev => ({
        ...prev,
        activeTrips: tripsData?.data?.length || 0,
        onlineDrivers: onlineDrivers.length,
        waitingRiders: 0, // Would come from pending trip requests
      }))
      setOnlineDriversList(onlineDrivers)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [])

  useEffect(() => {
    loadStats()

    // Fallback polling when not connected
    if (!isConnected) {
      const interval = setInterval(loadStats, 5000)
      return () => clearInterval(interval)
    }
  }, [isConnected, loadStats])

  // Socket event handlers
  useEffect(() => {
    if (!isConnected) return

    // Join admin room
    joinAdminRoom()

    // Listen for driver online/offline
    const unsubOnline = subscribe('driver:online', (data) => {
      setLiveStats(prev => ({ ...prev, onlineDrivers: prev.onlineDrivers + 1 }))
      setOnlineDriversList(prev => [...prev, { id: data.driverId, lat: data.latitude, lng: data.longitude }])
    })

    const unsubOffline = subscribe('driver:offline', (data) => {
      setLiveStats(prev => ({ ...prev, onlineDrivers: Math.max(0, prev.onlineDrivers - 1) }))
      setOnlineDriversList(prev => prev.filter(d => d.id !== data.driverId))
    })

    // Listen for new trip requests
    const unsubNewTrip = subscribe('trip:new-request', () => {
      setLiveStats(prev => ({ ...prev, waitingRiders: prev.waitingRiders + 1 }))
    })

    // Listen for trip accepted
    const unsubAccepted = subscribe('trip:accepted', () => {
      setLiveStats(prev => ({
        ...prev,
        activeTrips: prev.activeTrips + 1,
        waitingRiders: Math.max(0, prev.waitingRiders - 1)
      }))
    })

    // Listen for trip completed
    const unsubStatus = subscribe('trip:status-updated', (data) => {
      if (data.status === 'completed' || data.status === 'cancelled') {
        setLiveStats(prev => ({ ...prev, activeTrips: Math.max(0, prev.activeTrips - 1) }))
      }
    })

    // Listen for emergency alerts
    const unsubEmergency = subscribe('trip:emergency-alert', (data) => {
      setLiveStats(prev => ({ ...prev, emergencies: prev.emergencies + 1 }))
      setIncidents(prev => [{
        severity: 'high',
        title: `SOS Alert - Trip #${data.tripId}`,
        description: data.message || 'Emergency button activated',
        time: 'Just now'
      }, ...prev.slice(0, 9)])
      toast.error(`EMERGENCY: Trip #${data.tripId}`)
    })

    return () => {
      unsubOnline()
      unsubOffline()
      unsubNewTrip()
      unsubAccepted()
      unsubStatus()
      unsubEmergency()
    }
  }, [isConnected, joinAdminRoom, subscribe, toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🚨 Operations War Room</h2>
          <p className="text-gray-600 mt-1">Real-time monitoring and manual controls</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-900' : 'text-yellow-900'}`}>
              {isConnected ? 'Live Connected' : 'Polling Mode'}
            </span>
          </div>
          <button onClick={async () => {
            const confirmed = await confirm({
              title: 'Emergency Override',
              message: 'This will trigger emergency protocols and notify all stakeholders. Are you sure?',
              type: 'danger',
              confirmText: 'Activate'
            })
            if (confirmed) toast.warning('Emergency Override Activated')
          }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Emergency Override
          </button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <LiveStatCard title="Active Trips" value={liveStats.activeTrips} icon="🔵" color="blue" />
        <LiveStatCard title="Online Drivers" value={liveStats.onlineDrivers} icon="🟢" color="green" />
        <LiveStatCard title="Waiting Riders" value={liveStats.waitingRiders} icon="⏳" color="yellow" />
        <LiveStatCard title="Surge Zones" value={liveStats.surgeZones} icon="⚡" color="orange" />
        <LiveStatCard title="Emergencies" value={liveStats.emergencies} icon="🚨" color="red" />
        <LiveStatCard title="Avg ETA" value={liveStats.avgETA} icon="⏱️" color="purple" />
      </div>

      {/* Live Map and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Live City Map</h3>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="text-center z-10">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-600">Real-time map visualization</p>
              <p className="text-sm text-gray-500 mt-2">Showing all active trips, drivers, and surge zones</p>
            </div>
            {/* Simulated markers */}
            <div className="absolute top-20 left-20 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">🚗</span>
            </div>
            <div className="absolute top-40 right-32 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🚗</span>
            </div>
            <div className="absolute bottom-32 left-40 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">⚡</span>
            </div>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Manual Surge Control</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Downtown</option>
                  <option>Airport</option>
                  <option>Financial District</option>
                  <option>Tech Hub</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surge Multiplier</label>
                <input type="range" min="1.0" max="5.0" step="0.1" defaultValue="1.5" className="w-full" />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>1.0x</span>
                  <span className="font-bold text-orange-600">1.5x</span>
                  <span>5.0x</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => toast.success('Surge pricing applied!')} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  Apply Surge
                </button>
                <button onClick={() => toast.info('Surge pricing cleared')} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <ActionButton label="Broadcast Message" icon="📢" color="blue" />
              <ActionButton label="Force Refresh Drivers" icon="🔄" color="green" />
              <ActionButton label="Emergency Shutdown" icon="🚨" color="red" />
              <ActionButton label="Enable Rain Mode" icon="🌧️" color="gray" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Active Incidents</h3>
          <div className="space-y-3">
            <IncidentCard
              severity="high"
              title="SOS Alert - Trip #5432"
              description="Rider activated emergency button"
              time="2 mins ago"
            />
            <IncidentCard
              severity="medium"
              title="Driver Offline - High Demand Zone"
              description="15 drivers went offline in Downtown"
              time="5 mins ago"
            />
            <IncidentCard
              severity="low"
              title="Payment Gateway Latency"
              description="Stripe response time increased to 3s"
              time="10 mins ago"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <HealthBar service="API Server" status="healthy" uptime="99.99%" />
            <HealthBar service="Database" status="healthy" uptime="99.95%" />
            <HealthBar service="Payment Gateway" status="degraded" uptime="98.20%" />
            <HealthBar service="Maps Service" status="healthy" uptime="99.80%" />
            <HealthBar service="Socket Server" status="healthy" uptime="99.92%" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LiveStatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 border-blue-300',
    green: 'bg-green-100 text-green-600 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-300',
    orange: 'bg-orange-100 text-orange-600 border-orange-300',
    red: 'bg-red-100 text-red-600 border-red-300',
    purple: 'bg-purple-100 text-purple-600 border-purple-300',
  }
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-2 ${colors[color]}`}>
      <div className="text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600 mt-1">{title}</div>
      </div>
    </div>
  )
}

function ActionButton({ label, icon, color, toast }) {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    gray: 'bg-gray-600 hover:bg-gray-700',
  }
  return (
    <button onClick={() => {
      // In production, these would execute actual system commands
      console.log(`Executing: ${label}`)
    }} className={`w-full px-4 py-3 ${colors[color]} text-white rounded-lg transition flex items-center justify-between`}>
      <span className="font-medium">{label}</span>
      <span className="text-xl">{icon}</span>
    </button>
  )
}

function IncidentCard({ severity, title, description, time }) {
  const colors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50',
  }
  return (
    <div className={`p-4 rounded-lg border-l-4 ${colors[severity]}`}>
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <button className="mt-2 text-sm text-blue-600 hover:underline">Investigate →</button>
    </div>
  )
}

function HealthBar({ service, status, uptime }) {
  const isHealthy = status === 'healthy'
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900">{service}</span>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className={`text-sm font-medium ${isHealthy ? 'text-green-600' : 'text-yellow-600'}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{ width: uptime }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">Uptime: {uptime}</div>
    </div>
  )
}
