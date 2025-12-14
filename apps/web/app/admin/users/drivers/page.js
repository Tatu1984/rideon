'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '../../../services/api'

export default function DriversManagement() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadDrivers()
    const interval = setInterval(loadDrivers, 10000) // Refresh every 10s for real-time status
    return () => clearInterval(interval)
  }, [])

  const loadDrivers = async () => {
    try {
      const {data} = await api.get('/api/admin/drivers')
      if (data.success) {
        setDrivers(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error loading drivers:', error)
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = useMemo(() => {
    if (!Array.isArray(drivers)) return []

    return drivers.filter(driver => {
      const matchesSearch = driver.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || driver.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [drivers, searchTerm, filterStatus])

  const onlineDrivers = useMemo(() => Array.isArray(drivers) ? drivers.filter(d => d.status === 'online').length : 0, [drivers])
  const busyDrivers = useMemo(() => Array.isArray(drivers) ? drivers.filter(d => d.status === 'busy').length : 0, [drivers])
  const verifiedDrivers = useMemo(() => Array.isArray(drivers) ? drivers.filter(d => d.isVerified).length : 0, [drivers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Drivers Management</h2>
          <p className="text-gray-600 mt-1">Manage driver accounts, vehicles, and onboarding</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Driver</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatBox title="Total Drivers" value={drivers.length} icon="🚗" color="blue" />
        <StatBox title="Online Now" value={onlineDrivers} icon="🟢" color="green" />
        <StatBox title="On Trip" value={busyDrivers} icon="🔵" color="yellow" />
        <StatBox title="Verified" value={verifiedDrivers} icon="✅" color="purple" />
        <StatBox title="Pending" value={drivers.length - verifiedDrivers} icon="⏳" color="orange" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="busy">On Trip</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Filter by Vehicle Type
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Export CSV
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trips</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  Loading drivers...
                </td>
              </tr>
            ) : filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {driver.firstName?.[0]}{driver.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {driver.firstName} {driver.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{driver.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{driver.vehicleType || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{driver.vehicleNumber || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={driver.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">{driver.rating || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{driver.totalTrips || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${driver.earnings || 0}</td>
                  <td className="px-6 py-4">
                    {driver.isVerified ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View Profile">👁️</button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">✏️</button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Documents">📄</button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Block">🚫</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <AddDriverModal onClose={() => setShowAddModal(false)} onSuccess={loadDrivers} />
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const statuses = {
    online: { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Online' },
    offline: { bg: 'bg-gray-100', text: 'text-gray-800', label: '⚫ Offline' },
    busy: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🔵 On Trip' },
  }

  const style = statuses[status] || statuses.offline

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
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

function AddDriverModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleType: 'Economy',
    vehicleNumber: '',
    licenseNumber: '',
    kycNumber: '',
    kycType: 'Passport'
  })
  const [files, setFiles] = useState({
    licenseImage: null,
    kycDocument: null,
    selfiePhoto: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (field, file) => {
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Validate files
    if (!files.licenseImage || !files.kycDocument || !files.selfiePhoto) {
      setError('Please upload all required documents')
      setSubmitting(false)
      return
    }

    try {
      // In demo mode, we'll just store the file names
      const driverData = {
        ...formData,
        licenseImageName: files.licenseImage.name,
        kycDocumentName: files.kycDocument.name,
        selfiePhotoName: files.selfiePhoto.name,
        documentsUploaded: true
      }

      const response = await fetch('http://localhost:3001/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
      })

      const data = await response.json()
      if (data.success) {
        alert('Driver added successfully with all documents!')
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Failed to add driver')
      }
    } catch (error) {
      console.error('Error adding driver:', error)
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Driver</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Economy">Economy</option>
              <option value="Premium">Premium</option>
              <option value="SUV">SUV</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
            <input
              type="text"
              required
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* License Image Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Upload License Image *
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => handleFileChange('licenseImage', e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {files.licenseImage && (
              <p className="mt-2 text-xs text-green-600">✓ {files.licenseImage.name}</p>
            )}
          </div>

          {/* KYC Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🆔 KYC Document Type
            </label>
            <select
              value={formData.kycType}
              onChange={(e) => setFormData({ ...formData, kycType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="Passport">Passport</option>
              <option value="National ID">National ID</option>
              <option value="Driver License">Driver License</option>
              <option value="Aadhar Card">Aadhar Card</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KYC Number
            </label>
            <input
              type="text"
              required
              value={formData.kycNumber}
              onChange={(e) => setFormData({ ...formData, kycNumber: e.target.value })}
              placeholder="Enter document number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload KYC Document *
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              required
              onChange={(e) => handleFileChange('kycDocument', e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {files.kycDocument && (
              <p className="mt-2 text-xs text-green-600">✓ {files.kycDocument.name}</p>
            )}
          </div>

          {/* Selfie Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-blue-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🤳 Upload Selfie (Light Background) *
            </label>
            <p className="text-xs text-gray-600 mb-3">Please upload a clear selfie with a light/neutral background</p>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => handleFileChange('selfiePhoto', e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-700 hover:file:bg-blue-50"
            />
            {files.selfiePhoto && (
              <p className="mt-2 text-xs text-green-600">✓ {files.selfiePhoto.name}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding Driver...' : 'Add Driver with Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
