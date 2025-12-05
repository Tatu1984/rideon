'use client'

export default function RatingsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ratings & Quality Control</h2>
        <p className="text-gray-600 mt-1">Monitor ratings, quality metrics, and misconduct</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="Platform Rating" value="4.8 ⭐" />
        <StatBox title="Driver Avg" value="4.7 ⭐" />
        <StatBox title="Low Ratings" value="12" />
        <StatBox title="Misconduct Reports" value="3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            <RatingBar stars={5} percentage={70} count={1450} />
            <RatingBar stars={4} percentage={20} count={415} />
            <RatingBar stars={3} percentage={6} count={125} />
            <RatingBar stars={2} percentage={3} count={62} />
            <RatingBar stars={1} percentage={1} count={21} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Quality Triggers</h3>
          <div className="space-y-3">
            <TriggerCard title="Low Rating Alert" value="< 4.2" action="Send warning email" />
            <TriggerCard title="Critical Rating" value="< 3.5" action="Suspend account" />
            <TriggerCard title="Multiple Complaints" value="> 5 in 7 days" action="Manual review" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

function RatingBar({ stars, percentage, count }) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium w-12">{stars} ⭐</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3">
        <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-sm text-gray-600 w-16">{count}</span>
    </div>
  )
}

function TriggerCard({ title, value, action }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="text-sm font-mono text-blue-600">{value}</span>
      </div>
      <div className="text-sm text-gray-600">→ {action}</div>
    </div>
  )
}
