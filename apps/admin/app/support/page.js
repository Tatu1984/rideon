'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function SupportTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [formData, setFormData] = useState({
    userId: '',
    tripId: '',
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  })

  const categories = [
    'payment',
    'safety',
    'lost_item',
    'complaint',
    'technical',
    'other'
  ]

  useEffect(() => {
    checkAuth()
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, statusFilter, categoryFilter])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
    }
  }

  const fetchTickets = async () => {
    try {
      const response = await api.admin.getSupportTickets()
      if (response.success) {
        const ticketsList = response.data?.data?.tickets || response.data?.tickets || []
        setTickets(Array.isArray(ticketsList) ? ticketsList : [])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = [...tickets]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }

    setFilteredTickets(filtered)
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()

    const payload = {
      userId: formData.userId ? parseInt(formData.userId) : null,
      tripId: formData.tripId ? parseInt(formData.tripId) : null,
      category: formData.category,
      subject: formData.subject,
      description: formData.description,
      priority: formData.priority
    }

    try {
      const {data} = await api.post('/api/admin/tickets', payload)

      if (data.success) {
        alert('Ticket created successfully!')
        setShowCreateModal(false)
        resetForm()
        fetchTickets()
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket')
    }
  }

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const response = await api.admin.updateSupportTicket(ticketId, { status: newStatus })
      if (response.success) {
        alert(`Ticket ${newStatus}!`)
        fetchTickets()
        if (selectedTicket && selectedTicket.id === ticketId) {
          fetchTicketDetails(ticketId)
        }
      } else {
        alert(response.error || 'Error updating ticket')
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      alert('Error updating ticket')
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return

    try {
      const {data} = await api.post(`/api/admin/tickets/${selectedTicket.id}/messages`,{
          message: replyMessage,
          senderName: 'Admin Support'
        })
      if (data.success) {
        setReplyMessage('')
        fetchTicketDetails(selectedTicket.id)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Error sending reply')
    }
  }

  const handleViewTicket = async (ticket) => {
    await fetchTicketDetails(ticket.id)
    setShowViewModal(true)
  }

  const fetchTicketDetails = async (ticketId) => {
    try {
      const {data} = await api.get(`/api/admin/tickets/${ticketId}`)
      if (data.success) {
        setSelectedTicket(data.data)
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error)
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      const {data} = await api.delete(`/api/admin/tickets/${ticketId}`)
      if (data.success) {
        alert('Ticket deleted successfully!')
        fetchTickets()
        if (selectedTicket && selectedTicket.id === ticketId) {
          setShowViewModal(false)
          setSelectedTicket(null)
        }
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Error deleting ticket')
    }
  }

  const resetForm = () => {
    setFormData({
      userId: '',
      tripId: '',
      category: '',
      subject: '',
      description: '',
      priority: 'medium'
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return styles[priority] || 'bg-gray-100 text-gray-800'
  }

  const formatCategory = (category) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            + Create Ticket
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading tickets...</div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Tickets</div>
                <div className="text-2xl font-bold text-gray-900">{tickets.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Open</div>
                <div className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === 'open').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">In Progress</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Resolved</div>
                <div className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'resolved').length}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{formatCategory(cat)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No tickets found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ticket.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCategory(ticket.category)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewTicket(ticket)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
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

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h2>

              <form onSubmit={handleCreateTicket}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User ID (Optional)</label>
                      <input
                        type="number"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        placeholder="User ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trip ID (Optional)</label>
                      <input
                        type="number"
                        value={formData.tripId}
                        onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                        placeholder="Trip ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{formatCategory(cat)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="Brief subject of the issue"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows="5"
                      placeholder="Detailed description of the issue..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Create Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
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

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">Ticket #{selectedTicket.id}</h2>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedTicket.subject}</h3>
                  <p className="text-sm text-gray-500">
                    Category: {formatCategory(selectedTicket.category)} |
                    Created: {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedTicket(null)
                    setReplyMessage('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Update */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'open')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Closed
                  </button>
                </div>
              </div>

              {/* Conversation */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-4">Conversation</h4>
                <div className="space-y-4">
                  {selectedTicket.messages && selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderRole === 'admin'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Send Reply</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows="3"
                  placeholder="Type your response..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                ></textarea>
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
