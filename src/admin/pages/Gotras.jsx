import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { JAT_GOTRAS } from '../../constants/gotras'

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2, 10)}`)

export default function GotrasPage() {
  const { token } = useAdminAuth()
  const qc = useQueryClient()
  const { data, isLoading, refetch } = useAdminQuery(['admin', 'settings'], '/settings')
  const settings = useMemo(() => data?.data || {}, [data])

  const [gotras, setGotras] = useState(() => normalizeGotras(settings['gotras']))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [newlyAddedId, setNewlyAddedId] = useState('')

  useEffect(() => {
    setGotras(normalizeGotras(settings['gotras']))
  }, [settings])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return gotras
    return gotras.filter((g) => {
      const value = (g.value || '').toLowerCase()
      const en = (g.en || '').toLowerCase()
      const hi = (g.hi || '').toLowerCase()
      return value.includes(q) || en.includes(q) || hi.includes(q)
    })
  }, [gotras, search])

  const addGotra = () => {
    const id = makeId()
    setSearch('')
    setNewlyAddedId(id)
    setGotras((prev) => [{ id, value: '', en: '', hi: '' }, ...prev])
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await adminApiFetch('/settings', { token, method: 'PATCH', body: { gotras: cleanGotras(gotras) } })
      setSuccess('Gotra list saved')
      qc.invalidateQueries({ queryKey: ['geo', 'gotras'] })
      refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Gotras</h1>
        <p className="text-sm text-slate-500">Manage the gotra directory shown across profiles (manual typing remains available).</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading settings…</div>
      ) : (
        <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Gotra directory</h2>
              <p className="text-xs text-slate-500">Add, rename, or remove gotras shown in selectors.</p>
            </div>
            <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={saving}>
              {saving ? 'Saving…' : 'Save gotras'}
            </button>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <label className="text-xs font-medium text-slate-600">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="Search gotra…" />
            </div>
            <button type="button" onClick={addGotra} className="px-3 py-2 text-sm border border-slate-300 rounded">
              Add gotra
            </button>
          </div>

          {filtered.length === 0 && <p className="text-sm text-slate-500">No gotras configured yet.</p>}
          <div className="space-y-3">
            {filtered.map((g) => (
              <div key={g.id} className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end border border-slate-200 rounded-lg p-3">
                <Field label="Value" value={g.value} onChange={(e) => setGotras((prev) => updateById(prev, g.id, { value: e.target.value }))} autoFocus={g.id === newlyAddedId} />
                <Field label="Name (EN)" value={g.en} onChange={(e) => setGotras((prev) => updateById(prev, g.id, { en: e.target.value }))} />
                <Field label="Name (HI)" value={g.hi} onChange={(e) => setGotras((prev) => updateById(prev, g.id, { hi: e.target.value }))} />
                <button type="button" onClick={() => setGotras((prev) => prev.filter((row) => row.id !== g.id))} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </form>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, autoFocus }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}

const safeList = (v) => (Array.isArray(v) ? v : [])

const normalizeGotras = (value) => {
  const source = Array.isArray(value) && value.length
    ? value
    : JAT_GOTRAS.filter((g) => g.value && g.value !== '__custom')

  return source
    .map((g) => ({
      id: g.id || makeId(),
      value: (g.value || g.en || '').toString().trim(),
      en: (g.en || g.value || '').toString().trim(),
      hi: (g.hi || g.en || g.value || '').toString().trim(),
    }))
    .filter((g) => g.value)
}

const cleanGotras = (list) => {
  const seen = new Set()
  const cleaned = []
  for (const item of safeList(list)) {
    const value = (item.value || item.en || '').toString().trim()
    if (!value || value === '__custom') continue
    if (seen.has(value)) continue
    seen.add(value)
    cleaned.push({
      value,
      en: (item.en || value).toString().trim(),
      hi: (item.hi || item.en || value).toString().trim(),
    })
  }
  return cleaned
}

const updateById = (list, id, updates) =>
  safeList(list).map((item) => (item.id === id ? { ...item, ...updates } : item))
