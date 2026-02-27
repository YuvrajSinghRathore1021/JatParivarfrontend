// frontend/src/admin/pages/AuditLog.jsx
import { useState } from 'react'
import { useAdminMutation, useAdminQuery } from '../hooks/useAdminApi.js'

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminQuery(['admin', 'audit', page], `/audit-logs?page=${page}`)
  const deleteAllMutation = useAdminMutation('/audit-logs/delete-all', { method: 'POST', invalidate: [['admin', 'audit']] })
  const list = data?.data || []
  const meta = data?.meta || { page: 1, pageSize: 20, total: 0 }
  const handleDeleteAll = async () => {
    const ok = window.confirm('Delete all audit logs? This cannot be undone.')
    if (!ok) return
    try {
      await deleteAllMutation.mutateAsync({})
      setPage(1)
    } catch (err) {
      alert(err?.message || 'Could not delete audit logs.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Audit log</h1>
          <p className="text-sm text-slate-500">Review recent administrative activity.</p>
          <p className="text-xs text-slate-400">Logs auto-delete after 15 days.</p>
        </div>
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={deleteAllMutation.isPending}
          className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
          {deleteAllMutation.isPending ? 'Deleting...' : 'Delete all logs'}
        </button>
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
