import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { adminApiFetch } from '../api/client.js'

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
  { value: 'CONTENT_ADMIN', label: 'CONTENT_ADMIN' },
  { value: 'FINANCE_ADMIN', label: 'FINANCE_ADMIN' },
]

export default function AdminsPage() {
  const { token, admin } = useAdminAuth()
  const qc = useQueryClient()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading, refetch } = useAdminQuery(['admin', 'admins'], '/admins')
  const admins = useMemo(() => data?.admins || [], [data])

  const [form, setForm] = useState({ phone: '', name: '', email: '', password: '', roles: ['SUPER_ADMIN'] })

  const canManage = admin?.roles?.includes('SUPER_ADMIN')

  const createAdmin = async (e) => {
    e.preventDefault()
    if (!canManage) return
    setSaving(true)
    setError('')
    try {
      await adminApiFetch('/admins', { token, method: 'POST', body: { ...form } })
      setForm({ phone: '', name: '', email: '', password: '', roles: ['SUPER_ADMIN'] })
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] })
      await refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateAdmin = async (id, body) => {
    if (!canManage) return
    setSaving(true)
    setError('')
    try {
      await adminApiFetch(`/admins/${id}`, { token, method: 'PATCH', body })
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] })
      await refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAdmin = async (id) => {
    if (!canManage) return
    if (!window.confirm('Remove this admin?')) return
    setSaving(true)
    setError('')
    try {
      await adminApiFetch(`/admins/${id}`, { token, method: 'DELETE' })
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] })
      await refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Admins</h1>
        <p className="text-sm text-slate-500">Create and manage admin accounts (users/members cannot become admins).</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You need `SUPER_ADMIN` to manage admins.
        </div>
      )}

      <form onSubmit={createAdmin} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create admin</h2>
            <p className="text-xs text-slate-500">Passwords are never displayed; set a new one here.</p>
          </div>
          <button type="submit" disabled={!canManage || saving} className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50">
            {saving ? 'Saving…' : 'Create'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} placeholder="e.g. 9876543210" required />
          <Field label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
          <Field label="Email (optional)" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          <Field label="Password" type="password" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} required />
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-600">
              <span className="font-medium">Roles</span>
              <div className="mt-2 flex flex-wrap gap-3">
                {ROLE_OPTIONS.map((r) => (
                  <label key={r.value} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.roles.includes(r.value)}
                      onChange={(e) => {
                        setForm((prev) => {
                          const next = new Set(prev.roles)
                          if (e.target.checked) next.add(r.value)
                          else next.delete(r.value)
                          return { ...prev, roles: Array.from(next) }
                        })
                      }}
                    />
                    <span className="font-mono">{r.label}</span>
                  </label>
                ))}
              </div>
            </label>
          </div>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Existing admins</h2>
          <button type="button" onClick={() => refetch()} className="px-3 py-2 text-sm border border-slate-300 rounded">
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : admins.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No admins found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Roles</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Last login</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <AdminRow
                    key={a.id}
                    admin={a}
                    disabled={!canManage || saving}
                    onUpdate={updateAdmin}
                    onDelete={deleteAdmin}
                    isSelf={admin?.id === a.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}

function AdminRow({ admin, disabled, onUpdate, onDelete, isSelf }) {
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState(() => (Array.isArray(admin.roles) ? admin.roles : []))

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3">{admin.name || '—'}</td>
      <td className="px-4 py-3 font-mono">{admin.phone}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((r) => (
            <label key={r.value} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                disabled={disabled || isSelf}
                checked={roles.includes(r.value)}
                onChange={(e) => {
                  setRoles((prev) => {
                    const next = new Set(prev)
                    if (e.target.checked) next.add(r.value)
                    else next.delete(r.value)
                    return Array.from(next)
                  })
                }}
              />
              <span className="text-xs font-mono">{r.value}</span>
            </label>
          ))}
        </div>
        <div className="mt-2">
          <button
            type="button"
            disabled={disabled || isSelf}
            onClick={() => onUpdate(admin.id, { roles })}
            className="px-2 py-1 text-xs border border-slate-300 rounded disabled:opacity-50"
          >
            Save roles
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={admin.status}
          disabled={disabled || isSelf}
          onChange={(e) => onUpdate(admin.id, { status: e.target.value })}
          className="border border-slate-300 rounded px-2 py-1 text-sm disabled:opacity-50"
        >
          <option value="active">active</option>
          <option value="suspended">suspended</option>
        </select>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600">
        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            disabled={disabled}
            className="border border-slate-300 rounded px-2 py-1 text-sm disabled:opacity-50"
          />
          <button
            type="button"
            disabled={disabled || !password}
            onClick={() => {
              onUpdate(admin.id, { password })
              setPassword('')
            }}
            className="px-2 py-1 text-xs border border-slate-300 rounded disabled:opacity-50"
          >
            Reset password
          </button>
          <button
            type="button"
            disabled={disabled || isSelf}
            onClick={() => onDelete(admin.id)}
            className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  )
}

