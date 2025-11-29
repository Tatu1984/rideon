'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function RideMap({ pickup, dropoff, onLocationSelect }) {
  const mapContainer = useRef(null)
  const mapInstance = useRef(null)
  const pickupMarker = useRef(null)
  const dropoffMarker = useRef(null)
  const routeLine = useRef(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    mapInstance.current = L.map(mapContainer.current).setView([40.7128, -74.0060], 13)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current)

    // Handle map clicks
    mapInstance.current.on('click', (e) => {
      const { lat, lng } = e.latlng

      if (!pickup) {
        // Set pickup location
        onLocationSelect('pickup', { lat, lng }, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } else if (!dropoff) {
        // Set dropoff location
        onLocationSelect('dropoff', { lat, lng }, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } else {
        // Reset and set new pickup
        onLocationSelect('pickup', { lat, lng }, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        onLocationSelect('dropoff', null, '')
      }
    })

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
      }
    }
  }, [])

  // Update pickup marker
  useEffect(() => {
    if (!mapInstance.current) return

    if (pickup) {
      if (pickupMarker.current) {
        pickupMarker.current.setLatLng([pickup.lat, pickup.lng])
      } else {
        const greenIcon = L.divIcon({
          className: 'custom-marker-icon',
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background-color: #10b981;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            ">
              📍
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        pickupMarker.current = L.marker([pickup.lat, pickup.lng], { icon: greenIcon })
          .addTo(mapInstance.current)
          .bindPopup('<b>Pickup Location</b><br>Click on map to change')
      }
    } else if (pickupMarker.current) {
      pickupMarker.current.remove()
      pickupMarker.current = null
    }
  }, [pickup])

  // Update dropoff marker
  useEffect(() => {
    if (!mapInstance.current) return

    if (dropoff) {
      if (dropoffMarker.current) {
        dropoffMarker.current.setLatLng([dropoff.lat, dropoff.lng])
      } else {
        const redIcon = L.divIcon({
          className: 'custom-marker-icon',
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background-color: #ef4444;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            ">
              🎯
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        dropoffMarker.current = L.marker([dropoff.lat, dropoff.lng], { icon: redIcon })
          .addTo(mapInstance.current)
          .bindPopup('<b>Dropoff Location</b><br>Click on map to change')
      }
    } else if (dropoffMarker.current) {
      dropoffMarker.current.remove()
      dropoffMarker.current = null
    }
  }, [dropoff])

  // Draw route line
  useEffect(() => {
    if (!mapInstance.current) return

    if (pickup && dropoff) {
      // Remove existing route
      if (routeLine.current) {
        routeLine.current.remove()
      }

      // Draw new route
      routeLine.current = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ],
        {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
          lineJoin: 'round',
        }
      ).addTo(mapInstance.current)

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ])
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] })
    } else if (routeLine.current) {
      routeLine.current.remove()
      routeLine.current = null
    }
  }, [pickup, dropoff])

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold text-gray-900 mb-2">Map Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            <span className="text-gray-700">Pickup Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span className="text-gray-700">Dropoff Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 border-2 border-dashed border-blue-500"></div>
            <span className="text-gray-700">Route</span>
          </div>
        </div>
      </div>

      {/* Current Location Button */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords
                mapInstance.current.setView([latitude, longitude], 15)
                onLocationSelect('pickup', { lat: latitude, lng: longitude }, 'Current Location')
              },
              (error) => {
                console.error('Error getting location:', error)
                alert('Unable to get your location. Please enable location services.')
              }
            )
          }
        }}
        className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] hover:bg-white transition"
        title="Use my current location"
      >
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  )
}
