'use client'

import { useState } from 'react'

export default function SupportManagement() {
  const [tickets] = useState([
    { id: 1, subject: 'Driver not found', user: 'John Doe', type: 'rider', priority: 'high', status: 'open', created: '10 mins ago' },
    { id: 2, subject: 'Payment issue', user: 'Jane Smith', type: 'driver', priority: 'medium', status: 'in-progress', created: '1 hour ago' },
    { id: 3, subject: 'Lost item in car', user: 'Bob Wilson', type: 'rider', priority: 'low', status: 'resolved', created: '2 hours ago' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support & Issue Management</h2>
          <p className="text-gray-600 mt-1">Handle support tickets, lost items, and emergency assistance</p>
        </div>
        <button onClick={() => alert('Opening Emergency Queue - This will show all active emergency alerts and SOS requests.')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          🚨 Emergency Queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatBox title="Open Tickets" value="24" icon="📩" color="blue" />
        <StatBox title="In Progress" value="12" icon="⏳" color="yellow" />
        <StatBox title="Resolved Today" value="45" icon="✅" color="green" />
        <StatBox title="Avg Response" value="3m" icon="⏱️" color="purple" />
        <StatBox title="CSAT Score" value="4.8" icon="⭐" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 mb-3">Filter by Status</h3>
          <div className="space-y-2">
            <FilterButton label="All Tickets" count={tickets.length} active />
            <FilterButton label="Open" count={tickets.filter(t => t.status === 'open').length} />
            <FilterButton label="In Progress" count={tickets.filter(t => t.status === 'in-progress').length} />
            <FilterButton label="Resolved" count={tickets.filter(t => t.status === 'resolved').length} />
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Support Tickets</h3>
              <input type="search" placeholder="Search tickets..." className="px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{ticket.user[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600">{ticket.user} • {ticket.created}</p>
                    </div>
                  </div>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="ml-13 flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500">#{ticket.id}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <TypeBadge type={ticket.type} />
                  <span className="text-xs text-gray-300">•</span>
                  <StatusBadge status={ticket.status} />
                  <div className="flex-1"></div>
                  <button className="text-sm text-blue-600 hover:underline">Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Lost & Found</h3>
          <div className="space-y-3">
            <LostItemCard item="iPhone 13 Pro" trip="#1234" date="2 hours ago" />
            <LostItemCard item="Black Wallet" trip="#1189" date="5 hours ago" />
            <LostItemCard item="Blue Backpack" trip="#1056" date="1 day ago" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Emergency Alerts</h3>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-900 font-medium">🚨 SOS Activated</span>
                <span className="text-xs text-red-700">3 mins ago</span>
              </div>
              <p className="text-sm text-red-800">Trip #5432 - Rider: Sarah Johnson</p>
              <button onClick={() => alert('Handling Emergency for Trip #5432 - Contacting rider and driver, alerting authorities if needed.')} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Handle Emergency
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              No other active emergencies
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
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
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

function FilterButton({ label, count, active }) {
  return (
    <button className={`w-full flex items-center justify-between p-2 rounded-lg transition ${
      active ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100 text-gray-700'
    }`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs font-bold">{count}</span>
    </button>
  )
}

function PriorityBadge({ priority }) {
  const colors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-200 text-gray-700',
  }
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>{priority}</span>
}

function TypeBadge({ type }) {
  return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">{type}</span>
}

function StatusBadge({ status }) {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  }
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>
}

function LostItemCard({ item, trip, date }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-900">{item}</span>
        <button className="text-xs text-blue-600 hover:underline">Contact</button>
      </div>
      <div className="text-xs text-gray-600">Trip {trip} • {date}</div>
    </div>
  )
}
