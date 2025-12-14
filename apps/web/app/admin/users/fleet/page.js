'use client'

import { useEffect, useState } from 'react'
import api from '../../../services/api'

export default function FleetManagement() {
  const [fleetOwners, setFleetOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadFleetOwners()
  }, [])

  const loadFleetOwners = async () => {
    try {
      const {data} = await api.get('/api/admin/fleet')
      if (data.success) {
        setFleetOwners(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error('Error loading fleet owners:', error)
      setFleetOwners([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fleet Owners Management</h2>
          <p className="text-gray-600 mt-1">Manage fleet partnerships and vehicle fleets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Fleet Owner</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Fleets" value={Array.isArray(fleetOwners) ? fleetOwners.length : 0} icon="🏢" color="purple" />
        <StatBox title="Active Vehicles" value={0} icon="🚗" color="green" />
        <StatBox title="Total Drivers" value={0} icon="👥" color="blue" />
        <StatBox title="Monthly Revenue" value="$0" icon="💰" color="yellow" />
      </div>

      {/* Fleet Owners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fleet Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drivers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue Share</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Loading fleet owners...
                </td>
              </tr>
            ) : fleetOwners.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No fleet owners found. Add your first fleet partner to get started.
                </td>
              </tr>
            ) : (
              (fleetOwners || []).map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {owner.name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{owner.name}</p>
                        <p className="text-xs text-gray-500">{owner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{owner.company}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{owner.vehicles || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{owner.drivers || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{owner.revenueShare || '20'}%</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View">👁️</button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">✏️</button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Vehicles">🚗</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Fleet Modal */}
      {showAddModal && (
        <AddFleetModal onClose={() => setShowAddModal(false)} onSuccess={loadFleetOwners} />
      )}
    </div>
  )
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function AddFleetModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    revenueShare: '20'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/admin/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error adding fleet owner:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Fleet Owner</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Share (%)</label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={formData.revenueShare}
              onChange={(e) => setFormData({ ...formData, revenueShare: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
