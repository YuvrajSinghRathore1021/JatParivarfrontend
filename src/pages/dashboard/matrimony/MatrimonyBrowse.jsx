// frontend/src/pages/dashboard/matrimony/MatrimonyBrowse.jsx
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLang } from '../../../lib/useLang'
import {
  fetchMatrimonyProfiles,
  fetchMatrimonyInterests,
  sendMatrimonyInterest,
} from '../../../lib/dashboardApi'
import { makeInitialAvatar } from '../../../lib/avatar'

const sortOptions = [
  { value: 'recent', labelEn: 'Recently updated', labelHi: 'हाल ही में अपडेट' },
  { value: 'age-asc', labelEn: 'Age (low to high)', labelHi: 'आयु (कम से अधिक)' },
  { value: 'age-desc', labelEn: 'Age (high to low)', labelHi: 'आयु (अधिक से कम)' },
]

export default function MatrimonyBrowse() {
  const { lang } = useLang()
  const [sort, setSort] = useState('recent')
  const qc = useQueryClient()

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['matrimony', 'profiles', sort],
    queryFn: () => fetchMatrimonyProfiles(sort),
  })

  const { data: interests } = useQuery({
    queryKey: ['matrimony', 'interests'],
    queryFn: fetchMatrimonyInterests,
  })

  const likedSet = useMemo(() => {
    const outgoing = interests?.outgoing || []
    return new Set(outgoing.map((item) => item.user?.id))
  }, [interests])

  const interestMutation = useMutation({
    mutationFn: sendMatrimonyInterest,
    onSuccess: () => qc.invalidateQueries(['matrimony', 'interests']),
  })

  const sortedProfiles = profiles || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {lang === 'hi' ? 'विवाह प्रोफ़ाइल' : 'Matrimony profiles'}
          </h2>
          <p className="text-sm text-slate-600">
            {lang === 'hi'
              ? 'रुचि दिखाने पर दूसरे सदस्य को सूचना मिलेगी। दोनों की सहमति के बाद फोन नंबर साझा होगा।'
              : 'Expressing interest notifies the member. Phone numbers are shared only after both members agree.'}
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          {lang === 'hi' ? 'क्रम:' : 'Sort by:'}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {lang === 'hi' ? opt.labelHi : opt.labelEn}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-48 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : sortedProfiles.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {lang === 'hi' ? 'अभी कोई विवाह प्रोफ़ाइल उपलब्ध नहीं है।' : 'No matrimony profiles are available yet.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedProfiles.map((profile) => {
            const user = profile.user || {}
            const avatar = user.avatarUrl || makeInitialAvatar(user.displayName || 'Member', { size: 96, radius: 28 })
            const interested = user.id ? likedSet.has(user.id) : false
            return (
              <article key={profile.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <header className="flex items-center gap-4">
                  <img src={avatar} alt={user.displayName} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {user.displayName || (lang === 'hi' ? 'सदस्य' : 'Member')}
                    </h3>
                    <p className="text-sm text-slate-500">{profile.age ? `${profile.age} ${lang === 'hi' ? 'वर्ष' : 'years'}` : '—'}</p>
                  </div>
                </header>
                <dl className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'गोत्र' : 'Gotra'}</dt>
                    <dd>{profile.gotra?.self || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'शिक्षा' : 'Education'}</dt>
                    <dd>{profile.education || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'लंबाई' : 'Hight'}</dt>
                    <dd>{profile.height || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'व्यवसाय' : 'Occupation'}</dt>
                    <dd>{profile.occupation || user.occupation || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'स्थान' : 'Location'}</dt>
                    <dd>
                      {[profile.location?.city, profile.location?.state].filter(Boolean).join(', ') || '—'}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => user.id && interestMutation.mutate(user.id)}
                  disabled={!user.id || interested || interestMutation.isPending}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {interested
                    ? lang === 'hi'
                      ? 'रुचि भेज दी गई'
                      : 'Interest sent'
                    : lang === 'hi'
                    ? 'रुचि दिखाएँ'
                    : 'Express interest'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
