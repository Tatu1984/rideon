'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import api from '../../services/api'

// Dynamically import map component to avoid SSR issues
const ZoneMap = dynamic(() => import('./ZoneMap'), { ssr: false })

export default function GeofencingPage() {
  const router = useRouter()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'service_area',
    pricingMultiplier: '1.0',
    airportFee: '',
    active: true
  })
  const [drawingCoordinates, setDrawingCoordinates] = useState([])

  useEffect(() => {
    checkAuth()
    fetchZones()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
    }
  }

  const fetchZones = async () => {
    try {
      const {data} = await api.get('/api/admin/zones')
      if (data.success) {
        setZones(data.data.zones || [])
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (drawingCoordinates.length < 3) {
      alert('Please draw a zone on the map (at least 3 points)')
      return
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      coordinates: drawingCoordinates,
      pricingMultiplier: parseFloat(formData.pricingMultiplier),
      active: formData.active
    }

    if (formData.airportFee) {
      payload.airportFee = parseFloat(formData.airportFee)
    }

    try {
      const url = editingZone
        ? `/api/admin/zones/${editingZone.id}`
        : '/api/admin/zones'

      const {data} = await api[editingZone ? 'put' : 'post'](url, payload)

      if (data.data.success) {
        fetchZones()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving zone:', error)
    }
  }

  const handleEdit = (zone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      type: zone.type,
      pricingMultiplier: zone.pricingMultiplier?.toString() || '1.0',
      airportFee: zone.airportFee?.toString() || '',
      active: zone.active !== false
    })
    setDrawingCoordinates(zone.coordinates || [])
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this zone?')) return

    try {
      const response = await api.delete(`/api/admin/zones/${id}`)

      const data = await response.json()

      if (data.success) {
        fetchZones()
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingZone(null)
    setDrawingCoordinates([])
    setFormData({
      name: '',
      type: 'service_area',
      pricingMultiplier: '1.0',
      airportFee: '',
      active: true
    })
  }

  const openAddModal = () => {
    setEditingZone(null)
    setDrawingCoordinates([])
    setFormData({
      name: '',
      type: 'service_area',
      pricingMultiplier: '1.0',
      airportFee: '',
      active: true
    })
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Geo-Fencing & Zones</h1>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            + Add Zone
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Map View */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Zone Map</h2>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
            <ZoneMap zones={zones} />
          </div>
        </div>

        {/* Zones List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading zones...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">All Zones</h2>
            {zones.map((zone) => (
              <div key={zone.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{zone.name}</h3>
                      {zone.type === 'service_area' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Service Area</span>
                      )}
                      {zone.type === 'premium_area' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">Premium Area</span>
                      )}
                      {zone.type === 'restricted' && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Restricted</span>
                      )}
                      {zone.active && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Active</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Pricing Multiplier</p>
                        <p className="text-sm font-medium">{zone.pricingMultiplier}x</p>
                      </div>
                      {zone.airportFee && (
                        <div>
                          <p className="text-xs text-gray-500">Airport Fee</p>
                          <p className="text-sm font-medium">${zone.airportFee.toFixed(2)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Points</p>
                        <p className="text-sm font-medium">{zone.coordinates?.length || 0} coordinates</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && zones.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">No zones found</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Your First Zone
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingZone ? 'Edit Zone' : 'Add New Zone'}
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Form */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Downtown, Airport"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="service_area">Service Area</option>
                        <option value="premium_area">Premium Area</option>
                        <option value="restricted">Restricted Area</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Multiplier</label>
                      <input
                        type="number"
                        name="pricingMultiplier"
                        required
                        step="0.1"
                        min="0.5"
                        max="5.0"
                        value={formData.pricingMultiplier}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">1.0 = normal pricing, 1.5 = 50% more</p>
                    </div>

                    {formData.type === 'premium_area' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Airport Fee ($)</label>
                        <input
                          type="number"
                          name="airportFee"
                          step="0.01"
                          value={formData.airportFee}
                          onChange={handleInputChange}
                          placeholder="5.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Zone is active</label>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Click on the map to add coordinates. You need at least 3 points to create a zone.
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Current points: {drawingCoordinates.length}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        {editingZone ? 'Update Zone' : 'Create Zone'}
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

                {/* Map for drawing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Draw Zone on Map</label>
                  <div className="h-[500px] rounded-lg overflow-hidden border-2 border-purple-300">
                    <ZoneMap
                      zones={[]}
                      drawMode={true}
                      onDrawComplete={setDrawingCoordinates}
                      initialCoordinates={drawingCoordinates}
                    />
                  </div>
                  {drawingCoordinates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDrawingCoordinates([])}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Clear Drawing
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
