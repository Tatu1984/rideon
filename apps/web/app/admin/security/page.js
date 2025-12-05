'use client'

export default function SecurityManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security & Logs</h2>
        <p className="text-gray-600 mt-1">Audit logs, RBAC, error monitoring, and API metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Audit Logs" value="1,245" icon="📋" color="blue" />
        <StatBox title="Active Sessions" value="89" icon="🔐" color="green" />
        <StatBox title="Failed Logins" value="12" icon="⚠️" color="red" />
        <StatBox title="API Calls" value="145K" icon="📡" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Recent Audit Logs</h3>
          <div className="space-y-2">
            <LogEntry
              action="User Login"
              user="admin@rideon.com"
              time="2 mins ago"
              status="success"
            />
            <LogEntry
              action="Driver Approved"
              user="support@rideon.com"
              time="10 mins ago"
              status="success"
            />
            <LogEntry
              action="Failed Login Attempt"
              user="unknown@email.com"
              time="15 mins ago"
              status="failed"
            />
            <LogEntry
              action="Pricing Updated"
              user="admin@rideon.com"
              time="1 hour ago"
              status="success"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Role-Based Access Control</h3>
          <div className="space-y-3">
            <RoleCard role="Super Admin" users={2} permissions="Full Access" />
            <RoleCard role="Admin" users={5} permissions="Most Features" />
            <RoleCard role="Support" users={12} permissions="Support Only" />
            <RoleCard role="Operations" users={8} permissions="Operations Only" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Error Logs (Last 24h)</h3>
          <div className="space-y-2">
            <ErrorLog
              message="Payment gateway timeout"
              count={3}
              severity="high"
              time="30 mins ago"
            />
            <ErrorLog
              message="Database connection slow"
              count={1}
              severity="medium"
              time="2 hours ago"
            />
            <ErrorLog
              message="Map service rate limit"
              count={5}
              severity="low"
              time="3 hours ago"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">API Metrics</h3>
          <div className="space-y-3">
            <MetricCard endpoint="/api/trips" calls="45.2K" avgTime="120ms" />
            <MetricCard endpoint="/api/drivers" calls="28.5K" avgTime="85ms" />
            <MetricCard endpoint="/api/payments" calls="18.9K" avgTime="250ms" />
            <MetricCard endpoint="/api/auth" calls="12.4K" avgTime="95ms" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
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

function LogEntry({ action, user, time, status }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{user} • {time}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    </div>
  )
}

function RoleCard({ role, users, permissions }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900">{role}</span>
        <span className="text-sm text-gray-600">{users} users</span>
      </div>
      <p className="text-sm text-gray-600">{permissions}</p>
    </div>
  )
}

function ErrorLog({ message, count, severity, time }) {
  const colors = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-blue-500 bg-blue-50',
  }
  return (
    <div className={`p-3 rounded-lg border-l-4 ${colors[severity]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-900">{message}</span>
        <span className="text-xs font-bold text-gray-600">{count}x</span>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  )
}

function MetricCard({ endpoint, calls, avgTime }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-mono text-gray-900">{endpoint}</span>
        <span className="text-xs font-medium text-blue-600">{avgTime}</span>
      </div>
      <span className="text-xs text-gray-600">{calls} calls</span>
    </div>
  )
}
