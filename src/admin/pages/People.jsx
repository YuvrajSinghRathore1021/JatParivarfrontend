import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminMutation, useAdminQuery } from '../hooks/useAdminApi.js'
import { makeInitialAvatar } from '../../lib/avatar'
let API_File = import.meta.env.VITE_API_File

const ROLE_OPTIONS = [
  { value: 'founder', label: 'Founders (संस्थापक)' },
  { value: 'management', label: 'Management (प्रबंधन टीम)' },
]

export default function PeoplePage({ role = 'founder' }) {
  const [currentRole, setCurrentRole] = useState(role)
  const [search, setSearch] = useState('')

  const listQueryKey = useMemo(() => ['admin', 'founders', { role: currentRole, search }], [currentRole, search])

  const { data, isLoading, refetch } = useAdminQuery(
    listQueryKey,
    () => `/founders?role=${encodeURIComponent(currentRole)}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    { staleTime: 0 }
  )

  // NOTE: backend returns { data: [...] }
  const list = data?.data || []

  const updateMut = useAdminMutation(({ id }) => `/founders/${id}`, { method: () => 'PATCH', invalidate: [listQueryKey] })
  const visibilityMut = useAdminMutation(({ id }) => `/founders/${id}/visibility`, { method: () => 'PATCH', invalidate: [listQueryKey] })
  const [searchInput, setSearchInput] = useState(search)

  const onToggle = (id, visible) => visibilityMut.mutate({ id, visible: !visible })
  const onSave = (item, patch) => updateMut.mutate({ id: item.id, ...patch })

  const applySearch = () => {
    if (searchInput === search) return
    setSearch(searchInput)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">People</h2>
        <select
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          className="border rounded-lg px-2 py-1 text-sm"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applySearch()
              }
            }}
            placeholder="Search name…"
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={applySearch}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearch('')
              setSearchInput('')
              refetch()
            }}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </header>

      <section className="space-y-2">
        {isLoading ? (
          <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        ) : list.length === 0 ? (
          <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600">No records.</div>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => {
              const displayName = p.name || p.user?.displayName || p.user?.name || 'Member'
              const avatar = API_File+p.photo || API_File+p.user?.avatarUrl ||
                makeInitialAvatar(displayName, { size: 80, radius: 20 })
              return (
                <li key={p.id} className="rounded-2xl border bg-white p-3 flex items-center gap-3">
                  <img src={avatar} alt={displayName} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-semibold truncate">{displayName}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {[p.title, p.place].filter(Boolean).join(' • ') || '—'}
                    </div>
                    {p.user?.phone && (
                      <div className="text-xs text-slate-400 truncate">{p.user.phone}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={p.order ?? 0}
                      onBlur={(e) => {
                        const next = Number(e.target.value || 0)
                        if (next !== (p.order ?? 0)) onSave(p, { order: next })
                      }}
                      className="w-16 border rounded px-1 py-1 text-xs text-center"
                      title="Order (lower shows first)"
                    />
                    <button
                      onClick={() => onToggle(p.id, p.visible)}
                      className={`px-2 py-1 text-xs rounded border ${
                        p.visible ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {p.visible ? 'Visible' : 'Hidden'}
                    </button>
                    {p.user?.id && (
                      <Link
                        to={`/admin/members/${p.user.id}`}
                        className="px-2 py-1 text-xs rounded border text-slate-600 hover:bg-slate-50"
                      >
                        Open member
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
