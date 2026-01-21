// frontend/src/components/SpotlightGrid.jsx
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchPublicPeople } from '../lib/publicApi'
import { useLang } from '../lib/useLang'
import { makeInitialAvatar } from '../lib/avatar'
let API_File = import.meta.env.VITE_API_File
/**
 * Props:
 * - role: 'founder' | 'management'
 * - titleHi: string (e.g., 'संस्थापक' or 'प्रबंधन टीम')
 * - viewAllPath: string ('founders' | 'management')  // path segment only
 * - limit?: number (default 10)
 */
export default function SpotlightGrid({ role, titleHi, viewAllPath, limit = 10 }) {
  const { lang, makePath } = useLang()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'people', role, limit],
    queryFn: () => fetchPublicPeople(role, limit),
    staleTime: 30_000,
  })

  const people = useMemo(() => data || [], [data])

  const t = {
    viewAll: lang === 'hi' ? 'सभी देखें' : 'View all',
    empty: lang === 'hi' ? 'अभी कोई सूची उपलब्ध नहीं है।' : 'No entries yet.',
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{titleHi}</h2>
        <Link
          to={makePath(`/${viewAllPath}`)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-500"
        >
          {t.viewAll}
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-600">
          {lang === 'hi' ? 'लोड करने में समस्या हुई।' : 'Failed to load.'}
        </div>
      ) : people.length === 0 ? (
        <div className="text-sm text-slate-500">{t.empty}</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => {
            const user = p.user || p
            const fallbackAvatar = makeInitialAvatar(user?.displayName || user?.name || 'Member', {
              size: 80,
              radius: 20,
            })
            const avatar = p.photo
              ? `${API_File || ''}${p.photo}`
              : user?.avatarUrl
                ? `${API_File || ''}${user.avatarUrl}`
                : fallbackAvatar

            const title = user?.designation || p.designation || p.title || ''
            const place = formatLocation(
              p.currentAddress ||
              user?.currentAddress ||
              p.occupationAddress ||
              user?.occupationAddress
            ) || p.place || ''
            const department = user?.department || p.department || ''
            const meta = [title || department, place].filter(Boolean).join(' • ')

            return (
              <li
                key={p.id || user?.id || `${role}-${Math.random()}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <img
                  src={avatar}
                  alt="image"
                  className="h-14 w-14 rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = fallbackAvatar
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.displayName || user?.name || 'Member'}
                  </p>
                  {meta ? (
                    <p className="truncate text-xs text-slate-600">
                      {meta}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function formatLocation(addr) {
  if (!addr || typeof addr !== 'object') return ''
  const parts = [addr.city, addr.district, addr.state].filter(Boolean)
  return parts.join(', ')
}
