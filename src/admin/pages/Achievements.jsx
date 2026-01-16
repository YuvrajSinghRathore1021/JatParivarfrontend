// frontend/src/admin/pages/Achievements.jsx
import { useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'

export default function AchievementsPage() {
  const { data, refetch } = useAdminQuery(['admin', 'achievements'], '/achievements')
  const list = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Achievements ticker</h1>
          <p className="text-sm text-slate-500">Items displayed on the home page ticker.</p>
        </div>
        <AchievementFormButton onSaved={() => refetch()} />
      </div>
      {/* <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {list.map(item => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{item.textEn}</p>
              <p className="text-xs text-slate-500">{item.textHi}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{item.active ? 'Active' : 'Hidden'}</span>
              <AchievementFormButton achievement={item} onSaved={() => refetch()} />
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-4 text-sm text-slate-500">No ticker items yet.</p>}
      </div> */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
  {list.map(item => (
    <div key={item.id} className="p-4 flex items-start gap-4">

      {/* TEXT BLOCK */}
      <div className="flex-1 break-all whitespace-normal">
        <p className="text-sm font-medium">{item.textEn}</p>
        <p className="text-xs text-slate-500">{item.textHi}</p>
      </div>

      {/* BUTTON + BADGE */}
      <div className="flex items-center gap-3 text-sm shrink-0">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.active
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {item.active ? 'Active' : 'Hidden'}
        </span>

        <AchievementFormButton achievement={item} onSaved={() => refetch()} />
      </div>

    </div>
  ))}

  {list.length === 0 && (
    <p className="p-4 text-sm text-slate-500">No ticker items yet.</p>
  )}
</div>

    </div>
  )
}

function AchievementFormButton({ achievement, onSaved }) {
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => achievement || { textEn: '', textHi: '', active: true })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (achievement) {
        await adminApiFetch(`/achievements/${achievement.id}`, { token, method: 'PATCH', body: form })
      } else {
        await adminApiFetch('/achievements', { token, method: 'POST', body: form })
      }
      setOpen(false)
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  const [busy, setBusy] = useState(false)
  const toggleDelete = async () => {
    setBusy(true)
    let payload = {};
    try {
      await adminApiFetch(`/achievements/${achievement.id}`, { token, method: 'DELETE', body: payload })
      onSaved?.()
    } finally { setBusy(false) }
  }

  if (!open) {
    if (achievement) {
      return (<>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-2 text-sm border border-slate-300 rounded"
          >
            Edit
          </button>

          <button
            onClick={toggleDelete}
            disabled={busy}
            className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </>)
    }
    return <button onClick={() => setOpen(true)} className="px-3 py-2 text-sm bg-slate-900 text-white rounded">Add ticker item</button>
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{achievement ? 'Edit ticker item' : 'Add ticker item'}</h2>
          <button onClick={() => setOpen(false)} className="text-slate-500">Close</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Text (English)</label>
            <textarea value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" rows={3} required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Text (Hindi)</label>
            <textarea value={form.textHi || ''} onChange={(e) => setForm({ ...form, textHi: e.target.value })} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" rows={3} />
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
