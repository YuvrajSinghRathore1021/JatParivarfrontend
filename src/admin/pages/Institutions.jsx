import { useMemo, useState, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { useGeoOptions } from '../../hooks/useGeoOptions'

export default function InstitutionsPage() {
  const [kind, setKind] = useState('dharamshala')
  const [query, setQuery] = useState('')
  const [published, setPublished] = useState('') // '', 'true', 'false'



  const key = useMemo(() => ['admin', 'institutions', { kind, query, published }], [kind, query, published])

  const { data, refetch, isLoading } = useAdminQuery(
    key,
    () => `/institutions?${[
      kind ? `kind=${encodeURIComponent(kind)}` : '',
      query ? `search=${encodeURIComponent(query)}` : '',
      published ? `published=${published}` : '' ].filter(Boolean).join('&')}`
  )

  const list = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{kind === 'dharamshala' ? 'Dharamshalaye' : 'Sansthaye'}</h1>
          <p className="text-sm text-slate-500">Edit listings shown on the public directory.</p>
        </div>
        <InstitutionFormButton kind={kind} onSaved={() => refetch()} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="dharamshala">Dharamshalaye</option>
          <option value="sanstha">Sansthaye</option>
        </select>
        <select value={published} onChange={(e) => setPublished(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="">All</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title / city / state…"
          className="border border-slate-300 rounded px-3 py-2 text-sm flex-1 min-w-[220px]"
        />
        <button onClick={() => refetch()} className="px-3 py-2 text-sm border border-slate-300 rounded">Apply</button>
      </div>

      {isLoading ? (
        <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map(item => (
            <InstitutionCard key={item.id} item={item} onSaved={() => refetch()} />
          ))}
          {list.length === 0 && <p className="text-sm text-slate-500">No listings yet.</p>}
        </div>
      )}
    </div>
  )
}

function InstitutionCard({ item, onSaved }) {

  const { token } = useAdminAuth()
  const [busy, setBusy] = useState(false)
  const call = (path, body, type = 'PATCH') => adminApiFetch(path, { token, body, method: type })

  const toggleApprove = async () => {
    setBusy(true)
    try {
      await call(`/institutions/${item.id}/approve`, { approved: !item.approved })
      onSaved?.()
    } finally { setBusy(false) }
  }
  const toggleDelete = async () => {
    setBusy(true)
    try {
      await call(`/institutions/${item.id}`, { approved: !item.approved }, 'DELETE')
      onSaved?.()
    } finally { setBusy(false) }
  }

  const togglePublish = async () => {
    setBusy(true)
    try {
      // ✅ publish also ensures approved=true server-side (see backend)
      await call(`/institutions/${item.id}/publish`, { published: !item.published })
      onSaved?.()
    } finally { setBusy(false) }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{item.titleEn || item.titleHi}</h2>
      <p className="text-sm text-slate-500">{item.city}, {item.state}</p>
      <p className="text-xs text-slate-500 mt-1">{item.descriptionEn?.slice(0, 120) || 'No description provided.'}</p>

      <div className="flex items-center gap-2 mt-3 text-xs">
        <span className={`px-2 py-1 rounded-full border ${item.approved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {item.approved ? 'Approved' : 'Pending'}
        </span>
        <span className={`px-2 py-1 rounded-full border ${item.published ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {item.published ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="flex gap-2">
          <button disabled={busy} onClick={toggleApprove} className="px-2 py-1 border rounded">
            {item.approved ? 'Unapprove' : 'Approve'}
          </button>
          <button disabled={busy} onClick={togglePublish} className="px-2 py-1 border rounded">
            {item.published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={toggleDelete}
            disabled={busy}
            className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
        <InstitutionFormButton item={item} onSaved={onSaved} />
      </div>
    </div>
  )
}

function InstitutionFormButton({ item, kind, onSaved }) {
  console.log(item)
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState(() =>
    item || {
      kind: kind || 'dharamshala',
      titleEn: '',
      addressEn: '',
      state: '',
      district: '',
      city: '',
      published: false,
      approved: false,
      pin: '',
      email: '',
      contact: {
        email: '',
        name: '',
        phone: '',

      }
    }
  )// ✅ Add this for geo selections
  const [addressCodes, setAddressCodes] = useState({ stateCode: '', districtCode: '', cityCode: '' })
  const { states, districts, cities, stateOptions, districtOptions, cityOptions } =
    useGeoOptions(addressCodes.stateCode, addressCodes.districtCode, 'en')

  // ✅ Handlers for dependent dropdowns (same as in MemberDetail)
  const onStateChange = (code) => {
    const selected = states.find((s) => s.code === code)
    setAddressCodes({ stateCode: code, districtCode: '', cityCode: '' })
    setForm((prev) => ({
      ...prev,
      state: selected?.name.en || '',
      district: '',
      city: '',
    }))
  }

  const onDistrictChange = (code) => {
    const selected = districts.find((d) => d.code === code)
    setAddressCodes((prev) => ({ ...prev, districtCode: code, cityCode: '' }))
    setForm((prev) => ({
      ...prev,
      district: selected?.name.en || '',
      city: '',
    }))
  }

  const onCityChange = (code) => {
    const selected = cities.find((c) => c.code === code)
    setAddressCodes((prev) => ({ ...prev, cityCode: code }))
    setForm((prev) => ({
      ...prev,
      city: selected?.name.en || '',
    }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // If admin ticks Published, auto-approve too
      const payload = { ...form }
      if (payload.published && payload.approved !== true) payload.approved = true

      if (item) {
        await adminApiFetch(`/institutions/${item.id}`, { token, method: 'PATCH', body: payload })
      } else {
        await adminApiFetch('/institutions', { token, method: 'POST', body: payload })
      }
      setOpen(false)
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    if (item) {
      return <button onClick={() => setOpen(true)} className="px-3 py-2 text-sm border border-slate-300 rounded">Edit</button>
    }
    return <button onClick={() => setOpen(true)} className="px-3 py-2 text-sm bg-slate-900 text-white rounded">Add listing</button>
  }



  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{item ? 'Edit listing' : 'Add listing'}</h2>
          <button onClick={() => setOpen(false)} className="text-slate-500">Close</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}


        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Kind</label>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="mt-1 w-full border rounded px-3 py-2 text-sm">
                <option value="dharamshala">Dharamshala</option>
                <option value="sanstha">Sanstha</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Published</label>
              <div className="mt-1">
                <input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> <span className="text-sm">Published</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Title (EN)</label>
            <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" required />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Description (EN)</label>
            <textarea value={form.descriptionEn || ''} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" rows={3} />
          </div>

          {/* ✅ Address fields using geoOptions */}

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input value={form.contact?.name} onChange={(e) =>
                setForm({
                  ...form,
                  contact: {
                    ...form.contact,
                    name: e.target.value,
                  },
                })
              }
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input value={form.contact?.email} onChange={(e) =>
                setForm({
                  ...form,
                  contact: {
                    ...form.contact,
                    email: e.target.value,
                  },
                })
              }
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Phone</label>
              <input value={form.contact?.phone} onChange={(e) =>
                setForm({
                  ...form,
                  contact: {
                    ...form.contact,
                    phone: e.target.value,
                  },
                })
              }
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" required />
            </div>
          </div>



          <div>
            <div>
              <label className="text-xs font-medium text-slate-600">State</label>
              <select
                value={addressCodes.stateCode}
                onChange={(e) => onStateChange(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select state</option>
                {stateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">District</label>
              <select
                value={addressCodes.districtCode}
                onChange={(e) => onDistrictChange(e.target.value)}
                disabled={!addressCodes.stateCode}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select district</option>
                {districtOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">City</label>
              <select
                value={addressCodes.cityCode}
                onChange={(e) => onCityChange(e.target.value)}
                disabled={!addressCodes.districtCode}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select city</option>
                {cityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Pin</label>
              <input value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" required />
            </div>


          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Address</label>
            <textarea value={form.addressEn || ''} onChange={(e) => setForm({ ...form, addressEn: e.target.value })} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" rows={3} />
          </div>

          <div className="flex justify-end gap-2 mt-4">
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
