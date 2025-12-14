'use client'

import { useEffect, useState } from 'react'
import api from '../../../services/api'

export default function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      const {data} = await api.get('/api/admin/team')
      if (data.success) {
        setStaff(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error('Error loading staff:', error)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Staff Management</h2>
          <p className="text-gray-600 mt-1">Manage admin users and their permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Staff" value={Array.isArray(staff) ? staff.length : 0} icon="👨‍💼" color="indigo" />
        <StatBox title="Admins" value={Array.isArray(staff) ? staff.filter(s => s.role === 'admin').length : 0} icon="⚡" color="red" />
        <StatBox title="Support" value={Array.isArray(staff) ? staff.filter(s => s.role === 'support').length : 0} icon="🎧" color="blue" />
        <StatBox title="Operations" value={Array.isArray(staff) ? staff.filter(s => s.role === 'operations').length : 0} icon="⚙️" color="green" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No staff members found</td></tr>
            ) : (
              (staff || []).map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">{member.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><RoleBadge role={member.role} /></td>
                  <td className="px-6 py-4 text-sm text-gray-900">{member.department || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{member.lastLogin || 'Never'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">✏️</button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Permissions">🔐</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onSuccess={loadStaff} />}
    </div>
  )
}

function RoleBadge({ role }) {
  const roles = {
    admin: { bg: 'bg-red-100', text: 'text-red-800', label: 'Admin' },
    support: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Support' },
    operations: { bg: 'bg-green-100', text: 'text-green-800', label: 'Operations' },
  }
  const style = roles[role] || roles.support
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
  }
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

function AddStaffModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'support', department: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/admin/team', {
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
      console.error('Error adding staff:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Staff Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="admin">Admin</option>
              <option value="support">Support</option>
              <option value="operations">Operations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Staff</button>
          </div>
        </form>
      </div>
    </div>
  )
}
