// frontend/src/admin/pages/AuditLog.jsx
import { useState } from 'react'
import { useAdminQuery } from '../hooks/useAdminApi.js'

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminQuery(['admin', 'audit', page], `/audit-logs?page=${page}`)
  const list = data?.data || []
  const meta = data?.meta || { page: 1, pageSize: 20, total: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Audit log</h1>
        <p className="text-sm text-slate-500">Review recent administrative activity.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Timestamp</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Action</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Entity</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && list.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No audit entries yet.</td></tr>}
            {list.map(entry => (
              <tr key={entry._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{entry.action}</td>
                <td className="px-4 py-3 text-xs">{entry.entityType}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{entry.summary || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <p>Page {meta.page} of {Math.ceil(meta.total / meta.pageSize || 1)}</p>
        <div className="space-x-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50">Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page * meta.pageSize >= meta.total} className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}
