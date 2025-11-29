'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DriversManagementPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [selectedVehicleType, setSelectedVehicleType] = useState('')

  useEffect(() => {
    checkAuth()
    fetchDrivers()
    fetchVehicleTypes()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/drivers')
      const data = await response.json()
      if (data.success) {
        setDrivers(data.data.drivers || data.data || [])
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/vehicle-types')
      const data = await response.json()
      if (data.success) {
        setVehicleTypes(data.data.vehicleTypes || [])
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
    }
  }

  const handleApprove = async (driverId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/drivers/${driverId}/approve`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        alert('Driver approved successfully!')
        fetchDrivers()
      }
    } catch (error) {
      console.error('Error approving driver:', error)
    }
  }

  const handleAssignVehicle = (driver) => {
    setSelectedDriver(driver)
    setSelectedVehicleType(driver.vehicleType || '')
    setShowVehicleModal(true)
  }

  const handleVehicleAssignment = async () => {
    if (!selectedVehicleType) {
      alert('Please select a vehicle type')
      return
    }

    // In a real app, this would call an API to update driver's vehicle
    alert(`Vehicle type "${selectedVehicleType}" assigned to ${selectedDriver.firstName} ${selectedDriver.lastName}`)
    setShowVehicleModal(false)
    setSelectedDriver(null)
    setSelectedVehicleType('')
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/')} className="text-purple-600 hover:text-purple-700">
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading drivers...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No drivers found
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{driver.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.firstName} {driver.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{driver.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(driver.status)}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driver.vehicleType || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{driver.rating}</span>
                          <span className="text-yellow-400 ml-1">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driver.totalTrips}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAssignVehicle(driver)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Assign Vehicle
                          </button>
                          <button
                            onClick={() => handleApprove(driver.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Drivers</div>
            <div className="text-2xl font-bold text-gray-900">{drivers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Active Drivers</div>
            <div className="text-2xl font-bold text-green-600">
              {drivers.filter(d => d.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Average Rating</div>
            <div className="text-2xl font-bold text-yellow-600">
              {drivers.length > 0
                ? (drivers.reduce((sum, d) => sum + parseFloat(d.rating || 0), 0) / drivers.length).toFixed(1)
                : '0.0'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Trips</div>
            <div className="text-2xl font-bold text-blue-600">
              {drivers.reduce((sum, d) => sum + (d.totalTrips || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Assignment Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Vehicle Type</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Assigning vehicle to: <strong>{selectedDriver?.firstName} {selectedDriver?.lastName}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle Type</label>
                  <select
                    value={selectedVehicleType}
                    onChange={(e) => setSelectedVehicleType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">-- Select Vehicle Type --</option>
                    {vehicleTypes.map((vt) => (
                      <option key={vt.id} value={vt.name}>
                        {vt.name} (${vt.baseFare} base + ${vt.perKmRate}/km)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedVehicleType && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    {vehicleTypes.filter(vt => vt.name === selectedVehicleType).map(vt => (
                      <div key={vt.id}>
                        <h3 className="font-semibold text-purple-900 mb-2">{vt.name}</h3>
                        <p className="text-sm text-purple-800 mb-2">{vt.description}</p>
                        <div className="text-xs text-purple-700 space-y-1">
                          <p>Base Fare: ${vt.baseFare}</p>
                          <p>Per KM: ${vt.perKmRate}</p>
                          <p>Capacity: {vt.capacity} passengers</p>
                          <p>Features: {vt.features.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleVehicleAssignment}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Assign Vehicle
                  </button>
                  <button
                    onClick={() => {
                      setShowVehicleModal(false)
                      setSelectedDriver(null)
                      setSelectedVehicleType('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
