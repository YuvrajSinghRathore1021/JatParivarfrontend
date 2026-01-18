// frontend/src/pages/dashboard/matrimony/MatrimonyInterests.jsx
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMatrimonyInterests,
  acceptMatrimonyInterest,
} from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'
import { makeInitialAvatar } from '../../../lib/avatar'
let API_File = import.meta.env.VITE_API_File
export default function MatrimonyInterests() {
  const { lang } = useLang()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['matrimony', 'interests'],
    queryFn: fetchMatrimonyInterests,
  })

  const acceptMutation = useMutation({
    mutationFn: acceptMatrimonyInterest,
    onSuccess: () => qc.invalidateQueries(['matrimony', 'interests']),
  })

  const incoming = useMemo(() => data?.incoming || [], [data])
  const outgoing = useMemo(() => data?.outgoing || [], [data])

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          {lang === 'hi' ? 'आपकी प्रोफ़ाइल पर रुचि' : 'Interests on your profile'}
        </h2>
        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-24 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : incoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            {lang === 'hi' ? 'अभी किसी ने आपकी प्रोफ़ाइल पर रुचि नहीं दिखाई है।' : 'No one has expressed interest in your profile yet.'}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {incoming.map((item) => {
              const user = item.user || {}
              const avatar = API_File+user.avatarUrl || makeInitialAvatar(user.name || 'Member', { size: 80, radius: 24 })
              return (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <img src={avatar} alt="image" className="h-14 w-14 rounded-2xl object-cover" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{user.name || 'Member'}</h3>
                        <p className="text-sm text-slate-500">{user.occupation || user.company || '—'}</p>
                        {user.phone && (
                          <p className="text-sm text-slate-700">{lang === 'hi' ? 'फ़ोन:' : 'Phone:'} {user.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {lang === 'hi' ? (item.status === 'accepted' ? 'स्वीकृत' : 'नयी रुचि') : item.status === 'accepted' ? 'Accepted' : 'New interest'}
                      </span>
                      {item.status !== 'accepted' && (
                        <button
                          type="button"
                          onClick={() => acceptMutation.mutate(item.id)}
                          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                          {lang === 'hi' ? 'स्वीकृति दें' : 'Accept'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          {lang === 'hi' ? 'आपकी भेजी गई रुचियाँ' : 'Interests you sent'}
        </h2>
        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-24 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : outgoing.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            {lang === 'hi' ? 'आपने अभी तक किसी में रुचि नहीं दिखाई है।' : 'You have not expressed interest in anyone yet.'}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {outgoing.map((item) => {
              const user = item.user || {}
              const avatar = API_File+user.avatarUrl || makeInitialAvatar(user.name || 'Member', { size: 80, radius: 24 })
              return (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={avatar} alt="image" className="h-14 w-14 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{user.name || 'Member'}</h3>
                      <p className="text-sm text-slate-500">{user.occupation || user.company || '—'}</p>
                      {item.status === 'accepted' && (
                        <p className="text-sm text-slate-700">{lang === 'hi' ? 'संपर्क:' : 'Contact:'} {user.phone || '—'}</p>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {lang === 'hi'
                        ? item.status === 'accepted'
                          ? 'स्वीकृत'
                          : 'प्रतीक्षित'
                        : item.status === 'accepted'
                        ? 'Accepted'
                        : 'Pending'}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
