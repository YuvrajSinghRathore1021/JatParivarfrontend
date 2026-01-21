import { useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { useGeoOptions } from '../../hooks/useGeoOptions'
const normalizeReferralCode = (value = '') => value.trim().toUpperCase()

export default function JobsPage() {
  const [status, setStatus] = useState('all') // all | published | draft | pending
  const [search, setSearch] = useState('')

  const path = () => {
    const p = new URLSearchParams()
    // Map UI filter to API filters
    if (status === 'published') p.set('published', 'true')
    if (status === 'draft') p.set('published', 'false')
    if (status === 'pending') p.set('approved', 'false')
    if (search) p.set('search', search)
    return `/jobs?${p.toString()}`
  }

  const { data, refetch, isFetching, error } = useAdminQuery(['admin','jobs',status,search], path)
  const jobs = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Jobs</h1>
          <p className="text-sm text-slate-500">Approve, publish, and edit job posts.</p>
        </div>
        <JobFormButton onSaved={() => refetch()} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending approval</option>
        </select>
        <input
          placeholder="Search title/city/state"
          className="border border-slate-300 rounded px-3 py-2 text-sm"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          onKeyDown={(e)=>e.key==='Enter' && refetch()}
        />
        <button onClick={()=>refetch()} className="px-3 py-2 text-sm border border-slate-300 rounded disabled:opacity-50" disabled={isFetching}>
          {isFetching ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{String(error.message || error)}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} onSaved={()=>refetch()} />
        ))}
        {jobs.length === 0 && <p className="text-sm text-slate-500">No jobs found.</p>}
      </div>
    </div>
  )
}

function JobCard({ job, onSaved }) {
  const { token } = useAdminAuth()
  const [busy, setBusy] = useState(false)

  const setApproved = async (approved) => {
    setBusy(true)
    try {
      await adminApiFetch(`/jobs/${job.id}/approve`, { token, method: 'PATCH', body: { approved } })
      onSaved?.()
    } finally {
      setBusy(false)
    }
  }

  const setPublished = async (published) => {
    setBusy(true)
    try {
      await adminApiFetch(`/jobs/${job.id}/publish`, { token, method: 'PATCH', body: { published } })
      onSaved?.()
    } finally {
      setBusy(false)
    }
  }
  const setDelete = async (deletedata) => {
    setBusy(true)
    try {
      await adminApiFetch(`/jobs/${job.id}`, { token, method: 'DELETE', body: { deletedata } })
      onSaved?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-wrap-anywhere line-clamp-2">{job.title}</h2>
      <p className="text-sm text-slate-500 ">{job.locationCity}, {job.locationState}</p>
      <p className="text-xs text-slate-500 mt-1 text-wrap-anywhere line-clamp-2 whitespace-pre-wrap">{job.description || 'No description.'}</p>

      <div className="flex items-center gap-2 mt-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.approved ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
          {job.approved ? 'Approved' : 'Pending'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.published ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
          {job.published ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          className="px-3 py-2 text-sm border border-slate-300 rounded"
          disabled={busy}
          onClick={()=>setApproved(!job.approved)}
        >
          {job.approved ? 'Mark Pending' : 'Approve'}
        </button>
        <button
          className="px-3 py-2 text-sm border border-slate-300 rounded"
          disabled={busy}
          onClick={()=>setPublished(!job.published)}
        >
          {job.published ? 'Unpublish' : 'Publish'}
        </button>
        <button
          onClick={()=>setDelete(job.id)}
          disabled={busy}
          className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>

        <JobFormButton job={job} onSaved={onSaved} />
      </div>
    </div>
  )
}

function JobFormButton({ job, onSaved }) {
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => job || {
    title: '',
    description: '',
    type: 'full_time',
    locationState: '',
    locationDistrict: '',
    locationCity: '',
    locationVillage: '',
    salaryRange: '',
    contactPhone: '',
    approved: false,
    published: false,
    referralCode: '',
    userId: '',
  })

  // ✅ SAME WORKING STYLE AS INSTITUTIONS
  const [geoCodes, setGeoCodes] = useState({ stateCode: '', districtCode: '', cityCode: '' })
  const { states, districts, cities, stateOptions, districtOptions, cityOptions } =
    useGeoOptions(geoCodes.stateCode, geoCodes.districtCode, 'en', { includeRemoved: true })

  const matchCodeByName = (list = [], value) => {
    if (!value) return ''
    const normalized = value.toString().trim().toLowerCase()
    const match = list.find((item) => {
      const en = item?.name?.en?.toString().trim().toLowerCase()
      const hi = item?.name?.hi?.toString().trim().toLowerCase()
      return en === normalized || hi === normalized
    })
    return match?.code || ''
  }

  useEffect(() => {
    if (open && !job) {
      setGeoCodes({ stateCode: '', districtCode: '', cityCode: '' })
    }
  }, [open, job])

  // Prefill geo codes from existing job if present
  useEffect(() => {
    if (!open || !job) return
    setGeoCodes((prev) => ({
      stateCode: job.locationStateCode || prev.stateCode,
      districtCode: job.locationDistrictCode || prev.districtCode,
      cityCode: job.locationCityCode || prev.cityCode,
    }))
  }, [open, job])

  // If job already has names but not codes (older data), force "__OTHER__" so manual fields show with existing text.
  useEffect(() => {
    if (!open || !job) return
    setGeoCodes((prev) => {
      const next = { ...prev }
      if (!job.locationStateCode && job.locationState && !next.stateCode) next.stateCode = '__OTHER__'
      if (!job.locationDistrictCode && job.locationDistrict && !next.districtCode) next.districtCode = '__OTHER__'
      if (!job.locationCityCode && job.locationCity && !next.cityCode) next.cityCode = '__OTHER__'
      return next
    })
  }, [open, job])

  useEffect(() => {
    setGeoCodes((prev) => {
      const nextState = prev.stateCode || job?.locationStateCode || matchCodeByName(states, form.locationState)
      const nextDistrict = prev.districtCode || job?.locationDistrictCode || matchCodeByName(districts, form.locationDistrict)
      const nextCity = prev.cityCode || job?.locationCityCode || matchCodeByName(cities, form.locationCity)

      if (
        nextState === prev.stateCode &&
        nextDistrict === prev.districtCode &&
        nextCity === prev.cityCode
      ) return prev

      return { stateCode: nextState || '', districtCode: nextDistrict || '', cityCode: nextCity || '' }
    })
  }, [states, districts, cities, form.locationState, form.locationDistrict, form.locationCity, job])

  const onStateChange = (code) => {
    if (code === '__OTHER__') {
      setGeoCodes({ stateCode: '__OTHER__', districtCode: '', cityCode: '' })
      setForm((prev) => ({ ...prev, locationState: '', locationDistrict: '', locationCity: '' }))
      return
    }
    const selected = states.find((s) => s.code === code)
    setGeoCodes({ stateCode: code, districtCode: '', cityCode: '' })
    setForm((prev) => ({
      ...prev,
      locationState: selected?.name.en || '',
      locationDistrict: '',
      locationCity: '',
    }))
  }

  const onDistrictChange = (code) => {
    if (code === '__OTHER__') {
      setGeoCodes((prev) => ({ ...prev, districtCode: '__OTHER__', cityCode: '' }))
      setForm((prev) => ({ ...prev, locationDistrict: '', locationCity: '' }))
      return
    }
    const selected = districts.find((d) => d.code === code)
    setGeoCodes((prev) => ({ ...prev, districtCode: code, cityCode: '' }))
    setForm((prev) => ({
      ...prev,
      locationDistrict: selected?.name.en || '',
      locationCity: '',
    }))
  }

  const onCityChange = (code) => {
    if (code === '__OTHER__') {
      setGeoCodes((prev) => ({ ...prev, cityCode: '__OTHER__' }))
      setForm((prev) => ({ ...prev, locationCity: '' }))
      return
    }
    const selected = cities.find((c) => c.code === code)
    setGeoCodes((prev) => ({ ...prev, cityCode: code }))
    setForm((prev) => ({
      ...prev,
      locationCity: selected?.name.en || '',
    }))
  }

  const typeOptions = useMemo(() => [
    { value: 'full_time', label: 'Full time' },
    { value: 'part_time', label: 'Part time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: '__custom', label: 'Other (type your own)' },
  ], [])

  useEffect(() => {
    if (job && open) {
      const inList = typeOptions.some((t) => t.value === job.type)
      setForm((prev) => ({
        ...prev,
        type: inList ? job.type : '__custom',
        customType: inList ? '' : job.type || '',
      }))
    }
  }, [job, open, typeOptions])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        type: form.type === '__custom' ? (form.customType || '') : form.type,
        locationStateCode: geoCodes.stateCode,
        locationDistrictCode: geoCodes.districtCode,
        locationCityCode: geoCodes.cityCode,
        locationState: form.locationState || stateOptions.find((s) => s.value === geoCodes.stateCode)?.label || form.locationState,
        locationDistrict: form.locationDistrict || districtOptions.find((d) => d.value === geoCodes.districtCode)?.label || form.locationDistrict,
        locationCity: form.locationCity || cityOptions.find((c) => c.value === geoCodes.cityCode)?.label || form.locationCity,
        locationVillage: form.locationVillage || '',
      }
      if (job) {
        await adminApiFetch(`/jobs/${job.id}`, { token, method: 'PATCH', body: payload })
      } else {
        await adminApiFetch('/jobs', { token, method: 'POST', body: payload })
      }
      setOpen(false)
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button onClick={()=>setOpen(true)} className={`px-3 py-2 text-sm ${job ? 'border border-slate-300 rounded' : 'bg-slate-900 text-white rounded'}`}>
        {job ? 'Edit' : 'Add Job'}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{job ? 'Edit job' : 'Add job'}</h2>
          <button onClick={()=>setOpen(false)} className="text-slate-500">Close</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Title</label>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea value={form.description||''} onChange={e=>setForm({...form, description:e.target.value})} rows={5} className="mt-1 w-full   border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">State</label>
              <select
                value={geoCodes.stateCode}
                onChange={(e) => onStateChange(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select state</option>
                {stateOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                <option value="__OTHER__">Not in list</option>
              </select>

              {geoCodes.stateCode === '__OTHER__' && (
                <input
                  className="mt-2 w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter state"
                  value={form.locationState}
                  onChange={(e) => setForm((prev) => ({ ...prev, locationState: e.target.value }))}
                />
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">District</label>
              <select
                value={geoCodes.districtCode}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select district</option>
                {districtOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                <option value="__OTHER__">Not in list</option>
              </select>

              {geoCodes.districtCode === '__OTHER__' && (
                <input
                  className="mt-2 w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter district"
                  value={form.locationDistrict || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, locationDistrict: e.target.value }))}
                />
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">City</label>
              <select
                value={geoCodes.cityCode}
                onChange={(e) => onCityChange(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select city</option>
                {cityOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                <option value="__OTHER__">Not in list</option>
              </select>

              {geoCodes.cityCode === '__OTHER__' && (
                <input
                  className="mt-2 w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter city"
                  value={form.locationCity}
                  onChange={(e) => setForm((prev) => ({ ...prev, locationCity: e.target.value }))}
                />
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Type</label>
              <select value={form.type||'full_time'} onChange={e=>setForm({...form, type:e.target.value})} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm">
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {form.type === '__custom' && (
                <input
                  className="mt-2 w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter custom type"
                  value={form.customType || ''}
                  onChange={(e) => setForm({ ...form, customType: e.target.value })}
                />
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Salary range</label>
              <input value={form.salaryRange||''} onChange={e=>setForm({...form, salaryRange:e.target.value})} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Contact phone</label>
              <input value={form.contactPhone||''} onChange={e=>setForm({...form, contactPhone:e.target.value})} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Address (पता)</label>
            <input
              value={form.locationVillage || ''}
              onChange={(e) => setForm({ ...form, locationVillage: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
              placeholder="Street / locality"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Link by userId (optional)</label>
              <input
                value={form.userId || ''}
                onChange={(e)=>setForm({...form, userId:e.target.value})}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
                placeholder="Paste user ObjectId"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Link by referral code (optional)</label>
              <input
                value={form.referralCode || ''}
                onChange={(e)=>setForm({...form, referralCode: normalizeReferralCode(e.target.value)})}
                className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm uppercase"
                placeholder="Referral code"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="text-xs font-medium text-slate-600 inline-flex items-center gap-2">
              <input type="checkbox" checked={!!form.approved} onChange={e=>setForm({...form, approved: e.target.checked})} /> Approved
            </label>
            <label className="text-xs font-medium text-slate-600 inline-flex items-center gap-2">
              <input type="checkbox" checked={!!form.published} onChange={e=>setForm({...form, published: e.target.checked})} /> Published
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>setOpen(false)} className="px-3 py-2 text-sm border border-slate-300 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50">{saving?'Saving…':'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
