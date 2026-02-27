import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../lib/api'
import { useLang } from '../../lib/useLang'
import { makeInitialAvatar } from '../../lib/avatar'
import { getOccupationLabel, getEducationLabel } from '../../constants/profileOptions'

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
  const phone = member?.phone || member?.alternatePhone || ''
  const email = member?.contactEmail || person?.email || '—'
  const occupation = getOccupationLabel(person?.occupation || member?.occupation, lang) || '—'
  const designation = person?.designation || member?.designation || person?.title || '—'
  const education = getEducationLabel(person?.education || member?.education, lang) || '—'
  const department = person?.department || member?.department || '—'

  const primaryAddress =
    person?.currentAddress ||
    member?.currentAddress ||
    person?.occupationAddress ||
    member?.occupationAddress ||
    person?.parentalAddress ||
    member?.parentalAddress
  const location = formatLocation(primaryAddress) || person?.place || member?.address?.city || '—'

  const addressEntries = [
    {
      key: 'currentAddress',
      labelEn: 'Current Address',
      labelHi: 'वर्तमान पता',
      value: formatLocation(person?.currentAddress || member?.currentAddress)
    },
    {
      key: 'parentalAddress',
      labelEn: 'Parental Address',
      labelHi: 'पैतृक पता',
      value: formatLocation(person?.parentalAddress || member?.parentalAddress)
    },
    {
      key: 'occupationAddress',
      labelEn: 'Occupation Address',
      labelHi: 'कार्यस्थल का पता',
      value: formatLocation(person?.occupationAddress || member?.occupationAddress)
    }
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

  const infoTiles = [
    phone ? { key: 'phone', labelEn: 'Phone', labelHi: 'फ़ोन', value: phone } : null,
    { key: 'email', labelEn: 'Email', labelHi: 'ईमेल', value: email },
    { key: 'occupation', labelEn: 'Occupation', labelHi: 'व्यवसाय', value: occupation },
    { key: 'education', labelEn: 'Education', labelHi: 'शिक्षा', value: education },
    { key: 'department', labelEn: 'Department', labelHi: 'डिपार्टमेंट', value: department },
    { key: 'designation', labelEn: 'Designation', labelHi: 'पद नाम', value: designation },
  ].filter(Boolean)

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
            <section className="rounded-3xl bg-white shadow-md border border-slate-200 p-6 relative">
              <div className="absolute -top-16 left-6">
                <img
                  src={image}
                  alt="image"
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-500/20"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    const fallbackName = person?.name || member?.displayName || member?.name || member?.phone || 'Member'
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

                {location && location !== '—' && (
                  <p className="text-sm text-slate-600">
                    {location}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {infoTiles.map((tile) => (
                  <InfoTile key={tile.key} labelEn={tile.labelEn} labelHi={tile.labelHi} lang={lang} value={tile.value} />
                ))}
              </div>
            </section>

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

            <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {lang === "hi" ? "संदेश" : "Message"}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoTile
                  labelEn="Message"
                  labelHi="संदेश"
                  lang={lang}
                  value={person?.message || "—"}
                />
              </div>
            </section>

            {person?.adimage && (
              <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {lang === "hi" ? "संगठन" : "Organisation"}
                </h2>
                <div className="overflow-hidden rounded-2xl border">
                  <img
                    src={API_File + person.adimage}
                    alt="Organisation"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = makeInitialAvatar(person.name || 'Org', { size: 320, radius: 18 })
                    }}
                  />
                </div>
              </section>
            )}

            {person.bioEn && (
              <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Short description (English)
                </h2>
                <p className="text-slate-700 leading-relaxed">{person.bioEn}</p>
              </section>
            )}

            {person.bioHi && (
              <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">संक्षिप्त विवरण (हिंदी)</h2>
                <p className="text-slate-700 leading-relaxed">{person.bioHi}</p>
              </section>
            )}

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

function formatLocation(addr) {
  if (!addr || typeof addr !== 'object') return '—'
  const parts = [addr.city, addr.district, addr.state].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

function InfoTile({ labelEn, labelHi, value, lang }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {lang === "hi" ? labelHi : labelEn}
      </p>
      <p
        className="mt-1 text-sm text-slate-800 leading-snug"
        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
        title={typeof value === "string" ? value : undefined}
      >
        {value || "—"}
      </p>
    </div>
  )
}
