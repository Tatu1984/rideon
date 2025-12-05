'use client'

import { useState } from 'react'

export default function ScheduledRides() {
  const [scheduled] = useState([
    { id: 100, rider: 'John Doe', pickup: 'Home', dropoff: 'Airport', time: '2025-12-04 08:00 AM', status: 'pending' },
    { id: 101, rider: 'Sarah Lopez', pickup: 'Office', dropoff: 'Conference Center', time: '2025-12-04 02:00 PM', status: 'confirmed' },
    { id: 102, rider: 'Bob Wilson', pickup: 'Hotel', dropoff: 'Stadium', time: '2025-12-05 06:30 PM', status: 'pending' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Rides</h2>
          <p className="text-gray-600 mt-1">Manage pre-booked and future trips</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          + New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox title="Upcoming Today" value="12" color="blue" />
        <StatBox title="This Week" value="45" color="purple" />
        <StatBox title="This Month" value="156" color="green" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Scheduled Trips</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scheduled.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">#{trip.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{trip.rider}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{trip.pickup} → {trip.dropoff}</td>
                <td className="px-6 py-4 text-sm font-medium text-purple-600">{trip.time}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    trip.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:underline text-sm">View</button>
                    <button className="text-red-600 hover:underline text-sm">Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatBox({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  }
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}
