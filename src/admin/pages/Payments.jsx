// frontend/src/admin/pages/Payments.jsx
import { useMemo, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'

export default function PaymentsPage() {
  const [filters, setFilters] = useState({ page: 1, pageSize: 20, status: '' })
  const queryKey = useMemo(() => ['admin', 'payments', filters], [filters])
  const qs = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) qs.set(key, value)
  })
  const { data, isLoading, refetch } = useAdminQuery(queryKey, `/payments?${qs.toString()}`, {
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  })
  const list = data?.data || []
  const meta = data?.meta || { page: 1, pageSize: 20, total: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Payments</h1>
        <p className="text-sm text-slate-500">Track and reconcile member contributions.</p>
      </div>
      <div className="flex flex-wrap gap-3 bg-white border border-slate-200 rounded-lg p-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Status</label>
          <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))} className="mt-1 border border-slate-300 rounded px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="created">Created</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Plan ID</label>
          <input value={filters.planId || ''} onChange={(e) => setFilters(prev => ({ ...prev, planId: e.target.value, page: 1 }))} className="mt-1 border border-slate-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>
      <PaymentsTable list={list} loading={isLoading} onChanged={() => refetch()} />
      <div className="flex items-center justify-between text-sm">
        <p>Showing {(meta.page - 1) * meta.pageSize + 1}-{Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}</p>
        <div className="space-x-2">
          <button onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={meta.page <= 1} className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50">Prev</button>
          <button onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} disabled={meta.page * meta.pageSize >= meta.total} className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}

function PaymentsTable({ list, loading, onChanged }) {
  const { token } = useAdminAuth()

  const updateStatus = async (paymentId, status) => {
    try {
      await adminApiFetch(`/payments/${paymentId}/status`, { token, method: 'PATCH', body: { status } })
      onChanged()
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleLeaderboard = async (paymentId, visible) => {
    try {
      await adminApiFetch(`/payments/${paymentId}/leaderboard`, { token, method: 'PATCH', body: { visible } })
      onChanged()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Order ID</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Amount</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Plan</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Status</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Created</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>}
          {!loading && list.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No payments found</td></tr>}
          {list.map(payment => (
            <tr key={payment.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{payment.orderId}</td>
              <td className="px-4 py-3 text-slate-700">₹{(payment.amount / 100 || 0).toLocaleString('en-IN')}</td>
              <td className="px-4 py-3 text-slate-700">{payment.planTitle || '—'}</td>
              <td className="px-4 py-3"><StatusChip status={payment.status} /></td>
              <td className="px-4 py-3 text-slate-500 text-xs">{new Date(payment.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select value={payment.status} onChange={(e) => updateStatus(payment.id, e.target.value)} className="border border-slate-300 rounded px-2 py-1 text-xs">
                    <option value="created">Created</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <button onClick={() => toggleLeaderboard(payment.id, !payment.leaderboardVisible)} className="text-slate-700 underline">
                    {payment.leaderboardVisible ? 'Hide leaderboard' : 'Show leaderboard'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusChip({ status }) {
  const color = status === 'success' ? 'bg-green-100 text-green-700' : (status === 'pending' || status === 'created') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
}
