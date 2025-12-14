'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function ApprovalsPage() {
  const router = useRouter()
  const [pendingDrivers, setPendingDrivers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('drivers')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) router.push('/login')
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      const driversRes = await api.get('/api/admin/drivers/pending-approval')
      const usersRes = await api.get('/api/admin/users/pending-approval')

      if (driversRes.success) {
        setPendingDrivers(driversRes?.data?.data?.drivers || [])
      }
      if (usersRes.success) {
        setPendingUsers(usersRes?.data?.data?.users || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = (applicant, type) => {
    setSelectedApplicant({ ...applicant, type })
    setShowDetailModal(true)
  }

  const approveApplicant = async (id, type) => {
    try {
      const endpoint = type === 'driver'
        ? `/api/admin/drivers/${id}/approve`
        : `/api/admin/users/${id}/approve`

      const {data} = await api.put(endpoint, {
        approved: true,
        approvedAt: new Date()
      })
      if (data.success) {
        alert(`${type === 'driver' ? 'Driver' : 'User'} approved successfully!`)
        setShowDetailModal(false)
        fetchPendingApprovals()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to approve')
    }
  }

  const rejectApplicant = async (id, type) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return

    try {
      const endpoint = type === 'driver'
        ? `/api/admin/drivers/${id}/reject`
        : `/api/admin/users/${id}/reject`

      const {data} = await api.put(endpoint,{ rejected: true, rejectionReason: reason, rejectedAt: new Date() });
      if (data.success) {
        alert(`${type === 'driver' ? 'Driver' : 'User'} rejected`)
        setShowDetailModal(false)
        fetchPendingApprovals()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to reject')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/')} className="text-purple-600 hover:text-purple-700">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Pending Drivers</div>
            <div className="text-2xl font-bold text-orange-600">{pendingDrivers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Pending Users</div>
            <div className="text-2xl font-bold text-blue-600">{pendingUsers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Pending</div>
            <div className="text-2xl font-bold text-purple-600">
              {pendingDrivers.length + pendingUsers.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('drivers')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'drivers'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Drivers ({pendingDrivers.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'users'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Users ({pendingUsers.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'drivers' && (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No pending driver approvals
                      </td>
                    </tr>
                  ) : (
                    pendingDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold">
                          {driver.firstName} {driver.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm">{driver.email}</td>
                        <td className="px-6 py-4 text-sm">{driver.phone}</td>
                        <td className="px-6 py-4 text-sm">
                          {driver.vehicleMake && driver.vehicleModel
                            ? `${driver.vehicleMake} ${driver.vehicleModel}`
                            : 'Not provided'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(driver.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewDetails(driver, 'driver')}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => approveApplicant(driver.id, 'driver')}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectApplicant(driver.id, 'driver')}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'users' && (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No pending user approvals
                      </td>
                    </tr>
                  ) : (
                    pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-sm">{user.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.registrationType === 'app'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.registrationType === 'app' ? 'App Signup' : 'Manual'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewDetails(user, 'user')}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => approveApplicant(user.id, 'user')}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectApplicant(user.id, 'user')}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showDetailModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedApplicant.type === 'driver' ? 'Driver' : 'User'} Application Review
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-lg font-semibold">{selectedApplicant.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-lg font-semibold">{selectedApplicant.lastName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{selectedApplicant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg">{selectedApplicant.phone}</p>
                </div>
              </div>

              {selectedApplicant.type === 'driver' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vehicle Make</label>
                      <p className="text-lg">{selectedApplicant.vehicleMake || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vehicle Model</label>
                      <p className="text-lg">{selectedApplicant.vehicleModel || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Plate</label>
                      <p className="text-lg">{selectedApplicant.licensePlate || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vehicle Year</label>
                      <p className="text-lg">{selectedApplicant.vehicleYear || 'Not provided'}</p>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Submitted On</label>
                <p className="text-lg">{new Date(selectedApplicant.createdAt).toLocaleString()}</p>
              </div>

              {selectedApplicant.registrationType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Type</label>
                  <p className="text-lg">
                    {selectedApplicant.registrationType === 'app' ? 'App Signup' : 'Manual Entry'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => approveApplicant(selectedApplicant.id, selectedApplicant.type)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => rejectApplicant(selectedApplicant.id, selectedApplicant.type)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
