// frontend/src/admin/pages/Ads.jsx
import { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'

export default function AdsPage() {
  const { data, refetch } = useAdminQuery(['admin', 'ads'], '/ads')
  const list = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Ad slots</h1>
          <p className="text-sm text-slate-500">Manage promotional assets for public placements.</p>
        </div>
        <AdFormButton onSaved={() => refetch()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map(ad => (
          <AdCard key={ad.id} ad={ad} onSaved={() => refetch()} />
        ))}
        {list.length === 0 && <p className="text-sm text-slate-500">No ads configured.</p>}
      </div>
    </div>
  )
}

function AdCard({ ad, onSaved }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{ad.label || ad.titleEn || ad.variant}</h2>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${ad.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{ad.active ? 'Active' : 'Inactive'}</span>
      </div>
      <p className="text-sm text-slate-500">{ad.titleEn}</p>
      <p className="text-xs text-slate-400">{ad.descriptionEn}</p>
      <div className="text-xs text-slate-500">Variant: {ad.variant}</div>
      <div className="text-xs text-slate-500">Active window: {ad.startsAt ? new Date(ad.startsAt).toLocaleDateString() : 'Immediate'} → {ad.endsAt ? new Date(ad.endsAt).toLocaleDateString() : 'Open'}</div>
      <AdFormButton ad={ad} onSaved={onSaved} />
    </div>
  )
}

function AdFormButton({ ad, onSaved }) {
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => ad || { label: '', titleEn: '', titleHi: '', href: '', variant: 'billboard', active: true })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (ad) {
        await adminApiFetch(`/ads/${ad.id}`, { token, method: 'PATCH', body: form })
      } else {
        await adminApiFetch('/ads', { token, method: 'POST', body: form })
      }
      setOpen(false)
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    if (ad) {
      return <button onClick={() => setOpen(true)} className="px-3 py-2 text-sm border border-slate-300 rounded">Edit</button>
    }
    return <button onClick={() => setOpen(true)} className="px-3 py-2 text-sm bg-slate-900 text-white rounded">Add ad</button>
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{ad ? 'Edit ad' : 'Add ad'}</h2>
          <button onClick={() => setOpen(false)} className="text-slate-500">Close</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Label</label>
            <input value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Title (EN)</label>
            <input value={form.titleEn || ''} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Description (EN)</label>
            <textarea value={form.descriptionEn || ''} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="mt-1 w-full  border border-slate-300 rounded px-3 py-2 text-sm" rows={3} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Target URL</label>
            <input value={form.href || ''} onChange={(e) => setForm({ ...form, href: e.target.value })} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Variant</label>
            <select value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="billboard">Billboard</option>
              <option value="rail">Rail</option>
              <option value="inline">Inline</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Start date</label>
              <input type="date" value={form.startsAt ? form.startsAt.slice(0, 10) : ''} onChange={(e) => setForm({ ...form, startsAt: e.target.value ? new Date(e.target.value).toISOString() : null })} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">End date</label>
              <input type="date" value={form.endsAt ? form.endsAt.slice(0, 10) : ''} onChange={(e) => setForm({ ...form, endsAt: e.target.value ? new Date(e.target.value).toISOString() : null })} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Active</label>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm border border-slate-300 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
