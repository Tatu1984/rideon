'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function PromotionsManagement() {
  const toast = useToast()
  const [promos] = useState([
    { id: 1, code: 'WELCOME50', type: 'Percentage', value: '50%', uses: 245, maxUses: 1000, status: 'active', expires: '2025-12-31' },
    { id: 2, code: 'FLAT20', type: 'Fixed', value: '$20', uses: 89, maxUses: 500, status: 'active', expires: '2025-12-15' },
    { id: 3, code: 'SUMMER25', type: 'Percentage', value: '25%', uses: 150, maxUses: 200, status: 'expired', expires: '2025-08-31' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotions & Referrals</h2>
          <p className="text-gray-600 mt-1">Manage promo codes, referrals, and incentive programs</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          + Create Promo Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Active Promos" value={promos.filter(p => p.status === 'active').length} icon="🎁" color="purple" />
        <StatBox title="Total Uses" value="484" icon="🔢" color="blue" />
        <StatBox title="Discount Given" value="$12,450" icon="💰" color="yellow" />
        <StatBox title="Referrals" value="156" icon="🤝" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Create New Promo Code</h3>
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Promo code created successfully!'); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
              <input type="text" placeholder="SUMMER2025" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Percentage</option>
                  <option>Fixed Amount</option>
                  <option>Free Ride</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input type="number" placeholder="50" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                <input type="number" placeholder="1000" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Trip Amount</label>
              <input type="number" placeholder="10.00" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Create Promo Code
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Referral Program</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-sm text-gray-700 mb-2">Rider Referral Reward</div>
              <div className="text-3xl font-bold text-purple-600">$10</div>
              <div className="text-xs text-gray-600 mt-1">Per successful referral</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reward Amount ($)</label>
              <input type="number" defaultValue="10" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="text-sm text-gray-700 mb-2">Driver Referral Reward</div>
              <div className="text-3xl font-bold text-green-600">$50</div>
              <div className="text-xs text-gray-600 mt-1">Per successful driver referral</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Reward ($)</label>
              <input type="number" defaultValue="50" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <button onClick={() => toast.success('Referral settings updated!')} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Update Referral Settings
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">All Promo Codes</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {promos.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-bold text-purple-600">{promo.code}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{promo.type}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{promo.value}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{promo.uses} / {promo.maxUses}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{promo.expires}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {promo.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button className="text-red-600 hover:underline text-sm">Disable</button>
                  </div>
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
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
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
