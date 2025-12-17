'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../services/api'

export default function DriverKYCPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverDocuments, setDriverDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    documentNumber: '',
    expiryDate: '',
    notes: ''
  })

  const documentTypes = [
    'drivers_license_front',
    'drivers_license_back',
    'vehicle_registration',
    'insurance_certificate',
    'background_check',
    'profile_photo',
    'vehicle_inspection'
  ]

  useEffect(() => {
    checkAuth()
    fetchPendingDrivers()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
    }
  }

  const fetchPendingDrivers = async () => {
    try {
      const {data} = await api.get('/api/admin/drivers')
      if (data.success) {
        // In real app, would fetch from /pending-approval endpoint
        const driversData = data.data.drivers || []

        // Fetch documents for each driver
        const driversWithDocs = await Promise.all(
          driversData.map(async (driver) => {
            const {data: docsData} = await api.get(`/api/admin/drivers/${driver.id}/documents`)
            const docs = docsData.success ? docsData.data.documents : []

            return {
              ...driver,
              documents: docs,
              documentCount: docs.length,
              pendingCount: docs.filter(d => d.status === 'pending').length,
              approvedCount: docs.filter(d => d.status === 'approved').length,
              rejectedCount: docs.filter(d => d.status === 'rejected').length
            }
          })
        )

        setDrivers(driversWithDocs)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDriverDocuments = async (driverId) => {
    try {
      const {data} = await api.get(`/api/admin/drivers/${driverId}/documents`)
      if (data.success) {
        setDriverDocuments(data.data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleViewDocuments = async (driver) => {
    setSelectedDriver(driver)
    await fetchDriverDocuments(driver.id)
    setShowViewModal(true)
  }

  const handleUploadDocument = async (e) => {
    e.preventDefault()

    if (!selectedDriver) return

    const payload = {
      type: formData.type,
      documentNumber: formData.documentNumber,
      expiryDate: formData.expiryDate,
      notes: formData.notes
    }

    try {
      const {data} = await api.post(`/api/admin/drivers/${selectedDriver.id}/documents`, payload)
      if (data.success) {
        alert('Document uploaded successfully!')
        setShowUploadModal(false)
        resetForm()
        await fetchDriverDocuments(selectedDriver.id)
        await fetchPendingDrivers()
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Error uploading document')
    }
  }

  const handleVerifyDocument = async (documentId, status, notes = '') => {
    try {
      const {data} = await api.put(`/api/admin/documents/${documentId}/verify`,{ status, notes })
      if (data.success) {
        alert(`Document ${status} successfully!`)
        await fetchDriverDocuments(selectedDriver.id)
        await fetchPendingDrivers()
      }
    } catch (error) {
      console.error('Error verifying document:', error)
      alert('Error verifying document')
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const {data} = await api.delete(`/api/admin/documents/${documentId}`)
      if (data.success) {
        alert('Document deleted successfully!')
        await fetchDriverDocuments(selectedDriver.id)
        await fetchPendingDrivers()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document')
    }
  }

  const resetForm = () => {
    setFormData({
      type: '',
      documentNumber: '',
      expiryDate: '',
      notes: ''
    })
  }

  const getKYCStatusBadge = (driver) => {
    if (driver.approvedCount === driver.documentCount && driver.documentCount >= 4) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Approved</span>
    } else if (driver.rejectedCount > 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">Rejected</span>
    } else if (driver.pendingCount > 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">Pending Review</span>
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">Incomplete</span>
    }
  }

  const getDocumentStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDocumentType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const isDocumentExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Driver KYC & Documents</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading drivers...</div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Drivers</div>
                <div className="text-2xl font-bold text-gray-900">{drivers.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Pending Review</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {drivers.filter(d => d.pendingCount > 0).length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Approved</div>
                <div className="text-2xl font-bold text-green-600">
                  {drivers.filter(d => d.approvedCount >= 4 && d.pendingCount === 0).length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Incomplete</div>
                <div className="text-2xl font-bold text-gray-600">
                  {drivers.filter(d => d.documentCount < 4).length}
                </div>
              </div>
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No drivers found
                      </td>
                    </tr>
                  ) : (
                    drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium">
                                {driver.firstName?.charAt(0)}{driver.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {driver.firstName} {driver.lastName}
                              </div>
                              <div className="text-sm text-gray-500">ID: #{driver.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{driver.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {driver.documentCount} uploaded
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.approvedCount} approved, {driver.pendingCount} pending, {driver.rejectedCount} rejected
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getKYCStatusBadge(driver)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDocuments(driver)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              View Docs
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDriver(driver)
                                setShowUploadModal(true)
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Upload
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

      {/* Upload Document Modal */}
      {showUploadModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Document for {selectedDriver.firstName} {selectedDriver.lastName}
              </h2>

              <form onSubmit={handleUploadDocument}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">-- Select Type --</option>
                      {documentTypes.map(type => (
                        <option key={type} value={type}>{formatDocumentType(type)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                    <input
                      type="text"
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                      placeholder="e.g., DL123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                      placeholder="Any additional notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    ></textarea>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      📄 In production, this would include file upload functionality. For demo purposes, a mock document URL will be created.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Upload Document
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false)
                      setSelectedDriver(null)
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

      {/* View Documents Modal */}
      {showViewModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Documents for {selectedDriver.firstName} {selectedDriver.lastName}
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedDriver(null)
                    setDriverDocuments([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {driverDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setShowUploadModal(true)
                    }}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {driverDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{formatDocumentType(doc.type)}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getDocumentStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                            {isDocumentExpired(doc.expiryDate) && (
                              <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            {doc.documentNumber && <p>Number: {doc.documentNumber}</p>}
                            {doc.expiryDate && (
                              <p>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                            )}
                            <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            {doc.verifiedAt && (
                              <p>Verified: {new Date(doc.verifiedAt).toLocaleDateString()} by {doc.verifiedBy}</p>
                            )}
                            {doc.notes && <p className="italic">Notes: {doc.notes}</p>}
                            <p className="text-xs text-blue-600">
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View Document →</a>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {doc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyDocument(doc.id, 'approved')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('Reason for rejection:')
                                  if (notes) handleVerifyDocument(doc.id, 'rejected', notes)
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setShowUploadModal(true)
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + Add Another Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
