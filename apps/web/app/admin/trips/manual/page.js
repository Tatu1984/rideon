'use client'

import { useState } from 'react'

export default function ManualBooking() {
  const [formData, setFormData] = useState({
    riderId: '',
    pickupAddress: '',
    dropoffAddress: '',
    vehicleType: 'Economy',
    scheduledTime: '',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    alert('Manual booking created successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manual Booking</h2>
        <p className="text-gray-600 mt-1">Create a trip on behalf of a rider</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Trip Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rider</label>
              <select
                value={formData.riderId}
                onChange={(e) => setFormData({ ...formData, riderId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Rider</option>
                <option value="1">John Doe (john@email.com)</option>
                <option value="2">Sarah Lopez (sarah@email.com)</option>
                <option value="3">Bob Wilson (bob@email.com)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
              <input
                type="text"
                required
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                placeholder="123 Main St, San Francisco, CA"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Address</label>
              <input
                type="text"
                required
                value={formData.dropoffAddress}
                onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                placeholder="456 Oak Ave, San Francisco, CA"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Economy">Economy</option>
                <option value="Premium">Premium</option>
                <option value="SUV">SUV</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule For (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special instructions..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Manual Booking
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Fare Estimate</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium">$2.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance (8.5 km)</span>
                <span className="font-medium">$10.20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time (15 min)</span>
                <span className="font-medium">$4.50</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Estimated Total</span>
                <span className="text-2xl font-bold text-blue-600">$17.20</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Trip will be assigned to nearest driver</li>
              <li>• Rider will receive SMS notification</li>
              <li>• Payment will be collected on completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
