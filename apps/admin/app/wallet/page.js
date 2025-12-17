'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function WalletPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [payouts, setPayouts] = useState([])
  const [activeTab, setActiveTab] = useState('riders')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [transactionType, setTransactionType] = useState('credit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) router.push('/login')
  }

  const fetchData = async () => {
    try {
      const [{data:usersRes}, {data:driversRes}, {data:payoutsRes}] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/drivers'),
        api.get('/api/admin/payouts')
      ])
      const [usersData, driversData, payoutsData] = await Promise.all([
        usersRes.json(), driversRes.json(), payoutsRes.json()
      ])
      if (usersData.success) setUsers(usersData.data.users?.filter(u => u.role === 'rider') || [])
      if (driversData.success) setDrivers(driversData.data.drivers || [])
      if (payoutsData.success) setPayouts(payoutsData.data.payouts || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransaction = async () => {
    if (!selectedUser || !amount) return
    const endpoint = transactionType === 'credit' ? 'credit' : 'debit'
    try {
      const {data} = await api.post(`/api/admin/wallet/rider/${selectedUser.id}/${endpoint}`, { amount: parseFloat(amount), description })
      if (data.success) {
        alert('Transaction completed!')
        setShowModal(false)
        setSelectedUser(null)
        setAmount('')
        setDescription('')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handlePayout = async (driverId) => {
    const amountInput = prompt('Enter payout amount:')
    if (!amountInput) return
    try {
      const {data} = await api.post('/api/admin/payouts',{ driverId, amount: parseFloat(amountInput), method: 'bank_transfer' })
      if (data.success) {
        alert('Payout initiated!')
        fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const processPayout = async (payoutId) => {
    try {
      const {data} = await api.put(`/api/admin/payouts/${payoutId}/process`)
      if (data.success) {
        alert('Payout processed!')
        fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Payouts</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-6">
          <button onClick={() => setActiveTab('riders')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'riders' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
            Rider Wallets
          </button>
          <button onClick={() => setActiveTab('drivers')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'drivers' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
            Driver Earnings
          </button>
          <button onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'payouts' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
            Payouts
          </button>
        </div>

        {loading ? <div className="text-center py-12">Loading...</div> : (
          <>
            {activeTab === 'riders' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4"><span className="text-green-600 font-semibold">$0.00</span></td>
                        <td className="px-6 py-4">
                          <button onClick={() => { setSelectedUser(user); setTransactionType('credit'); setShowModal(true) }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2">Credit</button>
                          <button onClick={() => { setSelectedUser(user); setTransactionType('debit'); setShowModal(true) }}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Debit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'drivers' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{driver.firstName} {driver.lastName}</td>
                        <td className="px-6 py-4">{driver.email}</td>
                        <td className="px-6 py-4"><span className="text-blue-600 font-semibold">$0.00</span></td>
                        <td className="px-6 py-4">
                          <button onClick={() => handlePayout(driver.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Create Payout</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payouts.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No payouts</td></tr>
                    ) : (
                      payouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">#{payout.id}</td>
                          <td className="px-6 py-4">Driver #{payout.driverId}</td>
                          <td className="px-6 py-4 font-semibold">${payout.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">{payout.method}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded ${payout.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {payout.status === 'pending' && (
                              <button onClick={() => processPayout(payout.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Process</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{transactionType === 'credit' ? 'Credit' : 'Debit'} Wallet</h2>
            <p className="text-sm text-gray-600 mb-4">User: {selectedUser.firstName} {selectedUser.lastName}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                  className="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleTransaction} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Submit
              </button>
              <button onClick={() => { setShowModal(false); setSelectedUser(null); setAmount(''); setDescription('') }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
