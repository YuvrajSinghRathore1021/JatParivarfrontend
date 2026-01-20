// frontend/src/pages/Management.jsx
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'
import { makeInitialAvatar } from '../lib/avatar'
import { get } from '../lib/api'
let API_File = import.meta.env.VITE_API_File

const OCCUPATION_LABELS = {
  govt: 'Government job',
  government_job: 'Government job',
  private: 'Private job',
  private_job: 'Private job',
  business: 'Business',
  student: 'Student'
}

const EDUCATION_LABELS = {
  high_school: 'High school',
  graduate: 'Graduate',
  postgraduate: 'Postgraduate',
  phd: 'PhD'
}

const fetchManagement = () => get('/public/people?role=management')

export default function Management() {
  const { lang, makePath } = useLang()
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'people', 'management'],
    queryFn: fetchManagement,
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
        occupation: OCCUPATION_LABELS[person.occupation || user.occupation] || person.occupation || user.occupation || '',
        education: EDUCATION_LABELS[person.education || user.education] || person.education || user.education || '',
        location: formatLocation(primaryAddress) || person.place || '',
        image: person.photo ? API_File + person.photo : makeInitialAvatar(person.name || 'Leader', { size: 100, radius: 28 }),
        phone: user.phone,
        contactEmail: user.contactEmail,
      }
    })
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
                className="group rounded-3xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={profile.image}
                    alt="image"
                    className="h-16 w-16 rounded-2xl object-cover shrink-0 bg-slate-100"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = makeInitialAvatar(profile.name || 'Member', { size: 100, radius: 28 })
                    }}
                  />
                  <div className="min-w-0 space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900 break-words group-hover:text-blue-600 transition">
                      {profile.name}
                    </h2>
                    {profile.designation && (
                      <p className="text-sm font-medium text-blue-600 break-words">{profile.designation}</p>
                    )}
                    {(profile.department || profile.location) && (
                      <p className="text-xs text-slate-600 break-words">
                        {[profile.department, profile.location].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>

                {(profile.phone || profile.contactEmail) && (
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {profile.phone && <span className="flex items-center gap-1">📞 {profile.phone}</span>}
                    {profile.contactEmail && (
                      <span className="flex items-center gap-1 truncate">✉️ {profile.contactEmail}</span>
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
