'use client'

import { useState } from 'react'

export default function AllTrips() {
  const [trips] = useState([
    { id: 5432, rider: 'John Doe', driver: 'Mike Chen', pickup: 'Downtown', dropoff: 'Airport', fare: 45.50, status: 'completed', date: '2025-12-03 10:30' },
    { id: 5431, rider: 'Sarah Lopez', driver: 'David Kim', pickup: 'Mall', dropoff: 'University', fare: 22.00, status: 'completed', date: '2025-12-03 09:15' },
    { id: 5430, rider: 'Bob Wilson', driver: 'Anna Lee', pickup: 'Office', dropoff: 'Home', fare: 18.75, status: 'cancelled', date: '2025-12-03 08:45' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Trips</h2>
          <p className="text-gray-600 mt-1">View and search all trip history</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Search trips..." className="px-3 py-2 border rounded-lg" />
          <select className="px-3 py-2 border rounded-lg">
            <option>All Status</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Active</option>
          </select>
          <input type="date" className="px-3 py-2 border rounded-lg" />
          <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Clear Filters</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">#{trip.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{trip.rider}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{trip.driver}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{trip.pickup} → {trip.dropoff}</td>
                <td className="px-6 py-4 font-bold text-gray-900">${trip.fare.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                    trip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{trip.date}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
