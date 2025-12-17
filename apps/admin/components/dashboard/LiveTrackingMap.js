'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export default function LiveTrackingMap({
  activeTrips = [],
  onlineDrivers = [],
  selectedTrip = null,
  onSelectTrip = () => {},
  refreshInterval = 10000
}) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [L, setL] = useState(null)
  const [markers, setMarkers] = useState({ drivers: [], trips: [] })
  const [routeLines, setRouteLines] = useState([])

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        setL(leaflet.default)

        // Fix default marker icon issue
        delete leaflet.default.Icon.Default.prototype._getIconUrl
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
      })
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (L && mapRef.current && !map) {
      const mapInstance = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([37.7749, -122.4194], 12) // San Francisco default

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance)

      setMap(mapInstance)

      return () => {
        mapInstance.remove()
      }
    }
  }, [L])

  // Create custom icons
  const createIcon = useCallback((type, status) => {
    if (!L) return null

    const iconColors = {
      driver_online: '#22c55e',
      driver_busy: '#f59e0b',
      driver_offline: '#6b7280',
      pickup: '#3b82f6',
      dropoff: '#ef4444',
      car: '#8b5cf6'
    }

    const color = iconColors[type] || '#6b7280'

    const svgIcon = type.startsWith('driver') ? `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M12 6c-2.21 0-4 1.79-4 4s4 6 4 6 4-3.79 4-6-1.79-4-4-4zm0 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="white"/>
      </svg>
    ` : type === 'pickup' ? `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}" stroke="white" stroke-width="1"/>
      </svg>
    ` : `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}" stroke="white" stroke-width="1"/>
      </svg>
    `

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    })
  }, [L])

  // Update markers for drivers
  useEffect(() => {
    if (!map || !L) return

    // Clear old driver markers
    markers.drivers.forEach(marker => map.removeLayer(marker))

    // Add new driver markers
    const newDriverMarkers = onlineDrivers.map(driver => {
      if (!driver.currentLocation?.lat || !driver.currentLocation?.lng) return null

      const status = driver.status === 'available' ? 'driver_online' :
                     driver.status === 'busy' ? 'driver_busy' : 'driver_offline'

      const icon = createIcon(status)
      if (!icon) return null

      const marker = L.marker(
        [driver.currentLocation.lat, driver.currentLocation.lng],
        { icon }
      ).addTo(map)

      marker.bindPopup(`
        <div class="p-2">
          <strong>${driver.user?.firstName || 'Driver'} ${driver.user?.lastName || ''}</strong><br/>
          <span class="text-sm text-gray-600">Status: ${driver.status}</span><br/>
          <span class="text-sm text-gray-600">Rating: ${driver.rating?.toFixed(1) || 'N/A'}</span>
        </div>
      `)

      return marker
    }).filter(Boolean)

    setMarkers(prev => ({ ...prev, drivers: newDriverMarkers }))
  }, [map, L, onlineDrivers, createIcon])

  // Update markers and routes for active trips
  useEffect(() => {
    if (!map || !L) return

    // Clear old trip markers and routes
    markers.trips.forEach(marker => map.removeLayer(marker))
    routeLines.forEach(line => map.removeLayer(line))

    const newTripMarkers = []
    const newRouteLines = []

    activeTrips.forEach(trip => {
      // Pickup marker
      if (trip.pickupLocation?.lat && trip.pickupLocation?.lng) {
        const pickupIcon = createIcon('pickup')
        if (pickupIcon) {
          const pickupMarker = L.marker(
            [trip.pickupLocation.lat, trip.pickupLocation.lng],
            { icon: pickupIcon }
          ).addTo(map)

          pickupMarker.bindPopup(`
            <div class="p-2">
              <strong>Pickup</strong><br/>
              <span class="text-sm">${trip.pickupAddress || 'Pickup Location'}</span><br/>
              <span class="text-xs text-gray-500">Trip #${trip.id?.slice(0, 8)}</span>
            </div>
          `)

          pickupMarker.on('click', () => onSelectTrip(trip))
          newTripMarkers.push(pickupMarker)
        }
      }

      // Dropoff marker
      if (trip.dropoffLocation?.lat && trip.dropoffLocation?.lng) {
        const dropoffIcon = createIcon('dropoff')
        if (dropoffIcon) {
          const dropoffMarker = L.marker(
            [trip.dropoffLocation.lat, trip.dropoffLocation.lng],
            { icon: dropoffIcon }
          ).addTo(map)

          dropoffMarker.bindPopup(`
            <div class="p-2">
              <strong>Dropoff</strong><br/>
              <span class="text-sm">${trip.dropoffAddress || 'Dropoff Location'}</span><br/>
              <span class="text-xs text-gray-500">Trip #${trip.id?.slice(0, 8)}</span>
            </div>
          `)

          dropoffMarker.on('click', () => onSelectTrip(trip))
          newTripMarkers.push(dropoffMarker)
        }
      }

      // Draw route line between pickup and dropoff
      if (trip.pickupLocation?.lat && trip.pickupLocation?.lng &&
          trip.dropoffLocation?.lat && trip.dropoffLocation?.lng) {
        const routeLine = L.polyline([
          [trip.pickupLocation.lat, trip.pickupLocation.lng],
          [trip.dropoffLocation.lat, trip.dropoffLocation.lng]
        ], {
          color: selectedTrip?.id === trip.id ? '#8b5cf6' : '#3b82f6',
          weight: selectedTrip?.id === trip.id ? 4 : 2,
          opacity: 0.7,
          dashArray: '10, 10'
        }).addTo(map)

        newRouteLines.push(routeLine)
      }

      // Driver current location if trip is in progress
      if (trip.status === 'in_progress' && trip.driver?.currentLocation) {
        const driverIcon = createIcon('driver_busy')
        if (driverIcon) {
          const driverMarker = L.marker(
            [trip.driver.currentLocation.lat, trip.driver.currentLocation.lng],
            { icon: driverIcon }
          ).addTo(map)

          driverMarker.bindPopup(`
            <div class="p-2">
              <strong>${trip.driver.user?.firstName || 'Driver'}</strong><br/>
              <span class="text-sm text-orange-600">On Trip</span>
            </div>
          `)

          newTripMarkers.push(driverMarker)
        }
      }
    })

    setMarkers(prev => ({ ...prev, trips: newTripMarkers }))
    setRouteLines(newRouteLines)

    // Fit bounds to show all markers
    if (newTripMarkers.length > 0 || markers.drivers.length > 0) {
      const allMarkers = [...newTripMarkers, ...markers.drivers]
      if (allMarkers.length > 0) {
        const group = L.featureGroup(allMarkers)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }, [map, L, activeTrips, selectedTrip, createIcon, onSelectTrip])

  // Center on selected trip
  useEffect(() => {
    if (!map || !selectedTrip) return

    if (selectedTrip.pickupLocation?.lat && selectedTrip.pickupLocation?.lng) {
      map.setView(
        [selectedTrip.pickupLocation.lat, selectedTrip.pickupLocation.lng],
        14,
        { animate: true }
      )
    }
  }, [map, selectedTrip])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Online Driver</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-600">Busy Driver</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Pickup Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Dropoff Point</span>
          </div>
        </div>
      </div>

      {/* Refresh indicator */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow px-3 py-1 z-[1000]">
        <span className="text-xs text-gray-500">
          Auto-refresh: {refreshInterval / 1000}s
        </span>
      </div>
    </div>
  )
}
