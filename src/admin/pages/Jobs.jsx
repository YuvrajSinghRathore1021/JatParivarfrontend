import { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'

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
      <h2 className="text-lg font-semibold break-all">{job.title}</h2>
      <p className="text-sm text-slate-500 ">{job.locationCity}, {job.locationState}</p>
      <p className="text-xs text-slate-500 mt-1 break-all">{job.description?.slice(0, 140) || 'No description.'}</p>

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
    title: '', description: '', type: 'full_time',
    locationState: '', locationCity: '',
    salaryRange: '', contactPhone: '',
    approved: false, published: false
  })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (job) {
        await adminApiFetch(`/jobs/${job.id}`, { token, method: 'PATCH', body: form })
      } else {
        await adminApiFetch('/jobs', { token, method: 'POST', body: form })
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
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">City</label>
              <input value={form.locationCity||''} onChange={e=>setForm({...form, locationCity:e.target.value})} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">State</label>
              <input value={form.locationState||''} onChange={e=>setForm({...form, locationState:e.target.value})} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Type</label>
              <select value={form.type||'full_time'} onChange={e=>setForm({...form, type:e.target.value})} className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm">
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
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
