import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'
import { makeInitialAvatar } from '../lib/avatar'
import { get } from '../lib/api'
import { getOccupationLabel, getEducationLabel } from '../constants/profileOptions'
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
    return data.map((person) => {
      const user = person?.user || {}
      const primaryAddress =
        person?.currentAddress ||
        user?.currentAddress ||
        person?.occupationAddress ||
        user?.occupationAddress ||
        person?.parentalAddress ||
        user?.parentalAddress

      return {
        id: person.id || person._id,
        name: person.name,
        designation: person.designation || user.designation || person.title,
        department: person.department || user.department || '',
        occupation: getOccupationLabel(person.occupation || user.occupation, lang),
        education: getEducationLabel(person.education || user.education, lang),
        location: formatLocation(primaryAddress) || person.place || '',
        image: person.photo ? API_File + person.photo : makeInitialAvatar(person.name || 'Founder', { size: 100, radius: 28 }),
        phone: user.phone || null,
        contactEmail: user.contactEmail,
      }
    })
  }, [data, lang])

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {lang === 'hi' ? 'संस्थापक मंडल' : 'Founder council'}
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            {lang === 'hi'
              ? 'समुदाय के परिवर्तन में मार्गदर्शन करने वाले प्रमुख सदस्य।'
              : 'Key members who actively guide community transformation.'}
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

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((profile) => (
              <Link
                key={profile.id}
                to={makePath(`founders/${profile.id}`)}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <img
                    src={profile.image}
                    alt="image"
                    className="h-20 w-20 rounded-2xl object-cover shrink-0 bg-slate-100"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = makeInitialAvatar(profile.name || 'Member', { size: 100, radius: 28 })
                    }}
                  />

                  {/* Content */}
                  <div className="flex-1 space-y-1 break-words">
                    <h2 className=" break-words text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition break-all line-clamp-2">
                      {profile.name}
                    </h2>

                    {profile.designation && (
                      <p className="text-sm font-medium text-blue-600 break-words">
                        {profile.designation}
                      </p>
                    )}

                    {(profile.department || profile.location) && (
                      <p className="text-xs text-slate-600 break-words">
                        {[profile.department, profile.location].filter(Boolean).join(' • ')}
                      </p>
                    )}


                  </div>
                </div>


                {/* Contact row */}
                {(profile.phone || profile.contactEmail) && (
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        📞 {profile.phone}
                      </span>
                    )}
                    {profile.contactEmail && (
                      <span className="flex items-center gap-1 truncate">
                        ✉️ {profile.contactEmail}
                      </span>
                    )}

                  </div>
                )}
              </Link>
            ))}
          </section>

        )}
      </div>
    </main>
  )
}

function formatLocation(addr) {
  if (!addr || typeof addr !== 'object') return ''
  const parts = [addr.city, addr.district, addr.state].filter(Boolean)
  return parts.join(', ')
}
