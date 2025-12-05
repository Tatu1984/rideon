'use client'

import { useState } from 'react'

export default function PricingManagement() {
  const [activeCity, setActiveCity] = useState('san-francisco')
  const [surgeEnabled, setSurgeEnabled] = useState(true)

  const cities = [
    { id: 'san-francisco', name: 'San Francisco', active: true },
    { id: 'new-york', name: 'New York', active: true },
    { id: 'los-angeles', name: 'Los Angeles', active: false },
  ]

  const vehicleTypes = [
    { id: 'economy', name: 'Economy', basePrice: 2.50, perKm: 1.20, perMin: 0.30, minFare: 5.00 },
    { id: 'premium', name: 'Premium', basePrice: 3.50, perKm: 1.80, perMin: 0.45, minFare: 7.00 },
    { id: 'suv', name: 'SUV', basePrice: 4.50, perKm: 2.20, perMin: 0.55, minFare: 9.00 },
    { id: 'luxury', name: 'Luxury', basePrice: 6.00, perKm: 3.00, perMin: 0.75, minFare: 12.00 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing & Fare Management</h2>
          <p className="text-gray-600 mt-1">Configure pricing, surge, and fare rules</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Active Cities" value={cities.filter(c => c.active).length} icon="🌍" />
        <StatBox title="Vehicle Types" value={vehicleTypes.length} icon="🚗" />
        <StatBox title="Surge Zones" value="3" icon="⚡" />
        <StatBox title="Avg Fare" value="$12.50" icon="💰" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Selector */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Select City</h3>
          <div className="space-y-2">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setActiveCity(city.id)}
                className={`w-full p-3 rounded-lg text-left transition ${
                  activeCity === city.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{city.name}</span>
                  {city.active && <span className="text-xs text-green-600">✓ Active</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Surge Control */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Surge Pricing</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Surge Enabled</span>
              <button
                onClick={() => setSurgeEnabled(!surgeEnabled)}
                className={`w-12 h-6 rounded-full transition ${
                  surgeEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition ${
                  surgeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Surge Multiplier</label>
              <input type="number" step="0.1" defaultValue="3.0" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surge Threshold (requests/min)</label>
              <input type="number" defaultValue="50" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Surge Multiplier</label>
              <div className="text-3xl font-bold text-orange-600">1.5x</div>
            </div>
          </div>
        </div>

        {/* Extra Fees */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Extra Fees</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airport Fee</label>
              <input type="number" step="0.01" defaultValue="5.00" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Night Charge (10PM-6AM)</label>
              <input type="number" step="0.01" defaultValue="2.50" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toll Fee</label>
              <input type="number" step="0.01" defaultValue="0.00" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Fee</label>
              <input type="number" step="0.01" defaultValue="3.00" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Type Pricing */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Vehicle Type Pricing - {cities.find(c => c.id === activeCity)?.name}</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Fare</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per KM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per Min</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Fare</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicleTypes.map((type) => (
              <tr key={type.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                <td className="px-6 py-4">
                  <input type="number" step="0.01" defaultValue={type.basePrice} className="w-24 px-2 py-1 border rounded" />
                </td>
                <td className="px-6 py-4">
                  <input type="number" step="0.01" defaultValue={type.perKm} className="w-24 px-2 py-1 border rounded" />
                </td>
                <td className="px-6 py-4">
                  <input type="number" step="0.01" defaultValue={type.perMin} className="w-24 px-2 py-1 border rounded" />
                </td>
                <td className="px-6 py-4">
                  <input type="number" step="0.01" defaultValue={type.minFare} className="w-24 px-2 py-1 border rounded" />
                </td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatBox({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}
