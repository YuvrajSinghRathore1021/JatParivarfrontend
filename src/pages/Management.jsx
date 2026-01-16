// frontend/src/pages/Management.jsx
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'
import { makeInitialAvatar } from '../lib/avatar'
import { get } from '../lib/api'
let API_File = import.meta.env.VITE_API_File
const fetchManagement = () => get('/public/people?role=management')

export default function Management() {
  const { lang, makePath } = useLang()
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'people', 'management'],
    queryFn: fetchManagement,
  })

  const cards = useMemo(() => {
    if (!data) return []
    return data.map((person) => ({
      id: person.id || person._id,
      name: person.name,
      title: person.title,
      image: person.photo ? API_File + person.photo: makeInitialAvatar(person.name || 'Leader', { size: 100, radius: 28 }),
      bioEn: person.bioEn,
      bioHi: person.bioHi,
      place: person.place,
    }))
  }, [data])

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {lang === 'hi' ? 'प्रबंधन समिति' : 'Management committee'}
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            {lang === 'hi'
              ? 'जो सदस्य दैनिक संचालन, नीतियों और समुदाय कार्यक्रमों को दिशा देते हैं।'
              : 'Members who direct day-to-day operations, policy, and community programmes.'}
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-48 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-10 text-center text-sm text-slate-500">
            {lang === 'hi' ? 'अभी तक कोई प्रबंधन प्रोफ़ाइल प्रकाशित नहीं है।' : 'No management profiles are published yet.'}
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((profile) => (
              <Link
                key={profile.id}
                to={makePath(`management/${profile.id}`)}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-4 transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={profile.image}
                    alt="image"
                    className="h-16 w-16 rounded-2xl object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 break-words">{profile.name}</h2>
                    {profile.title && (
                      <p className="text-sm font-medium text-blue-600 break-words">{profile.title}</p>
                    )}
                  </div>
                </div>
                {(lang === 'hi' ? profile.bioHi : profile.bioEn) && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang === 'hi' ? profile.bioHi : profile.bioEn}
                  </p>
                )}
                {profile.place && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {lang === 'hi' ? 'प्रमुख क्षेत्र' : 'Focus region'}: {profile.place}
                  </p>
                )}
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
