'use client'

import { useToast } from '@/components/ui/Toast'

export default function IntegrationsManagement() {
  const toast = useToast()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
        <p className="text-gray-600 mt-1">Manage third-party integrations and API connections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Active Integrations" value="12" icon="✅" color="green" />
        <StatBox title="Pending Setup" value="3" icon="⏳" color="yellow" />
        <StatBox title="API Calls Today" value="245K" icon="📡" color="blue" />
        <StatBox title="Webhooks" value="8" icon="🔗" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Payment Gateways</h3>
          <div className="space-y-3">
            <IntegrationCard
              name="Stripe"
              description="Payment processing"
              status="active"
              icon="💳"
            />
            <IntegrationCard
              name="PayPal"
              description="Alternative payments"
              status="active"
              icon="🅿️"
            />
            <IntegrationCard
              name="Razorpay"
              description="India payments"
              status="inactive"
              icon="💰"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Maps & Location</h3>
          <div className="space-y-3">
            <IntegrationCard
              name="Google Maps"
              description="Maps and routing"
              status="active"
              icon="🗺️"
            />
            <IntegrationCard
              name="Mapbox"
              description="Alternative mapping"
              status="inactive"
              icon="🌍"
            />
            <IntegrationCard
              name="HERE Maps"
              description="Routing engine"
              status="inactive"
              icon="📍"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Communication</h3>
          <div className="space-y-3">
            <IntegrationCard
              name="Twilio"
              description="SMS and Voice"
              status="active"
              icon="📱"
            />
            <IntegrationCard
              name="SendGrid"
              description="Email delivery"
              status="active"
              icon="📧"
            />
            <IntegrationCard
              name="Firebase"
              description="Push notifications"
              status="active"
              icon="🔔"
            />
            <IntegrationCard
              name="OneSignal"
              description="Push alternative"
              status="inactive"
              icon="📲"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Business Tools</h3>
          <div className="space-y-3">
            <IntegrationCard
              name="Salesforce"
              description="CRM integration"
              status="pending"
              icon="☁️"
            />
            <IntegrationCard
              name="QuickBooks"
              description="Accounting"
              status="pending"
              icon="📊"
            />
            <IntegrationCard
              name="Slack"
              description="Team notifications"
              status="active"
              icon="💬"
            />
            <IntegrationCard
              name="Zendesk"
              description="Customer support"
              status="pending"
              icon="🎧"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-900 mb-4">Webhook Endpoints</h3>
        <div className="space-y-2">
          <WebhookCard
            event="trip.completed"
            url="https://api.example.com/webhooks/trips"
            status="active"
          />
          <WebhookCard
            event="payment.processed"
            url="https://api.example.com/webhooks/payments"
            status="active"
          />
          <WebhookCard
            event="driver.approved"
            url="https://api.example.com/webhooks/drivers"
            status="inactive"
          />
        </div>
        <button className="mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 w-full">
          + Add Webhook
        </button>
      </div>
    </div>
  )
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function IntegrationCard({ name, description, status, icon }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-200 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-medium text-gray-900">{name}</h4>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <button onClick={() => console.log(`Configuring ${name}`)} className="text-sm text-blue-600 hover:underline">
        Configure →
      </button>
    </div>
  )
}

function WebhookCard({ event, url, status }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-mono text-gray-900">{event}</p>
        <p className="text-xs text-gray-500">{url}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <button className="text-sm text-blue-600 hover:underline">Edit</button>
      </div>
    </div>
  )
}
