'use client'

import { useState } from 'react'

export default function OnboardingManagement() {
  const [drivers] = useState([
    { id: 1, name: 'Michael Chen', email: 'michael@email.com', stage: 'Documents', progress: 60, status: 'pending' },
    { id: 2, name: 'Sarah Lopez', email: 'sarah@email.com', stage: 'Background Check', progress: 80, status: 'in-review' },
    { id: 3, name: 'David Kim', email: 'david@email.com', stage: 'Approved', progress: 100, status: 'approved' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Onboarding & Compliance</h2>
          <p className="text-gray-600 mt-1">Driver verification pipeline and KYC management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox title="In Pipeline" value="45" icon="⏳" />
        <StatBox title="Pending Docs" value="18" icon="📄" />
        <StatBox title="Under Review" value="12" icon="🔍" />
        <StatBox title="Approved" value="230" icon="✅" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Pipeline Stages</h3>
          <div className="space-y-2">
            <StageItem name="Application" count={8} />
            <StageItem name="Documents" count={15} />
            <StageItem name="Background Check" count={12} />
            <StageItem name="Training" count={6} />
            <StageItem name="Final Approval" count={4} />
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Driver Onboarding Pipeline</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">MC</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Michael Chen</p>
                    <p className="text-xs text-gray-500">michael@email.com</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Pending Docs
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stage: Documents Upload</span>
                <button className="text-sm text-blue-600 hover:underline">Review →</button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium">SL</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sarah Lopez</p>
                    <p className="text-xs text-gray-500">sarah@email.com</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  In Review
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stage: Background Check</span>
                <button className="text-sm text-blue-600 hover:underline">Review →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-900 mb-4">Required Documents</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DocCard name="Driver's License" icon="🪪" />
          <DocCard name="Vehicle Registration" icon="📋" />
          <DocCard name="Insurance Certificate" icon="🛡️" />
          <DocCard name="Background Check" icon="✅" />
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

function StageItem({ name, count }) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">{count}</span>
    </button>
  )
}

function DocCard({ name, icon }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-gray-900">{name}</div>
      <div className="text-xs text-gray-500 mt-1">Required</div>
    </div>
  )
}
