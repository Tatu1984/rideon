'use client'

export default function SystemConfiguration() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System & Platform Configuration</h2>
        <p className="text-gray-600 mt-1">Configure branding, app behavior, notifications, and feature toggles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Branding</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <input type="text" defaultValue="RideOn" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <input type="color" defaultValue="#3B82F6" className="w-full h-10 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input type="text" placeholder="https://..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Feature Toggles</h3>
          <div className="space-y-3">
            <ToggleSwitch label="Scheduled Rides" enabled />
            <ToggleSwitch label="Multi-Stop Trips" enabled />
            <ToggleSwitch label="Ride Sharing" enabled={false} />
            <ToggleSwitch label="Cash Payments" enabled />
            <ToggleSwitch label="Ratings System" enabled />
            <ToggleSwitch label="Referral Program" enabled />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-3">
            <ToggleSwitch label="Push Notifications" enabled />
            <ToggleSwitch label="SMS Notifications" enabled />
            <ToggleSwitch label="Email Notifications" enabled />
            <ToggleSwitch label="In-App Messages" enabled />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">App Behavior</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Trip Distance (km)</label>
              <input type="number" defaultValue="50" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver Search Radius (km)</label>
              <input type="number" defaultValue="5" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Cancel After (mins)</label>
              <input type="number" defaultValue="5" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Save Configuration</h3>
          <button onClick={() => alert('Configuration saved successfully! All changes have been applied to the platform.')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleSwitch({ label, enabled }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-900">{label}</span>
      <div className={`w-12 h-6 rounded-full transition ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition ${enabled ? 'ml-6' : 'ml-1'}`}></div>
      </div>
    </div>
  )
}
