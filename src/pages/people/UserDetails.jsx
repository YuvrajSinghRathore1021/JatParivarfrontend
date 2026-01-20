// // // frontend/src/pages/people/UserDetails.jsx
import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../lib/api'
import { useLang } from '../../lib/useLang'
import { makeInitialAvatar } from '../../lib/avatar'
let API_File = import.meta.env.VITE_API_File
const fetchPerson = (id) => get(`/public/user/${id}`)

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

export default function UserDetails() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const { lang, makePath } = useLang()

  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'person', personId],
    queryFn: () => fetchPerson(personId),
    enabled: Boolean(personId),
  })

  const person = data?.person || null
  const phone = person?.phone || person?.alternatePhone || '—'
  const email = person?.contactEmail || person?.email || '—'
  const occupation = OCCUPATION_LABELS[person?.occupation] || person?.occupation || '—'
  const designation = person?.designation || person?.title || '—'
  const educationRaw = person?.education?.highestQualification || person?.education
  const education = EDUCATION_LABELS[educationRaw] || educationRaw || '—'
  const department = person?.department || '—'

  const addressEntries = [
  {
    key: 'currentAddress',
    labelEn: 'Current Address',
    labelHi: 'वर्तमान पता',
    value: person?.currentAddress
      ? [
          person.currentAddress.village,
          person.currentAddress.city,
          person.currentAddress.district,
          person.currentAddress.state,
          person.currentAddress.pincode
        ].filter(Boolean).join(', ')
      : '—'
  },
  {
    key: 'parentalAddress',
    labelEn: 'Parental Address',
    labelHi: 'पैतृक पता',
    value: person?.parentalAddress
      ? [
          person.parentalAddress.village,
          person.parentalAddress.city,
          person.parentalAddress.district,
          person.parentalAddress.state,
          person.parentalAddress.pincode
        ].filter(Boolean).join(', ')
      : '—'
  },
  {
    key: 'occupationAddress',
    labelEn: 'Occupation Address',
    labelHi: 'कार्यस्थल का पता',
    value: person?.occupationAddress
      ? [
          person.occupationAddress.village,
          person.occupationAddress.city,
          person.occupationAddress.district,
          person.occupationAddress.state,
          person.occupationAddress.pincode
        ].filter(Boolean).join(', ')
      : '—'
  }
]
  const image = useMemo(() => {
    if (!person) return null
    if (person.photo) return API_File + person.photo
    const fallbackName =
      person.name ||
      person?.displayName ||
      person?.phone ||
      'Member'
    return makeInitialAvatar(fallbackName, { size: 120, radius: 36 })
  }, [person?.displayName, person?.name, person?.phone, person])

  const backToList = () => {
    navigate(makePath('dashboard/found'))
  }

  return (
    <main className="bg-slate-50 pb-20">
      <div className="relative w-full h-56 md:h-64 lg:h-72 bg-slate-200 overflow-hidden ">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/0"></div>


        {person?.bannerUrl ? (
          <img
            src={API_File + person.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />

        ) : (

          <div className="w-full h-full bg-gradient-to-r from-slate-200 to-slate-300" />

        )}
        <div className="absolute top-4 left-4">
          <button
            onClick={backToList}
            className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 
           bg-white/60 hover:bg-white/90 border border-white/40 
           rounded-full text-sm font-medium text-slate-700 shadow-md 
           backdrop-blur-md transition-all hover:-translate-y-0.5"
          >
            <span className="text-lg">←</span>
            {lang === "hi" ? "सूची पर वापस जाएं" : "Back to list"}
          </button>

        </div>
      </div>

      {/* PROFILE CARD WRAPPER */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">

        {isLoading ? (
          <div className="h-48 rounded-3xl bg-white shadow-sm animate-pulse" />
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {lang === "hi"
              ? "प्रोफ़ाइल लोड करने में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।"
              : "We could not load this profile. Please try again later."}
          </div>
        ) : person ? (
          <article className="space-y-6">

            {/* PROFILE HEADER CARD */}
            <section className="rounded-3xl bg-white shadow-md border border-slate-200 p-6 relative">

              {/* PROFILE PHOTO */}
              <div className="absolute -top-16 left-6">
                <img
                  src={image}
                  alt="image"
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-500/20"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    const fallbackName = person?.name || person?.displayName || person?.phone || 'Member'
                    e.currentTarget.src = makeInitialAvatar(fallbackName, { size: 120, radius: 36 })
                  }}
                />
              </div>

              <div className="pt-20 pl-1 space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 break-words">{person.name}</h1>

                {(person.title || person.designation) && (
                  <p className="text-lg font-semibold text-blue-600 break-words">
                    {person.title || person.designation}
                  </p>
                )}

                {(person.place || person?.currentAddress?.city) && (
                  <p className="text-sm text-slate-600">
                    {person.place || person?.currentAddress?.city}
                  </p>
                )}
              </div>

              {/* CONTACT GRID */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoTile labelEn="Phone" labelHi="फ़ोन" lang={lang} value={phone} />
                <InfoTile labelEn="Email" labelHi="ईमेल" lang={lang} value={email} />
                <InfoTile labelEn="Occupation" labelHi="व्यवसाय" lang={lang} value={occupation} />
                <InfoTile labelEn="Education" labelHi="शिक्षा" lang={lang} value={education} />
                <InfoTile labelEn="Department" labelHi="डिपार्टमेंट" lang={lang} value={department} />
                <InfoTile labelEn="Designation" labelHi="पद नाम" lang={lang} value={designation} />
              </div>
            </section>

            {/* ADDRESS */}
            <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {lang === "hi" ? "पता" : "Address"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {addressEntries.map((entry) => (
                  <InfoTile
                    key={entry.key}
                    labelEn={entry.labelEn}
                    labelHi={entry.labelHi}
                    lang={lang}
                    value={entry.value}
                  />
                ))}
              </div>
            </section>

            {/* BIO ENGLISH */}
            {person.bioEn && (
              <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Short description (English)
                </h2>
                <p className="text-slate-700 leading-relaxed">{person.bioEn}</p>
              </section>
            )}

            {/* BIO HINDI */}
            {person.bioHi && (
              <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">संक्षिप्त विवरण (हिंदी)</h2>
                <p className="text-slate-700 leading-relaxed">{person.bioHi}</p>
              </section>
            )}

          </article>
        ) : (
          <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-800">
            {lang === "hi" ? "यह प्रोफ़ाइल उपलब्ध नहीं है।" : "This profile is not available."}
          </div>
        )}
      </div>
    </main>

  )
}

function InfoTile({ labelEn, labelHi, value, lang }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {lang === 'hi' ? labelHi : labelEn}
      </p>
      <p className="mt-1 text-sm text-slate-800">{value || '—'}</p>
    </div>
  )
}
