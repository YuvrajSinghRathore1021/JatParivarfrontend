// frontend/src/pages/people/PersonDetail.jsx
import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../lib/api'
import { useLang } from '../../lib/useLang'
import { makeInitialAvatar } from '../../lib/avatar'
let API_File = import.meta.env.VITE_API_File
const fetchPerson = (id) => get(`/public/people/${id}`)

export default function PersonDetail() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const { lang, makePath } = useLang()

  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'person', personId],
    queryFn: () => fetchPerson(personId),
    enabled: Boolean(personId),
  })

  const person = data || null
  const member = person?.user || person?.userId || null
  const phone = member?.phone || member?.alternatePhone || '—'
  const email = member?.contactEmail || member?.email || '—'
  const occupation = member?.occupation || '—'
  const organisation = member?.company || '—'
  const address = member?.address || {}
  const addressEntries = [
    { key: 'line1', labelEn: 'Address line 1', labelHi: 'पता पंक्ति 1', value: address.line1 || '—' },
    { key: 'line2', labelEn: 'Address line 2', labelHi: 'पता पंक्ति 2', value: address.line2 || '—' },
    { key: 'city', labelEn: 'City', labelHi: 'शहर', value: address.city || '—' },
    { key: 'district', labelEn: 'District', labelHi: 'ज़िला', value: address.district || '—' },
    { key: 'state', labelEn: 'State', labelHi: 'राज्य', value: address.state || '—' },
  ]
  const image = useMemo(() => {
    if (!person) return null
if (person.photo) return API_File + person.photo
    const fallbackName =
      person.name ||
      member?.displayName ||
      member?.name ||
      member?.phone ||
      'Member'
    return makeInitialAvatar(fallbackName, { size: 120, radius: 36 })
  }, [member?.displayName, member?.name, member?.phone, person])

  const backToList = () => {
    if (person?.role === 'management') {
      navigate(makePath('management'))
    } else {
      navigate(makePath('founders'))
    }
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
              alt={person.name}
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-500/20"
            />
          </div>

          <div className="pt-20 pl-1 space-y-2">
  <h1 className="text-3xl font-extrabold text-slate-900">{person.name}</h1>

            {(person.title || person.designation) && (
              <p className="text-lg font-semibold text-blue-600">
                {person.title || person.designation}
              </p>
            )}

            {(person.place || member?.address?.city) && (
              <p className="text-sm text-slate-600">
                {person.place || member?.address?.city}
              </p>
            )}
          </div>

          {/* CONTACT GRID */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoTile labelEn="Phone" labelHi="फ़ोन" lang={lang} value={phone} />
            <InfoTile labelEn="Email" labelHi="ईमेल" lang={lang} value={email} />
            <InfoTile labelEn="Occupation" labelHi="व्यवसाय" lang={lang} value={occupation} />
            <InfoTile labelEn="Organisation" labelHi="संस्था/कंपनी" lang={lang} value={organisation} />
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

        {/* ROLE DETAILS */}
        <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {lang === "hi" ? "भूमिका विवरण" : "Role details"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoTile
              labelEn="Designation"
              labelHi="पदनाम"
              lang={lang}
              value={person.designation || person.title || "—"}
            />

            <InfoTile
              labelEn="Focus region"
              labelHi="मुख्य क्षेत्र"
              lang={lang}
              value={person.place || member?.address?.district || "—"}
            />
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

        {/* PUBLIC NOTE */}
        {person.publicNote && (
          <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {lang === "hi" ? "संदेश" : "Community note"}
            </h2>
            <p className="text-slate-700 leading-relaxed">{person.publicNote}</p>
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
