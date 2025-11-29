'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TeamManagementPage() {
  const router = useRouter()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'dispatcher',
    permissions: [],
    department: '',
    active: true
  })

  const availableRoles = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
    { value: 'admin', label: 'Admin', description: 'Manage operations & users' },
    { value: 'manager', label: 'Manager', description: 'Oversee daily operations' },
    { value: 'dispatcher', label: 'Dispatcher', description: 'Assign trips & manage drivers' },
    { value: 'support', label: 'Support Agent', description: 'Handle customer support' },
    { value: 'finance', label: 'Finance Officer', description: 'Manage payments & payouts' },
    { value: 'analyst', label: 'Analyst', description: 'View reports & analytics' }
  ]

  const permissionsList = [
    { id: 'view_dashboard', label: 'View Dashboard' },
    { id: 'manage_trips', label: 'Manage Trips' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_drivers', label: 'Manage Drivers' },
    { id: 'approve_kyc', label: 'Approve KYC Documents' },
    { id: 'manage_fleet', label: 'Manage Fleet' },
    { id: 'manage_pricing', label: 'Manage Pricing' },
    { id: 'manage_promotions', label: 'Manage Promotions' },
    { id: 'manage_wallet', label: 'Manage Wallets' },
    { id: 'process_payouts', label: 'Process Payouts' },
    { id: 'view_analytics', label: 'View Analytics' },
    { id: 'handle_support', label: 'Handle Support Tickets' },
    { id: 'handle_emergency', label: 'Handle Emergency Alerts' },
    { id: 'manage_team', label: 'Manage Team Members' },
    { id: 'system_settings', label: 'System Settings' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) router.push('/login')
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/team')
      const data = await response.json()
      if (data.success) {
        setTeamMembers(data.data.team || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingMember
        ? `http://localhost:3001/api/admin/team/${editingMember.id}`
        : 'http://localhost:3001/api/admin/team'

      const method = editingMember ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        alert(editingMember ? 'Team member updated!' : 'Team member added!')
        setShowModal(false)
        setEditingMember(null)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'dispatcher',
          permissions: [],
          department: '',
          active: true
        })
        fetchTeamMembers()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save team member')
    }
  }

  const editMember = (member) => {
    setEditingMember(member)
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      permissions: member.permissions || [],
      department: member.department || '',
      active: member.active
    })
    setShowModal(true)
  }

  const deleteMember = async (id) => {
    if (!confirm('Remove this team member?')) return
    try {
      const response = await fetch(`http://localhost:3001/api/admin/team/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        alert('Team member removed!')
        fetchTeamMembers()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'dispatcher': return 'bg-green-100 text-green-800'
      case 'support': return 'bg-yellow-100 text-yellow-800'
      case 'finance': return 'bg-orange-100 text-orange-800'
      case 'analyst': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/')} className="text-purple-600 hover:text-purple-700">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          </div>
          <button
            onClick={() => {
              setEditingMember(null)
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                role: 'dispatcher',
                permissions: [],
                department: '',
                active: true
              })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Add Team Member
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Team Members</div>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {teamMembers.filter(m => m.active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Admins</div>
            <div className="text-2xl font-bold text-purple-600">
              {teamMembers.filter(m => m.role === 'admin' || m.role === 'super_admin').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Dispatchers</div>
            <div className="text-2xl font-bold text-blue-600">
              {teamMembers.filter(m => m.role === 'dispatcher').length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No team members yet
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{member.firstName} {member.lastName}</div>
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(member.role)}`}>
                        {availableRoles.find(r => r.value === member.role)?.label || member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{member.department || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-gray-600">{member.permissions?.length || 0} permissions</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        member.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editMember(member)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMember(member.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {availableRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="e.g., Operations, Support, Finance"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {permissionsList.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-sm">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {formData.permissions.length} permissions
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingMember ? 'Update Member' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingMember(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
