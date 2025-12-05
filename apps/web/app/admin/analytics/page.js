'use client'

export default function AnalyticsReporting() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
          <p className="text-gray-600 mt-1">Operational metrics, financial reports, and data exports</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          📊 Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Total Revenue" value="$125,450" change="+12%" />
        <StatBox title="Total Trips" value="3,245" change="+8%" />
        <StatBox title="Active Users" value="1,890" change="+15%" />
        <StatBox title="Avg Trip Value" value="$38.65" change="+3%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[40, 52, 48, 65, 70, 68, 85, 90, 88, 95, 100, 98, 105, 110].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 transition cursor-pointer"
                  style={{ height: `${value}%` }}
                  title={`$${(value * 12).toFixed(0)}`}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Trips by Vehicle Type</h3>
          <div className="space-y-4">
            <VehicleTypeBar type="Economy" percentage={45} trips={1461} />
            <VehicleTypeBar type="Premium" percentage={30} trips={974} />
            <VehicleTypeBar type="SUV" percentage={18} trips={584} />
            <VehicleTypeBar type="Luxury" percentage={7} trips={227} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Top Routes</h3>
          <div className="space-y-3">
            <RouteCard from="Airport" to="Downtown" trips={245} />
            <RouteCard from="Tech Hub" to="Financial" trips={189} />
            <RouteCard from="University" to="Mall" trips={156} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Peak Hours</h3>
          <div className="space-y-2">
            <PeakHourCard time="8:00 AM - 9:00 AM" trips={156} />
            <PeakHourCard time="5:00 PM - 6:00 PM" trips={198} />
            <PeakHourCard time="6:00 PM - 7:00 PM" trips={142} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Cohort Analysis</h3>
          <div className="space-y-3">
            <CohortCard month="November" retention="68%" users={345} />
            <CohortCard month="October" retention="72%" users={289} />
            <CohortCard month="September" retention="65%" users={412} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ title, value, change }) {
  const isPositive = change.startsWith('+')
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <div className="flex items-end justify-between mt-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
    </div>
  )
}

function VehicleTypeBar({ type, percentage, trips }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{type}</span>
        <span className="text-sm text-gray-600">{trips} trips</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}

function RouteCard({ from, to, trips }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900">{from}</span>
        <span className="text-gray-400">→</span>
        <span className="text-sm font-medium text-gray-900">{to}</span>
      </div>
      <span className="text-sm font-bold text-blue-600">{trips}</span>
    </div>
  )
}

function PeakHourCard({ time, trips }) {
  return (
    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
      <span className="text-sm font-medium text-orange-900">{time}</span>
      <span className="text-sm font-bold text-orange-600">{trips} trips</span>
    </div>
  )
}

function CohortCard({ month, retention, users }) {
  return (
    <div className="p-3 bg-purple-50 rounded-lg">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-purple-900">{month}</span>
        <span className="text-sm font-bold text-purple-600">{retention}</span>
      </div>
      <span className="text-xs text-purple-700">{users} users</span>
    </div>
  )
}
