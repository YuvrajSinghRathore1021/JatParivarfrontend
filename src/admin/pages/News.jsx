import { useMemo, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import FileDrop from '../../components/FileDrop'
import { upload } from '../../lib/api'
let API_File = import.meta.env.VITE_API_File

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
      <div className="flex flex-col md:flex-row md:items-end gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        {/* Filter by status */}
        <div className="flex-1 md:flex-none">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Filter by status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Search bar */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Search title
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-9 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>
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
  const lang = "en";
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => buildFormState(item))
  const [error, setError] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')

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

  const addPhoto = async (file) => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(lang === 'hi' ? 'कृपया 5MB से कम आकार की छवि चुनें।' : 'Please choose an image smaller than 5 MB.')
      return
    }
    try {
      setPhotoUploading(true)
      setPhotoError('')
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, heroImageUrl: url }))
    } catch (err) {
      console.error(err)
      setPhotoError(lang === 'hi' ? 'फोटो अपलोड नहीं हो सकी। कृपया पुनः प्रयास करें।' : 'Could not upload the photo. Please try again.')
    } finally {
      setPhotoUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[100vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-800">
            {item ? 'Edit News' : 'Add News'}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Error message */}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Titles */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Title (English)"
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              required
            />
            <Field
              label="Title (Hindi)"
              value={form.titleHi}
              onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
            />
          </div>

          {/* Slug */}
          <Field
            label="Custom Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            helper="Defaults to a slug generated from the English title."
          />

          {/* Excerpt Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Excerpt (English)"
              value={form.excerptEn}
              onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Excerpt (Hindi)"
              value={form.excerptHi}
              onChange={(e) => setForm({ ...form, excerptHi: e.target.value })}
              rows={3}
            />
          </div>

          {/* Body Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              label="Body (English)"
              value={form.bodyEn}
              onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
              rows={8}
            />
            <Textarea
              label="Body (Hindi)"
              value={form.bodyHi}
              onChange={(e) => setForm({ ...form, bodyHi: e.target.value })}
              rows={8}
            />
          </div>

          {/* Image */}
          {/* <Field
            label="Hero Image URL"
            value={form.heroImageUrl}
            onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
            placeholder="https://example.com/news.jpg"
          /> */}

          <div className="md:col-span-2 space-y-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">{lang === 'hi' ? 'फोटो अपलोड (वैकल्पिक)' : 'Profile photos (optional)'}</p>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'साफ़ सुथरी तस्वीरें विवाह रुचि बढ़ाती हैं। अधिकतम 4 फोटो जोड़ें।'
                  : 'Clear, recent photos help members connect with you. You can add up to four images.'}
              </p>
            </div>
            <FileDrop
              accept="image/*"
              onFile={addPhoto}
              hint={lang === 'hi' ? 'JPG/PNG • अधिकतम 5 MB' : 'JPG/PNG • up to 5 MB'}
              label={lang === 'hi' ? 'नई फोटो जोड़ें' : 'Add a new photo'}
            />
            {photoUploading && (
              <p className="text-xs text-slate-500">{lang === 'hi' ? 'अपलोड हो रहा है…' : 'Uploading…'}</p>
            )}
            {photoError && <p className="text-xs text-red-600">{photoError}</p>}
            {form.heroImageUrl && (
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <li key={form.heroImageUrl} className="relative overflow-hidden rounded-2xl border border-slate-200">
                  <img src={API_File + form.heroImageUrl} alt="image" className="h-36 w-full object-cover" />
                </li>

              </ul>
            )}
          </div>


          {/* Published checkbox */}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span>Published</span>
          </label>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {saving ? 'Saving…' : item ? 'Update News' : 'Add News'}
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
        className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
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
        className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}
