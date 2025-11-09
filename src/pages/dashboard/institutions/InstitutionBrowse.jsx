// frontend/src/pages/dashboard/institutions/InstitutionBrowse.jsx
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchInstitutions } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'

const copy = {
  dharamshala: {
    titleHi: 'धर्मशाला सूची',
    titleEn: 'Dharamshala listings',
    searchHi: 'नाम या शहर से खोजें…',
    searchEn: 'Search by name or city…',
  },
  sanstha: {
    titleHi: 'संस्था सूची',
    titleEn: 'Sanstha listings',
    searchHi: 'नाम या शहर से खोजें…',
    searchEn: 'Search by name or city…',
  },
}

export default function InstitutionBrowse({ kind }) {
  const { lang } = useLang()
  const [query, setQuery] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['institutions', kind], queryFn: () => fetchInstitutions(kind) })
  const labels = copy[kind] || copy.dharamshala

  const filtered = useMemo(() => {
    const list = data || []
    if (!query) return list
    const lower = query.toLowerCase()
    return list.filter((item) => {
      const text = `${item.titleEn} ${item.titleHi} ${item.city} ${item.state}`.toLowerCase()
      return text.includes(lower)
    })
  }, [data, query])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{lang === 'hi' ? labels.titleHi : labels.titleEn}</h2>
          <p className="text-sm text-slate-600">
            {lang === 'hi'
              ? 'यहाँ केवल व्यवस्थापक द्वारा स्वीकृत सूची दिखाई देती है।'
              : 'Only admin-approved listings are visible here.'}
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'hi' ? labels.searchHi : labels.searchEn}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm md:w-64"
        />
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-48 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {lang === 'hi' ? 'कोई सूची उपलब्ध नहीं है।' : 'No listings available yet.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? item.titleHi || item.titleEn : item.titleEn || item.titleHi}</h3>
                <p className="text-sm text-slate-500">{lang === 'hi' ? item.descriptionHi || item.descriptionEn : item.descriptionEn || item.descriptionHi}</p>
              </div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {[item.city, item.state].filter(Boolean).join(', ') || '—'}
              </p>
              {item.contact?.phone && (
                <p className="text-sm text-slate-700">{lang === 'hi' ? 'संपर्क:' : 'Phone:'} {item.contact.phone}</p>
              )}
              {item.contact?.email && (
                <p className="text-sm text-slate-700">{lang === 'hi' ? 'ईमेल:' : 'Email:'} {item.contact.email}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
