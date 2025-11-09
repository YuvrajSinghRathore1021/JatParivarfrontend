import { useMemo, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'

const EMPTY_FORM = {
  titleEn: '',
  titleHi: '',
  slug: '',
  excerptEn: '',
  excerptHi: '',
  bodyEn: '',
  bodyHi: '',
  heroImageUrl: '',
  published: false,
}

const buildFormState = (item) => ({
  ...EMPTY_FORM,
  titleEn: item?.titleEn || '',
  titleHi: item?.titleHi || '',
  slug: item?.slug || '',
  excerptEn: item?.excerptEn || '',
  excerptHi: item?.excerptHi || '',
  bodyEn: item?.bodyEn || '',
  bodyHi: item?.bodyHi || '',
  heroImageUrl: item?.heroImageUrl || '',
  published: Boolean(item?.published),
})

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function NewsPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    return `/news${params.toString() ? `?${params.toString()}` : ''}`
  }, [status, search])

  const { data, refetch, isLoading } = useAdminQuery(['admin', 'news', status, search], queryString)
  const list = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Community news</h1>
          <p className="text-sm text-slate-500">Publish announcements and stories for the public news section.</p>
        </div>
        <NewsFormButton onSaved={refetch} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600">Filter by status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-600">Search title</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
            placeholder="Scholarship, PhonePe…"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {isLoading ? (
          <div className="p-4 text-sm text-slate-500">Loading…</div>
        ) : list.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No news entries yet.</div>
        ) : (
          list.map((item) => (
            <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{item.titleEn}</h2>
                <p className="text-xs text-slate-500">
                  {item.published ? 'Published' : 'Draft'} • {formatDate(item.publishedAt || item.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <NewsFormButton item={item} onSaved={refetch} />
                <DeleteButton id={item.id} title={item.titleEn} onDeleted={refetch} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function NewsFormButton({ item, onSaved }) {
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => buildFormState(item))
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm(buildFormState(item))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        titleEn: form.titleEn,
        titleHi: form.titleHi,
        slug: form.slug?.trim() || undefined,
        excerptEn: form.excerptEn,
        excerptHi: form.excerptHi,
        bodyEn: form.bodyEn,
        bodyHi: form.bodyHi,
        heroImageUrl: form.heroImageUrl,
        published: form.published,
      }
      if (item?.id) {
        await adminApiFetch(`/news/${item.id}`, { token, method: 'PATCH', body: payload })
      } else {
        await adminApiFetch('/news', { token, method: 'POST', body: payload })
      }
      setOpen(false)
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openModal = () => {
    resetForm()
    setOpen(true)
  }

  if (!open) {
    if (item) {
      return (
        <button onClick={openModal} className="px-3 py-2 text-sm border border-slate-300 rounded">
          Edit
        </button>
      )
    }
    return (
      <button onClick={openModal} className="px-3 py-2 text-sm bg-slate-900 text-white rounded">
        Add news
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{item ? 'Edit news' : 'Add news'}</h2>
          <button onClick={() => setOpen(false)} className="text-slate-500">
            Close
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Title (EN)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
            <Field label="Title (HI)" value={form.titleHi} onChange={(e) => setForm({ ...form, titleHi: e.target.value })} />
          </div>
          <Field
            label="Custom slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            helper="Defaults to a slug from the English title."
          />
          <div className="grid md:grid-cols-2 gap-3">
            <Textarea
              label="Excerpt (EN)"
              value={form.excerptEn}
              onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Excerpt (HI)"
              value={form.excerptHi}
              onChange={(e) => setForm({ ...form, excerptHi: e.target.value })}
              rows={3}
            />
          </div>
          <Textarea
            label="Body (EN)"
            value={form.bodyEn}
            onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
            rows={8}
          />
          <Textarea
            label="Body (HI)"
            value={form.bodyHi}
            onChange={(e) => setForm({ ...form, bodyHi: e.target.value })}
            rows={8}
          />
          <Field
            label="Hero image URL"
            value={form.heroImageUrl}
            onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
            placeholder="https://example.com/news.jpg"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <span>Published</span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm border border-slate-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save news'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteButton({ id, title, onDeleted }) {
  const { token } = useAdminAuth()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${title}"?`)) return
    setLoading(true)
    try {
      await adminApiFetch(`/news/${id}`, { token, method: 'DELETE' })
      onDeleted?.()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded disabled:opacity-50"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}

function Field({ label, value, onChange, type = 'text', helper, required, placeholder }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
      {helper && <span className="mt-1 block text-xs text-slate-400">{helper}</span>}
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
