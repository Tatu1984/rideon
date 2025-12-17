'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'

export default function PromotionsPage() {
  const router = useRouter()
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minOrderValue: '',
    usageLimit: '',
    perUserLimit: '',
    validFrom: '',
    validUntil: '',
    description: '',
    active: true
  })

  useEffect(() => {
    checkAuth()
    fetchPromotions()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('rideon_admin_token')
    if (!token) router.push('/login')
  }

  const fetchPromotions = async () => {
    try {
      const response = await api.admin.getPromoCodes()
      if (response.success) {
        const promos = response.data?.data || response.data || []
        setPromotions(Array.isArray(promos) ? promos : [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      code: formData.code,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      maxDiscountAmount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      minTripAmount: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      totalUsageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      maxUsagePerUser: formData.perUserLimit ? parseInt(formData.perUserLimit) : 1,
      validFrom: formData.validFrom || null,
      validTo: formData.validUntil || null
    }

    try {
      let response
      if (editingPromo) {
        response = await api.admin.updatePromoCode(editingPromo.id, payload)
      } else {
        response = await api.admin.createPromoCode(payload)
      }

      if (response.success) {
        alert(editingPromo ? 'Promotion updated!' : 'Promotion created!')
        setShowModal(false)
        setEditingPromo(null)
        resetForm()
        fetchPromotions()
      } else {
        alert(response.error || 'Failed to save promotion')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save promotion')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this promotion?')) return
    try {
      const response = await api.admin.deletePromoCode(id)
      if (response.success) {
        alert('Promotion deleted!')
        fetchPromotions()
      } else {
        alert(response.error || 'Failed to delete promotion')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete promotion')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '', discountType: 'percentage', discountValue: '', maxDiscount: '',
      minOrderValue: '', usageLimit: '', perUserLimit: '', validFrom: '', validUntil: '',
      description: '', active: true
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Coupons</h1>
          <button onClick={() => { setEditingPromo(null); resetForm(); setShowModal(true) }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            + Create Promotion
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {loading ? <div className="text-center py-12">Loading...</div> : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Promotions</div>
                <div className="text-2xl font-bold text-gray-900">{promotions.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Active</div>
                <div className="text-2xl font-bold text-green-600">{promotions.filter(p => p.active).length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Usage</div>
                <div className="text-2xl font-bold text-blue-600">{promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Expired</div>
                <div className="text-2xl font-bold text-red-600">
                  {promotions.filter(p => p.validUntil && new Date(p.validUntil) < new Date()).length}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promotions.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No promotions found</td></tr>
                  ) : (
                    promotions.map((promo) => (
                      <tr key={promo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-purple-600">{promo.code}</div>
                          <div className="text-sm text-gray-500">{promo.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                            {promo.maxDiscount && <span className="text-xs text-gray-500"> (max ${promo.maxDiscount})</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{promo.usageCount || 0} / {promo.usageLimit || '∞'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {promo.validFrom && new Date(promo.validFrom).toLocaleDateString()} -
                            {promo.validUntil && new Date(promo.validUntil).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${promo.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {promo.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => { setEditingPromo(promo); setFormData(promo); setShowModal(true) }}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2">Edit</button>
                          <button onClick={() => handleDelete(promo.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingPromo ? 'Edit' : 'Create'} Promotion</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code *</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                    <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                    <input type="number" step="0.01" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                    <input type="number" step="0.01" value={formData.maxDiscount} onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value</label>
                    <input type="number" step="0.01" value={formData.minOrderValue} onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                    <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                    <input type="date" value={formData.validFrom} onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                    <input type="date" value={formData.validUntil} onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    {editingPromo ? 'Update' : 'Create'} Promotion
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingPromo(null); resetForm() }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
