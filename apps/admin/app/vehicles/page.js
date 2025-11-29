'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VehicleTypesPage() {
  const router = useRouter()
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseFare: '',
    perKmRate: '',
    perMinuteRate: '',
    capacity: '',
    features: ''
  })

  useEffect(() => {
    checkAuth()
    fetchVehicleTypes()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
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
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f)

    const payload = {
      name: formData.name,
      description: formData.description,
      baseFare: parseFloat(formData.baseFare),
      perKmRate: parseFloat(formData.perKmRate),
      perMinuteRate: parseFloat(formData.perMinuteRate),
      capacity: parseInt(formData.capacity),
      features: featuresArray
    }

    try {
      const url = editingVehicle
        ? `http://localhost:3001/api/admin/vehicle-types/${editingVehicle.id}`
        : 'http://localhost:3001/api/admin/vehicle-types'

      const response = await fetch(url, {
        method: editingVehicle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        fetchVehicleTypes()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving vehicle type:', error)
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      name: vehicle.name,
      description: vehicle.description,
      baseFare: vehicle.baseFare.toString(),
      perKmRate: vehicle.perKmRate.toString(),
      perMinuteRate: vehicle.perMinuteRate.toString(),
      capacity: vehicle.capacity.toString(),
      features: vehicle.features.join(', ')
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle type?')) return

    try {
      const response = await fetch(`http://localhost:3001/api/admin/vehicle-types/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchVehicleTypes()
      }
    } catch (error) {
      console.error('Error deleting vehicle type:', error)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingVehicle(null)
    setFormData({
      name: '',
      description: '',
      baseFare: '',
      perKmRate: '',
      perMinuteRate: '',
      capacity: '',
      features: ''
    })
  }

  const openAddModal = () => {
    setEditingVehicle(null)
    setFormData({
      name: '',
      description: '',
      baseFare: '',
      perKmRate: '',
      perMinuteRate: '',
      capacity: '',
      features: ''
    })
    setShowModal(true)
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
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Types Management</h1>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            + Add Vehicle Type
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading vehicle types...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicleTypes.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{vehicle.description}</p>
                    </div>
                    {vehicle.active && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Active</span>
                    )}
                  </div>

                  {/* Pricing Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Fare:</span>
                      <span className="font-medium">${vehicle.baseFare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Per KM:</span>
                      <span className="font-medium">${vehicle.perKmRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Per Minute:</span>
                      <span className="font-medium">${vehicle.perMinuteRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{vehicle.capacity} passengers</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.map((feature, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && vehicleTypes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">No vehicle types found</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Your First Vehicle Type
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingVehicle ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Economy, Premium, SUV"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of this vehicle type"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Fare ($)</label>
                    <input
                      type="number"
                      name="baseFare"
                      required
                      step="0.01"
                      value={formData.baseFare}
                      onChange={handleInputChange}
                      placeholder="2.50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per KM Rate ($)</label>
                    <input
                      type="number"
                      name="perKmRate"
                      required
                      step="0.01"
                      value={formData.perKmRate}
                      onChange={handleInputChange}
                      placeholder="1.20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per Minute Rate ($)</label>
                    <input
                      type="number"
                      name="perMinuteRate"
                      required
                      step="0.01"
                      value={formData.perMinuteRate}
                      onChange={handleInputChange}
                      placeholder="0.25"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (passengers)</label>
                    <input
                      type="number"
                      name="capacity"
                      required
                      value={formData.capacity}
                      onChange={handleInputChange}
                      placeholder="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="Air Conditioning, Music, WiFi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple features with commas</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    {editingVehicle ? 'Update Vehicle Type' : 'Create Vehicle Type'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
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
