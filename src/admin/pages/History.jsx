// frontend/src/admin/pages/History.jsx
import { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'

const EMPTY_HISTORY_FORM = {
  category: 'history',
  year: '',
  order: 0,
  titleEn: '',
  titleHi: '',
  bodyEn: '',
  bodyHi: '',
  imageUrl: '',
  published: false,
}

export default function HistoryPage() {
  const [category, setCategory] = useState('history')
  const { data, refetch } = useAdminQuery(['admin', 'history', category], `/history?category=${category}`)
  const list = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">History & Bhamashah</h1>
          <p className="text-sm text-slate-500">Maintain historical narratives and honoree lists.</p>
        </div>
        <HistoryFormButton category={category} onSaved={() => refetch()} />
      </div>
      <div className="flex items-center gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="history">History</option>
          <option value="bhamashah">Bhamashah</option>
        </select>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {list.map(item => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{item.titleEn}</h2>
              <p className="text-xs text-slate-500">
                {item.year ? `${item.year} • ` : ''}
                {item.published ? 'Published' : 'Draft'} • {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '—'}
              </p>
            </div>
            <HistoryFormButton item={item} onSaved={() => refetch()} />
          </div>
        ))}
        {list.length === 0 && <p className="p-4 text-sm text-slate-500">No entries yet.</p>}
      </div>
    </div>
  )
}

function HistoryFormButton({ item, category, onSaved }) {
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    ...EMPTY_HISTORY_FORM,
    category: category || 'history',
    ...item,
  }))

  const openModal = () => {
    setForm({
      ...EMPTY_HISTORY_FORM,
      category: category || 'history',
      ...item,
    })
    setError('')
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
      }
      if (item?.id) {
        await adminApiFetch(`/history/${item.id}`, { token, method: 'PATCH', body: payload })
      } else {
        await adminApiFetch('/history', { token, method: 'POST', body: payload })
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
    if (item) {
      return <button onClick={openModal} className="px-3 py-2 text-sm border border-slate-300 rounded">Edit</button>
    }
    return <button onClick={openModal} className="px-3 py-2 text-sm bg-slate-900 text-white rounded">Add entry</button>
  }

  return (
  <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-30">
  <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4 max-h-[100vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{item ? 'Edit entry' : 'Add entry'}</h2>
      <button onClick={() => setOpen(false)} className="text-slate-500">Close</button>
    </div>

    {/* Error */}
    {error && <p className="text-sm text-red-600">{error}</p>}

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Year / label" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="1987" />
        <Field label="Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
      </div>

      <Field label="Title (EN)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
      <Field label="Title (HI)" value={form.titleHi} onChange={(e) => setForm({ ...form, titleHi: e.target.value })} />

      <Textarea label="Body (EN)" value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} rows={5} />
      <Textarea label="Body (HI)" value={form.bodyHi} onChange={(e) => setForm({ ...form, bodyHi: e.target.value })} rows={5} />

      <Field label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        <span>Published</span>
      </label>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-2">
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

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}

function Textarea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <textarea
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}
