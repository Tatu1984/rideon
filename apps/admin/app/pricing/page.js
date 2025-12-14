'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function PricingManagementPage() {
  const router = useRouter()
  const [pricingRules, setPricingRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'base',
    baseFare: '',
    bookingFee: '',
    perKmRate: '',
    perMinuteRate: '',
    minimumFare: '',
    surgeMultiplier: '1.0',
    startTime: '',
    endTime: '',
    daysOfWeek: []
  })

  useEffect(() => {
    checkAuth()
    fetchPricingRules()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
    }
  }

  const fetchPricingRules = async () => {
    try {
      const {data} = await api.get('/api/admin/pricing')
      if (data.success) {
        setPricingRules(data.data.pricingRules || [])
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'daysOfWeek') {
      const day = parseInt(value)
      setFormData(prev => ({
        ...prev,
        daysOfWeek: checked
          ? [...prev.daysOfWeek, day]
          : prev.daysOfWeek.filter(d => d !== day)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      type: formData.type,
      surgeMultiplier: parseFloat(formData.surgeMultiplier),
      active: true
    }

    if (formData.type === 'base') {
      payload.baseFare = parseFloat(formData.baseFare)
      payload.bookingFee = parseFloat(formData.bookingFee)
      payload.perKmRate = parseFloat(formData.perKmRate)
      payload.perMinuteRate = parseFloat(formData.perMinuteRate)
      payload.minimumFare = parseFloat(formData.minimumFare)
    }

    if (formData.type === 'time_based') {
      payload.startTime = formData.startTime
      payload.endTime = formData.endTime
      payload.daysOfWeek = formData.daysOfWeek
    }

    try {
      const url = editingRule
        ? `/api/admin/pricing/${editingRule.id}`
        : '/api/admin/pricing'

      const {data} = await api[editingRule ? 'PUT' : 'POST'](url, {payload})

      if (data.success) {
        fetchPricingRules()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving pricing rule:', error)
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      type: rule.type,
      baseFare: rule.baseFare?.toString() || '',
      bookingFee: rule.bookingFee?.toString() || '',
      perKmRate: rule.perKmRate?.toString() || '',
      perMinuteRate: rule.perMinuteRate?.toString() || '',
      minimumFare: rule.minimumFare?.toString() || '',
      surgeMultiplier: rule.surgeMultiplier?.toString() || '1.0',
      startTime: rule.startTime || '',
      endTime: rule.endTime || '',
      daysOfWeek: rule.daysOfWeek || []
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return

    try {
      const {data} = await api.delete(`/api/admin/pricing/${id}`)

      if (data.success) {
        fetchPricingRules()
      }
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingRule(null)
    setFormData({
      name: '',
      type: 'base',
      baseFare: '',
      bookingFee: '',
      perKmRate: '',
      perMinuteRate: '',
      minimumFare: '',
      surgeMultiplier: '1.0',
      startTime: '',
      endTime: '',
      daysOfWeek: []
    })
  }

  const openAddModal = () => {
    setEditingRule(null)
    setFormData({
      name: '',
      type: 'base',
      baseFare: '',
      bookingFee: '',
      perKmRate: '',
      perMinuteRate: '',
      minimumFare: '',
      surgeMultiplier: '1.0',
      startTime: '',
      endTime: '',
      daysOfWeek: []
    })
    setShowModal(true)
  }

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
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
            <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            + Add Pricing Rule
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading pricing rules...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {pricingRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{rule.name}</h3>
                      {rule.type === 'base' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Base Pricing</span>
                      )}
                      {rule.type === 'time_based' && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">Time-Based</span>
                      )}
                      {rule.type === 'zone_based' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Zone-Based</span>
                      )}
                      {rule.active && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Active</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {rule.baseFare !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500">Base Fare</p>
                          <p className="text-sm font-medium">${rule.baseFare.toFixed(2)}</p>
                        </div>
                      )}
                      {rule.bookingFee !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500">Booking Fee</p>
                          <p className="text-sm font-medium">${rule.bookingFee.toFixed(2)}</p>
                        </div>
                      )}
                      {rule.perKmRate !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500">Per KM</p>
                          <p className="text-sm font-medium">${rule.perKmRate.toFixed(2)}</p>
                        </div>
                      )}
                      {rule.perMinuteRate !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500">Per Minute</p>
                          <p className="text-sm font-medium">${rule.perMinuteRate.toFixed(2)}</p>
                        </div>
                      )}
                      {rule.minimumFare !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500">Minimum Fare</p>
                          <p className="text-sm font-medium">${rule.minimumFare.toFixed(2)}</p>
                        </div>
                      )}
                      {rule.surgeMultiplier !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500">Surge Multiplier</p>
                          <p className="text-sm font-medium">{rule.surgeMultiplier}x</p>
                        </div>
                      )}
                      {rule.startTime && (
                        <div>
                          <p className="text-xs text-gray-500">Time Range</p>
                          <p className="text-sm font-medium">{rule.startTime} - {rule.endTime}</p>
                        </div>
                      )}
                      {rule.daysOfWeek && rule.daysOfWeek.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Days</p>
                          <p className="text-sm font-medium">
                            {rule.daysOfWeek.map(d => getDayName(d).substring(0, 3)).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
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

        {!loading && pricingRules.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">No pricing rules found</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Your First Pricing Rule
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
                {editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Peak Hours, Weekend Pricing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="base">Base Pricing</option>
                    <option value="time_based">Time-Based Pricing</option>
                    <option value="zone_based">Zone-Based Pricing</option>
                  </select>
                </div>

                {formData.type === 'base' && (
                  <>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking Fee ($)</label>
                        <input
                          type="number"
                          name="bookingFee"
                          required
                          step="0.01"
                          value={formData.bookingFee}
                          onChange={handleInputChange}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fare ($)</label>
                        <input
                          type="number"
                          name="minimumFare"
                          required
                          step="0.01"
                          value={formData.minimumFare}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.type === 'time_based' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          name="startTime"
                          required
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          name="endTime"
                          required
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                          <label key={idx} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="daysOfWeek"
                              value={idx}
                              checked={formData.daysOfWeek.includes(idx)}
                              onChange={handleInputChange}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">{day.substring(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surge Multiplier</label>
                  <input
                    type="number"
                    name="surgeMultiplier"
                    required
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.surgeMultiplier}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">1.0 = normal pricing, 2.0 = double pricing</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    {editingRule ? 'Update Pricing Rule' : 'Create Pricing Rule'}
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
