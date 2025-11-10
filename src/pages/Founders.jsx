import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'
import { makeInitialAvatar } from '../lib/avatar'
import { get } from '../lib/api'
let API_File = import.meta.env.VITE_API_File

const fetchFounders = () => get('/public/people?role=founder')

export default function Founders() {
  const { lang, makePath } = useLang()
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'people', 'founder'],
    queryFn: fetchFounders,
  })

  const cards = useMemo(() => {
    if (!data) return []
    return data.map((person) => ({
      id: person.id || person._id,
      name: person.name,
      title: person.title,
      image: person.photo ? API_File + person.photo : makeInitialAvatar(person.name || 'Founder', { size: 100, radius: 28 }),
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
            {lang === 'hi' ? 'संस्थापक मंडल' : 'Founder council'}
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            {lang === 'hi'
              ? 'जिन सदस्यों ने ₹1,01,000 या उससे अधिक योगदान दिया है और समुदाय के परिवर्तन को आगे बढ़ाया है।'
              : 'Members who have contributed ₹1,01,000 or more and actively guide community transformation.'}
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-44 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-10 text-center text-sm text-slate-500">
            {lang === 'hi' ? 'अभी तक कोई संस्थापक प्रोफ़ाइल प्रकाशित नहीं है।' : 'No founder profiles are published yet.'}
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {cards.map((profile) => (
              <Link
                key={profile.id}
                to={makePath(`founders/${profile.id}`)}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex gap-5 items-start transition hover:border-blue-200 hover:shadow-md"
              >
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-20 w-20 rounded-2xl object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">{profile.name}</h2>
                  {profile.title && (
                    <p className="text-sm font-medium text-blue-600">{profile.title}</p>
                  )}
                  {profile.place && (
                    <p className="text-xs uppercase tracking-wide text-slate-400">{profile.place}</p>
                  )}
                  {(lang === 'hi' ? profile.bioHi : profile.bioEn) && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {lang === 'hi' ? profile.bioHi : profile.bioEn}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
