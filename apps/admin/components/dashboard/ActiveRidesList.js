'use client'

import { useState } from 'react'

export default function ActiveRidesList({
  trips = [],
  selectedTrip = null,
  onSelectTrip = () => {},
  onViewDetails = () => {}
}) {
  const [filter, setFilter] = useState('all')

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true
    return trip.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'arrived': return 'bg-purple-100 text-purple-800'
      case 'in_progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'requested':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'accepted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'arrived':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'in_progress':
        return (
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getElapsedTime = (startTime) => {
    if (!startTime) return 'N/A'
    const start = new Date(startTime)
    const now = new Date()
    const diff = Math.floor((now - start) / 60000) // minutes
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ${diff % 60}m`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Active Rides</h3>
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
            {trips.length} active
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['all', 'requested', 'accepted', 'in_progress'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                filter === status
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === 'all' ? 'All' :
               status === 'in_progress' ? 'In Progress' :
               status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm">No active rides</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                  selectedTrip?.id === trip.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                }`}
              >
                {/* Trip Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {getStatusIcon(trip.status)}
                      <span>{trip.status?.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{getElapsedTime(trip.createdAt)}</span>
                </div>

                {/* Rider & Driver Info */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900">
                      {trip.rider?.user?.firstName || 'Rider'} {trip.rider?.user?.lastName || ''}
                    </span>
                  </div>
                  {trip.driver && (
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                        </svg>
                      </div>
                      <span className="text-gray-700">
                        {trip.driver?.user?.firstName || 'Driver'} {trip.driver?.user?.lastName || ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Locations */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 mt-0.5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-600 line-clamp-1">{trip.pickupAddress || 'Pickup location'}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 mt-0.5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-600 line-clamp-1">{trip.dropoffAddress || 'Dropoff location'}</span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{trip.distance?.toFixed(1) || '0'} mi</span>
                    <span>~{trip.estimatedDuration || '0'} min</span>
                  </div>
                  <span className="font-semibold text-gray-900">${trip.estimatedFare?.toFixed(2) || '0.00'}</span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails(trip)
                  }}
                  className="mt-2 w-full text-center text-xs text-purple-600 hover:text-purple-700 font-medium py-1"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Requested: {trips.filter(t => t.status === 'requested').length}</span>
          <span>In Progress: {trips.filter(t => t.status === 'in_progress').length}</span>
          <span>Accepted: {trips.filter(t => t.status === 'accepted').length}</span>
        </div>
      </div>
    </div>
  )
}
