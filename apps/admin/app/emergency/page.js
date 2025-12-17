'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function EmergencyPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) router.push('/login')
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const {data} = await api.get('/api/admin/emergency-alerts')
      if (data.success) setAlerts(data.data.alerts || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (id) => {
    try {
      const {data} = await api.put(`/api/admin/emergency-alerts/${id}`, {
        status: 'resolved', resolvedAt: new Date() })
      if (data.success) {
        alert('Alert resolved!')
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Emergency/SOS Alerts</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Alerts</div>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === 'resolved').length}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alerts.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No emergency alerts</td></tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">#{alert.id}</td>
                    <td className="px-6 py-4">Trip #{alert.tripId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">{alert.type || 'SOS'}</span>
                    </td>
                    <td className="px-6 py-4">{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${alert.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {alert.status === 'active' && (
                        <button onClick={() => resolveAlert(alert.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                          Resolve
                        </button>
                      )}
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
