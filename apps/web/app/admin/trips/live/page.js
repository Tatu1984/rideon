'use client'

import { useEffect, useState, useMemo, useRef } from 'react'

export default function LiveTripMonitor() {
  const [activeTrips, setActiveTrips] = useState([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    loadLiveTrips()
    const interval = setInterval(loadLiveTrips, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          setMapLoaded(true)
          if (mapRef.current && !mapInstanceRef.current) {
            initializeMap()
          }
        }
        document.head.appendChild(script)
      } else {
        setMapLoaded(true)
        if (mapRef.current && !mapInstanceRef.current) {
          initializeMap()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [mapLoaded])

  useEffect(() => {
    if (mapInstanceRef.current && activeTrips.length > 0) {
      updateMapMarkers()
    }
  }, [activeTrips])

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return

    try {
      const map = window.L.map(mapRef.current).setView([40.7128, -74.0060], 12)

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
    } catch (error) {
      console.error('Map initialization error:', error)
    }
  }

  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const bounds = []

    activeTrips.forEach((trip) => {
      if (!trip.pickup || !trip.dropoff) return

      const pickupIcon = window.L.divIcon({
        html: '<div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>',
        className: '',
        iconSize: [30, 30]
      })

      const dropoffIcon = window.L.divIcon({
        html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🎯</div>',
        className: '',
        iconSize: [30, 30]
      })

      const pickupMarker = window.L.marker([trip.pickup.lat, trip.pickup.lng], { icon: pickupIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>🟢 Pickup - Trip #${trip.id}</strong><br/>
            <strong>Rider:</strong> ${trip.riderName}<br/>
            <strong>Driver:</strong> ${trip.driverName}<br/>
            <strong>Address:</strong> ${trip.pickup.address}<br/>
            <strong>Fare:</strong> $${trip.fare}
          </div>
        `)

      const dropoffMarker = window.L.marker([trip.dropoff.lat, trip.dropoff.lng], { icon: dropoffIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>🔴 Dropoff - Trip #${trip.id}</strong><br/>
            <strong>Address:</strong> ${trip.dropoff.address}<br/>
            <strong>Distance:</strong> ${trip.distance} km<br/>
            <strong>Vehicle:</strong> ${trip.vehicleType}
          </div>
        `)

      const routeLine = window.L.polyline(
        [[trip.pickup.lat, trip.pickup.lng], [trip.dropoff.lat, trip.dropoff.lng]],
        {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10'
        }
      ).addTo(mapInstanceRef.current)

      markersRef.current.push(pickupMarker, dropoffMarker, routeLine)
      bounds.push([trip.pickup.lat, trip.pickup.lng], [trip.dropoff.lat, trip.dropoff.lng])
    })

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  const loadLiveTrips = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/trips?status=active')
      const data = await response.json()
      if (data.success) {
        setActiveTrips(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error('Error loading trips:', error)
      setActiveTrips([])
    }
  }

  const stats = useMemo(() => ({
    active: Array.isArray(activeTrips) ? activeTrips.length : 0,
    completed: 0,
    cancelled: 0,
    avgWaitTime: 0
  }), [activeTrips])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Live Trip Monitor</h2>
        <p className="text-gray-600 mt-1">Real-time monitoring of all active trips</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Active Trips" value={stats.active} icon="🔵" color="blue" />
        <StatBox title="Completed Today" value={stats.completed} icon="✅" color="green" />
        <StatBox title="Cancelled Today" value={stats.cancelled} icon="❌" color="red" />
        <StatBox title="Avg Wait Time" value={`${stats.avgWaitTime}m`} icon="⏱️" color="yellow" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Live Trip Map</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Pickup</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-600">Dropoff</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 border-t-2 border-blue-500 border-dashed"></div>
              <span className="text-gray-600">Route</span>
            </div>
          </div>
        </div>
        <div
          ref={mapRef}
          style={{ height: '500px', width: '100%', borderRadius: '8px' }}
          className="border border-gray-200"
        >
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-500">Loading map...</p>
              </div>
            </div>
          )}
        </div>
        {activeTrips.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No active trips to display on map</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Trips ({(activeTrips || []).length})</h3>
        <div className="space-y-3">
          {(activeTrips || []).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🚗</div>
              <p>No active trips at the moment</p>
            </div>
          ) : (
            (activeTrips || []).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionButton icon="📞" label="Emergency Assist" />
          <ActionButton icon="🚫" label="Cancel Trip" />
          <ActionButton icon="🎁" label="Apply Promo" />
          <ActionButton icon="💰" label="Refund" />
        </div>
      </div>
    </div>
  )
}

function TripCard({ trip }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🚗</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Trip #{trip.id}</p>
            <p className="text-xs text-gray-500">{trip.status || 'In Progress'}</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          🔵 Active
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Rider</p>
          <p className="font-medium">{trip.riderName || 'Unknown'}</p>
        </div>
        <div>
          <p className="text-gray-500">Driver</p>
          <p className="font-medium">{trip.driverName || 'Assigning...'}</p>
        </div>
        <div>
          <p className="text-gray-500">Pickup</p>
          <p className="font-medium text-xs">{trip.pickup?.address || trip.pickupAddress || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Dropoff</p>
          <p className="font-medium text-xs">{trip.dropoff?.address || trip.dropoffAddress || 'N/A'}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Fare: ${trip.fare || '0.00'}</span>
          <span className="text-sm text-gray-600">Distance: {trip.distance} km</span>
          <span className="text-sm text-gray-500 italic">{trip.vehicleType}</span>
        </div>
        <button
          onClick={() => alert(`Track Trip #${trip.id}\nRider: ${trip.riderName}\nDriver: ${trip.driverName}`)}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Track →
        </button>
      </div>
    </div>
  )
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

function ActionButton({ icon, label }) {
  return (
    <button className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition">
      <span className="text-2xl block mb-1">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
