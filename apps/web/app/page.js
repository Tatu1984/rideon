'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('../components/map/RideMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

export default function Home() {
  const router = useRouter()
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [fareEstimate, setFareEstimate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rideon_token')
    if (!token) {
      // For demo, we'll allow guest access
      console.log('Guest user')
    }
  }, [])

  const handleLocationSelect = (type, location, address) => {
    if (type === 'pickup') {
      setPickup(location)
      setPickupAddress(address)
    } else {
      setDropoff(location)
      setDropoffAddress(address)
    }
  }

  const estimateFare = async () => {
    if (!pickup || !dropoff) {
      alert('Please select both pickup and dropoff locations')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/rider/trips/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupLocation: { lat: pickup.lat, lng: pickup.lng },
          dropoffLocation: { lat: dropoff.lat, lng: dropoff.lng },
        }),
      })

      const data = await response.json()
      if (data.success) {
        setFareEstimate(data.data)
        setShowBooking(true)
      }
    } catch (error) {
      console.error('Error estimating fare:', error)
      alert('Failed to estimate fare. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const bookRide = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('rideon_token')
    const user = JSON.parse(localStorage.getItem('rideon_user') || '{}')

    if (!token) {
      // Redirect to login
      router.push('/auth/login?redirect=/book')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/rider/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          riderId: user.id,
          pickupLocation: { ...pickup, address: pickupAddress },
          dropoffLocation: { ...dropoff, address: dropoffAddress },
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Ride booked successfully!')
        router.push(`/trips/${data.data.id}`)
      }
    } catch (error) {
      console.error('Error booking ride:', error)
      alert('Failed to book ride. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              RideOn
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">Home</a>
            <a href="/trips" className="text-gray-700 hover:text-blue-600 transition">My Trips</a>
            <a href="/profile" className="text-gray-700 hover:text-blue-600 transition">Profile</a>
          </nav>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-white shadow-xl z-10 flex flex-col">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Ride</h2>
              <p className="text-gray-600">Where would you like to go?</p>
            </div>

            {/* Pickup Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <span className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Pickup Location</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter pickup location"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {pickup && (
                <div className="text-xs text-gray-500">
                  📍 {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                </div>
              )}
            </div>

            {/* Dropoff Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <span className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>Dropoff Location</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Enter dropoff location"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {dropoff && (
                <div className="text-xs text-gray-500">
                  📍 {dropoff.lat.toFixed(4)}, {dropoff.lng.toFixed(4)}
                </div>
              )}
            </div>

            {/* Estimate Button */}
            <button
              onClick={estimateFare}
              disabled={!pickup || !dropoff || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md"
            >
              {loading ? 'Calculating...' : 'Estimate Fare'}
            </button>

            {/* Fare Estimate */}
            {fareEstimate && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 space-y-3 animate-slide-in border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Distance</span>
                  <span className="text-gray-900 font-bold">{fareEstimate.distance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Estimated Time</span>
                  <span className="text-gray-900 font-bold">{fareEstimate.estimatedTime} min</span>
                </div>
                <div className="border-t border-blue-300 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Fare</span>
                  <span className="text-2xl font-bold text-blue-600">${fareEstimate.estimatedFare}</span>
                </div>
                <button
                  onClick={bookRide}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md mt-2"
                >
                  Book Ride Now
                </button>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">📌 How it works</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Click on the map to set pickup (green) and dropoff (red) points</li>
                <li>2. Or enter addresses manually</li>
                <li>3. Get instant fare estimate</li>
                <li>4. Book your ride and track in real-time</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapComponent
            pickup={pickup}
            dropoff={dropoff}
            onLocationSelect={handleLocationSelect}
          />

          {/* Map Instructions Overlay */}
          {!pickup && !dropoff && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg z-[1000]">
              <p className="text-sm font-medium text-gray-700">
                👆 Click on the map to select pickup and dropoff locations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
