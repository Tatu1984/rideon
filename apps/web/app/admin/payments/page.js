'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function PaymentsManagement() {
  const toast = useToast()
  const [transactions] = useState([
    { id: 1, type: 'Trip', rider: 'John Doe', amount: 25.50, status: 'completed', method: 'Card', date: '2025-12-03 10:30' },
    { id: 2, type: 'Payout', driver: 'Jane Smith', amount: 450.00, status: 'pending', method: 'Bank', date: '2025-12-03 09:15' },
    { id: 3, type: 'Refund', rider: 'Bob Wilson', amount: 15.00, status: 'completed', method: 'Card', date: '2025-12-02 18:45' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments, Wallet & Payouts</h2>
          <p className="text-gray-600 mt-1">Manage transactions, refunds, and driver payouts</p>
        </div>
        <button onClick={() => toast.info('Processing payouts...')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Process Payouts</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Today's Revenue" value="$2,456" icon="💰" color="green" />
        <StatBox title="Pending Payouts" value="$8,920" icon="⏳" color="yellow" />
        <StatBox title="Refunds Issued" value="$185" icon="🔄" color="red" />
        <StatBox title="Wallet Balance" value="$45,230" icon="💳" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Payment Gateways</h3>
          <div className="space-y-3">
            <GatewayItem name="Stripe" status="active" />
            <GatewayItem name="PayPal" status="active" />
            <GatewayItem name="Razorpay" status="inactive" />
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600">
              + Add Gateway
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Revenue Split</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Platform Commission</span>
                <span className="font-bold">25%</span>
              </div>
              <input type="range" min="0" max="50" defaultValue="25" className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Driver Earnings</span>
                <span className="font-bold">75%</span>
              </div>
              <input type="range" min="50" max="100" defaultValue="75" className="w-full" />
            </div>
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">Sample $100 Trip:</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between"><span>Driver:</span><span className="font-bold">$75.00</span></div>
                <div className="flex justify-between"><span>Platform:</span><span className="font-bold">$25.00</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Payout Schedule</h3>
          <div className="space-y-3">
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Daily (Default)</option>
              <option>Weekly (Monday)</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-900 font-medium">Next Payout</div>
              <div className="text-xl font-bold text-blue-900 mt-1">Today, 6:00 PM</div>
              <div className="text-xs text-blue-700 mt-1">Estimated: $8,920</div>
            </div>
            <button onClick={() => toast.success('Manual payout initiated')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Manual Payout Now
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><TypeBadge type={txn.type} /></td>
                <td className="px-6 py-4 text-sm text-gray-900">{txn.rider || txn.driver}</td>
                <td className="px-6 py-4 font-bold text-gray-900">${txn.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{txn.method}</td>
                <td className="px-6 py-4"><StatusBadge status={txn.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
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

function GatewayItem({ name, status }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="font-medium">{name}</span>
      <span className={`px-2 py-1 text-xs rounded-full ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
        {status}
      </span>
    </div>
  )
}

function TypeBadge({ type }) {
  const colors = {
    Trip: 'bg-blue-100 text-blue-800',
    Payout: 'bg-green-100 text-green-800',
    Refund: 'bg-red-100 text-red-800',
  }
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>{type}</span>
}

function StatusBadge({ status }) {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  }
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>
}
