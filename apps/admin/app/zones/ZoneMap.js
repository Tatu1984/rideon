'use client'

import { useEffect, useRef, useState } from 'react'

export default function ZoneMap({ zones = [], drawMode = false, onDrawComplete, initialCoordinates = [] }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [L, setL] = useState(null)
  const [drawingPoints, setDrawingPoints] = useState(initialCoordinates)
  const [markers, setMarkers] = useState([])
  const [polygon, setPolygon] = useState(null)

  useEffect(() => {
    // Load Leaflet dynamically on client side only
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        setL(leaflet.default)
      })
    }
  }, [])

  useEffect(() => {
    if (L && mapRef.current && !map) {
      // Initialize map
      const mapInstance = L.map(mapRef.current).setView([40.7128, -74.0060], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance)

      setMap(mapInstance)

      // Handle click for drawing mode
      if (drawMode) {
        mapInstance.on('click', handleMapClick)
      }

      return () => {
        mapInstance.remove()
      }
    }
  }, [L, mapRef.current])

  // Render existing zones
  useEffect(() => {
    if (map && L && zones.length > 0 && !drawMode) {
      zones.forEach(zone => {
        if (zone.coordinates && zone.coordinates.length >= 3) {
          const latLngs = zone.coordinates.map(coord => [coord.lat, coord.lng])

          const color = zone.type === 'service_area' ? 'blue' :
                       zone.type === 'premium_area' ? 'purple' : 'red'

          const poly = L.polygon(latLngs, {
            color: color,
            fillColor: color,
            fillOpacity: 0.2
          }).addTo(map)

          poly.bindPopup(`<strong>${zone.name}</strong><br>${zone.type}`)
        }
      })
    }
  }, [map, L, zones, drawMode])

  // Handle drawing points
  useEffect(() => {
    if (map && L && drawMode && initialCoordinates.length > 0 && drawingPoints.length === 0) {
      setDrawingPoints(initialCoordinates)
    }
  }, [map, L, drawMode, initialCoordinates])

  // Update polygon when drawing points change
  useEffect(() => {
    if (map && L && drawMode) {
      // Remove existing markers
      markers.forEach(marker => map.removeLayer(marker))

      // Remove existing polygon
      if (polygon) {
        map.removeLayer(polygon)
      }

      // Add new markers
      const newMarkers = drawingPoints.map(point => {
        return L.marker([point.lat, point.lng]).addTo(map)
      })
      setMarkers(newMarkers)

      // Draw polygon if we have at least 3 points
      if (drawingPoints.length >= 3) {
        const latLngs = drawingPoints.map(p => [p.lat, p.lng])
        const newPolygon = L.polygon(latLngs, {
          color: 'purple',
          fillColor: 'purple',
          fillOpacity: 0.2
        }).addTo(map)
        setPolygon(newPolygon)
      }
    }
  }, [drawingPoints, map, L, drawMode])

  const handleMapClick = (e) => {
    if (!drawMode) return

    const newPoint = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    }

    const newPoints = [...drawingPoints, newPoint]
    setDrawingPoints(newPoints)

    if (onDrawComplete) {
      onDrawComplete(newPoints)
    }
  }

  // Update drawing points when initialCoordinates change
  useEffect(() => {
    if (drawMode && initialCoordinates.length === 0 && drawingPoints.length > 0) {
      setDrawingPoints([])
    }
  }, [initialCoordinates, drawMode])

  return (
    <div ref={mapRef} className="w-full h-full" />
  )
}
