'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function FleetManagementPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formData, setFormData] = useState({
    vehicleTypeId: '',
    driverId: '',
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    registrationNumber: '',
    status: 'pending_approval'
  })

  useEffect(() => {
    checkAuth()
    fetchVehicles()
    fetchVehicleTypes()
    fetchDrivers()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
    }
  }

  const fetchVehicles = async () => {
    try {
      const {data} = await api.get('/api/admin/fleet')
      if (data.success) {
        setVehicles(data.data.vehicles || [])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      const {data} = await api.get('/api/admin/vehicle-types')
      if (data.success) {
        setVehicleTypes(data.data.vehicleTypes || [])
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const {data} = await api.get('/api/admin/drivers')
      if (data.success) {
        setDrivers(data.data.drivers || [])
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      vehicleTypeId: formData.vehicleTypeId ? parseInt(formData.vehicleTypeId) : null,
      driverId: formData.driverId ? parseInt(formData.driverId) : null,
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      color: formData.color,
      licensePlate: formData.licensePlate,
      vin: formData.vin,
      registrationNumber: formData.registrationNumber,
      status: formData.status
    }

    try {
      const url = editingVehicle
        ? `/api/admin/fleet/${editingVehicle.id}`
        : '/api/admin/fleet'

      const method = editingVehicle ? 'PUT' : 'POST'

      const {data} = await api[method](url, {payload})
      if (data.success) {
        alert(editingVehicle ? 'Vehicle updated successfully!' : 'Vehicle added successfully!')
        setShowModal(false)
        setEditingVehicle(null)
        resetForm()
        fetchVehicles()
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert('Error saving vehicle')
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      vehicleTypeId: vehicle.vehicleTypeId || '',
      driverId: vehicle.driverId || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      color: vehicle.color || '',
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
      registrationNumber: vehicle.registrationNumber || '',
      status: vehicle.status || 'pending_approval'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const {data} = await api.delete(`/api/admin/fleet/${id}`)

      if (data.success) {
        alert('Vehicle deleted successfully!')
        fetchVehicles()
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Error deleting vehicle')
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleTypeId: '',
      driverId: '',
      make: '',
      model: '',
      year: '',
      color: '',
      licensePlate: '',
      vin: '',
      registrationNumber: '',
      status: 'pending_approval'
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      deactivated: 'bg-red-100 text-red-800',
      pending_approval: 'bg-blue-100 text-blue-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getVehicleTypeName = (typeId) => {
    const type = vehicleTypes.find(vt => vt.id === typeId)
    return type ? type.name : 'Not assigned'
  }

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId)
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Not assigned'
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
            <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          </div>
          <button
            onClick={() => {
              setEditingVehicle(null)
              resetForm()
              setShowModal(true)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading vehicles...</div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Vehicles</div>
                <div className="text-2xl font-bold text-gray-900">{vehicles.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {vehicles.filter(v => v.status === 'active').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">In Maintenance</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {vehicles.filter(v => v.status === 'maintenance').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Pending Approval</div>
                <div className="text-2xl font-bold text-blue-600">
                  {vehicles.filter(v => v.status === 'pending_approval').length}
                </div>
              </div>
            </div>

            {/* Vehicles Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Plate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No vehicles found. Click "Add Vehicle" to get started.
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{vehicle.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">{vehicle.color}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vehicle.licensePlate}</div>
                          {vehicle.vin && <div className="text-xs text-gray-500">VIN: {vehicle.vin}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getVehicleTypeName(vehicle.vehicleTypeId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getDriverName(vehicle.driverId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(vehicle.status)}`}>
                            {vehicle.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleTypeId"
                      value={formData.vehicleTypeId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">-- Select Type --</option>
                      {vehicleTypes.map(vt => (
                        <option key={vt.id} value={vt.id}>{vt.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Driver */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver (Optional)</label>
                    <select
                      name="driverId"
                      value={formData.driverId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">-- Unassigned --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Make */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Toyota, Honda, Tesla"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Camry, Accord, Model 3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      min="1990"
                      max="2025"
                      placeholder="e.g., 2023"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Black, White, Blue"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* License Plate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., ABC-1234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* VIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIN (Optional)</label>
                    <input
                      type="text"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      placeholder="17-character VIN"
                      maxLength="17"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="Registration number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="pending_approval">Pending Approval</option>
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingVehicle(null)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
