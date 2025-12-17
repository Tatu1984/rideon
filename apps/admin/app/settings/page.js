'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    companyName: 'RideOn',
    supportEmail: 'support@rideon.com',
    supportPhone: '+1-800-RIDEON',
    currency: 'USD',
    distanceUnit: 'km',
    timezone: 'America/New_York',
    minFare: '5.00',
    maxFare: '500.00',
    commissionRate: '20',
    cancellationFee: '5.00',
    waitingTimeCharge: '0.50',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true
  })

  useEffect(() => {
    checkAuth()
    fetchSettings()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) {
      router.push('/login')
    }
  }

  const fetchSettings = async () => {
    try {
      const { success, data } = await api.get('/api/settings')
      if (success && data.settings) {
        // Flatten the categorized settings into our state format
        const flatSettings = {}
        Object.values(data.settings).forEach(categorySettings => {
          Object.assign(flatSettings, categorySettings)
        })
        setSettings(prev => ({ ...prev, ...flatSettings }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const { success, error } = await api.put('/api/settings', { settings })
      if (success) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings: ' + (error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                <input
                  type="tel"
                  name="supportPhone"
                  value={settings.supportPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Regional Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance Unit</label>
                <select
                  name="distanceUnit"
                  value={settings.distanceUnit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fare ($)</label>
                <input
                  type="number"
                  name="minFare"
                  step="0.01"
                  value={settings.minFare}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Fare ($)</label>
                <input
                  type="number"
                  name="maxFare"
                  step="0.01"
                  value={settings.maxFare}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  name="commissionRate"
                  step="1"
                  min="0"
                  max="100"
                  value={settings.commissionRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Fee ($)</label>
                <input
                  type="number"
                  name="cancellationFee"
                  step="0.01"
                  value={settings.cancellationFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waiting Time Charge ($/min)</label>
                <input
                  type="number"
                  name="waitingTimeCharge"
                  step="0.01"
                  value={settings.waitingTimeCharge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable SMS Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Push Notifications</span>
              </label>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Clear Cache</h3>
                  <p className="text-sm text-gray-500">Clear application cache to improve performance</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                  Clear
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-500">Download all system data as CSV</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Save All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
