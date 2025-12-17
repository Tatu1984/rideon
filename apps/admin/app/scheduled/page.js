'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function ScheduledRidesPage() {
  const router = useRouter()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) router.push('/login')
    fetchScheduledRides()
  }, [])

  const fetchScheduledRides = async () => {
    try {
      const {data} = await api.get('/api/admin/scheduled-rides')
      if (data.success) setRides(data.data.rides || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelRide = async (id) => {
    if (!confirm('Cancel this scheduled ride?')) return
    try {
      const {data} = await api.delete(`/api/admin/scheduled-rides/${id}`)
      if (data.success) {
        alert('Ride cancelled!')
        fetchScheduledRides()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Rides</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Scheduled</div>
            <div className="text-2xl font-bold">{rides.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Upcoming</div>
            <div className="text-2xl font-bold text-blue-600">{rides.filter(r => r.status === 'scheduled').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-green-600">{rides.filter(r => r.status === 'completed').length}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rides.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No scheduled rides</td></tr>
              ) : (
                rides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">#{ride.id}</td>
                    <td className="px-6 py-4">User #{ride.riderId}</td>
                    <td className="px-6 py-4">{ride.scheduledTime ? new Date(ride.scheduledTime).toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">{ride.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => cancelRide(ride.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
