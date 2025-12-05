'use client'

import { useState } from 'react'

export default function GeographyManagement() {
  const [cities] = useState([
    { id: 1, name: 'San Francisco', zones: 15, drivers: 450, status: 'active', coverage: '95%' },
    { id: 2, name: 'New York', zones: 22, drivers: 890, status: 'active', coverage: '98%' },
    { id: 3, name: 'Los Angeles', zones: 18, drivers: 620, status: 'active', coverage: '92%' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Geography & Service Areas</h2>
          <p className="text-gray-600 mt-1">Manage cities, zones, geofences, and restricted areas</p>
        </div>
        <button onClick={() => alert('Add City feature - This will open a modal to add a new city to your service area.')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">+ Add City</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Active Cities" value={cities.length} icon="🌍" />
        <StatBox title="Total Zones" value="55" icon="📍" />
        <StatBox title="Restricted Areas" value="12" icon="🚫" />
        <StatBox title="POIs" value="245" icon="⭐" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Cities & Coverage</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zones</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drivers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">{city.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{city.zones}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{city.drivers}</td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: city.coverage }}></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1">{city.coverage}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {city.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-blue-600 hover:underline text-sm">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Geofence Zones</h3>
            <div className="space-y-3">
              <ZoneCard name="Airport Zone" type="Premium" radius="5km" />
              <ZoneCard name="Downtown" type="Surge" radius="8km" />
              <ZoneCard name="University" type="Standard" radius="3km" />
              <button onClick={() => alert('Add Zone feature - This will open a modal to create a new geofence zone.')} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500">
                + Add Zone
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Restricted Areas</h3>
            <div className="space-y-2">
              <RestrictedCard name="Military Base" />
              <RestrictedCard name="Private Airport" />
              <RestrictedCard name="Government District" />
            </div>
          </div>
        </div>
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

function ZoneCard({ name, type, radius }) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-blue-900">{name}</span>
        <span className="text-xs text-blue-700">{radius}</span>
      </div>
      <span className="text-xs text-blue-600">{type}</span>
    </div>
  )
}

function RestrictedCard({ name }) {
  return (
    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
      <span className="text-sm font-medium text-red-900">🚫 {name}</span>
      <button onClick={() => alert(`Edit Restricted Area: ${name} - This will open a modal to modify the restricted area boundaries.`)} className="text-xs text-red-600 hover:underline">Edit</button>
    </div>
  )
}
