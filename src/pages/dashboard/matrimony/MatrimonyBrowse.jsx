// frontend/src/pages/dashboard/matrimony/MatrimonyBrowse.jsx
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLang } from '../../../lib/useLang'
import { Link } from 'react-router-dom'
import { useGeoOptions } from '../../../hooks/useGeoOptions'
import {
  fetchMatrimonyProfiles,
  fetchMatrimonyInterests,
  sendMatrimonyInterest,
} from '../../../lib/dashboardApi'
import { makeInitialAvatar } from '../../../lib/avatar'
let API_File = import.meta.env.VITE_API_File

const normalizeOccupationKey = (value) => {
  const v = String(value || '').trim()
  if (!v) return ''
  if (v === 'govt') return 'government_job'
  if (v === 'private') return 'private_job'
  return v
}

const OCCUPATION_OPTIONS = {
  en: [
    { value: 'government_job', label: 'Government Job' },
    { value: 'private_job', label: 'Private Job' },
    { value: 'business', label: 'Business' },
    { value: 'student', label: 'Student' },
  ],
  hi: [
    { value: 'government_job', label: 'सरकारी नौकरी' },
    { value: 'private_job', label: 'प्राइवेट नौकरी' },
    { value: 'business', label: 'व्यवसाय' },
    { value: 'student', label: 'छात्र' },
  ],
}

const sortOptions = [
  { value: 'recent', labelEn: 'Recently updated', labelHi: 'हाल ही में अपडेट' },
  { value: 'age-asc', labelEn: 'Age (low to high)', labelHi: 'आयु (कम से अधिक)' },
  { value: 'age-desc', labelEn: 'Age (high to low)', labelHi: 'आयु (अधिक से कम)' },
]

export default function MatrimonyBrowse() {
  const { lang } = useLang()
  const [sort, setSort] = useState('recent')
  const [nameQuery, setNameQuery] = useState('')
  const [designationQuery, setDesignationQuery] = useState('')
  const [departmentQuery, setDepartmentQuery] = useState('')
  const [occupationQuery, setOccupationQuery] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [cityCode, setCityCode] = useState('')
  const [addressQuery, setAddressQuery] = useState('')
  const [keywordQuery, setKeywordQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
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

  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(
    stateCode,
    districtCode,
    lang,
  )

  const sortedProfiles = useMemo(() => profiles || [], [profiles])

  const filteredProfiles = useMemo(() => {
    const list = sortedProfiles
    const nameQ = nameQuery.trim().toLowerCase()
    const desgQ = designationQuery.trim().toLowerCase()
    const deptQ = departmentQuery.trim().toLowerCase()
    const occQ = normalizeOccupationKey(occupationQuery)
    const addrQ = addressQuery.trim().toLowerCase()
    const keyQ = keywordQuery.trim().toLowerCase()

    if (!nameQ && !desgQ && !deptQ && !occQ && !stateCode && !districtCode && !cityCode && !addrQ && !keyQ) return list

    return list.filter((profile) => {
      const user = profile.user || {}
      const nameText = `${profile.name || ''} ${user.displayName || ''} ${user.name || ''}`.toLowerCase()
      const designationText = `${profile.designation || ''} ${user.designation || ''}`.toLowerCase()
      const departmentText = `${profile.department || ''} ${user.department || ''}`.toLowerCase()

      const cur = profile.location || profile.currentAddress || {}
      const locationText = `${cur.city || ''} ${cur.district || ''} ${cur.state || ''}`.toLowerCase()

      const occ = profile.occupationAddress || {}
      const par = profile.parentalAddress || {}
      const addressText = `${cur.village || ''} ${cur.city || ''} ${cur.district || ''} ${cur.state || ''} ${occ.village || ''} ${occ.city || ''} ${occ.district || ''} ${occ.state || ''} ${par.village || ''} ${par.city || ''} ${par.district || ''} ${par.state || ''}`.toLowerCase()

      const normalizedOccupation = normalizeOccupationKey(profile.occupation || user.occupation)
      const occupationText = `${normalizedOccupation} ${(profile.occupation || '')} ${(user.occupation || '')}`.toLowerCase()
      const keywordText = `${nameText} ${designationText} ${departmentText} ${occupationText} ${locationText} ${addressText} ${(profile.gotra?.self || '').toLowerCase()}`.toLowerCase()

      if (nameQ && !nameText.includes(nameQ)) return false
      if (desgQ && !designationText.includes(desgQ)) return false
      if (deptQ && !departmentText.includes(deptQ)) return false

      if (occQ && normalizedOccupation !== occQ) return false

      if (stateCode) {
        if (cur.stateCode) {
          if (cur.stateCode !== stateCode) return false
        } else {
          const sel = states.find((s) => s.code === stateCode)
          if (!sel?.name?.en || String(cur.state || '').trim() !== sel.name.en) return false
        }
      }

      if (districtCode) {
        if (cur.districtCode) {
          if (cur.districtCode !== districtCode) return false
        } else {
          const sel = districts.find((d) => d.code === districtCode)
          if (!sel?.name?.en || String(cur.district || '').trim() !== sel.name.en) return false
        }
      }

      if (cityCode) {
        if (cur.cityCode) {
          if (cur.cityCode !== cityCode) return false
        } else {
          const sel = cities.find((c) => c.code === cityCode)
          if (!sel?.name?.en || String(cur.city || '').trim() !== sel.name.en) return false
        }
      }

      if (addrQ && !addressText.includes(addrQ)) return false
      if (keyQ && !keywordText.includes(keyQ)) return false
      return true
    })
  }, [sortedProfiles, nameQuery, designationQuery, departmentQuery, occupationQuery, stateCode, districtCode, cityCode, addressQuery, keywordQuery, states, districts, cities])

  const total = filteredProfiles.length
  const canGoNext = page * pageSize < total
  const pagedProfiles = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProfiles.slice(start, start + pageSize)
  }, [filteredProfiles, page, pageSize])

  function urlmake(item) {
    return `/${lang}/dashboard/matrimony/${item.id}`;
  }

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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'नाम' : 'Name'}</span>
            <input
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'नाम लिखें' : 'Enter name'}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पद' : 'Designation'}</span>
            <input
              value={designationQuery}
              onChange={(e) => setDesignationQuery(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'पद लिखें' : 'Enter designation'}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'विभाग' : 'Department'}</span>
            <input
              value={departmentQuery}
              onChange={(e) => setDepartmentQuery(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'विभाग लिखें' : 'Enter department'}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'राज्य' : 'State'}</span>
            <select
              value={stateCode}
              onChange={(e) => {
                setStateCode(e.target.value)
                setDistrictCode('')
                setCityCode('')
                setPage(1)
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            >
              <option value="">{lang === 'hi' ? 'राज्य चुनें' : 'Select State'}</option>
              {stateOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'ज़िला' : 'District'}</span>
            <select
              value={districtCode}
              onChange={(e) => {
                setDistrictCode(e.target.value)
                setCityCode('')
                setPage(1)
              }}
              disabled={!stateCode}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white disabled:bg-slate-50"
            >
              <option value="">{lang === 'hi' ? 'ज़िला चुनें' : 'Select District'}</option>
              {districtOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'शहर' : 'City'}</span>
            <select
              value={cityCode}
              onChange={(e) => {
                setCityCode(e.target.value)
                setPage(1)
              }}
              disabled={!districtCode}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white disabled:bg-slate-50"
            >
              <option value="">{lang === 'hi' ? 'शहर चुनें' : 'Select City'}</option>
              {cityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'व्यवसाय' : 'Occupation'}</span>
            <select
              value={occupationQuery}
              onChange={(e) => {
                setOccupationQuery(e.target.value)
                setPage(1)
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            >
              <option value="">{lang === 'hi' ? 'व्यवसाय चुनें' : 'Select Occupation'}</option>
              {(lang === 'hi' ? OCCUPATION_OPTIONS.hi : OCCUPATION_OPTIONS.en).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पता' : 'Address'}</span>
            <input
              value={addressQuery}
              onChange={(e) => {
                setAddressQuery(e.target.value)
                setPage(1)
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'गाँव/पता' : 'Village/address'}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'कीवर्ड' : 'Keyword'}</span>
            <input
              value={keywordQuery}
              onChange={(e) => {
                setKeywordQuery(e.target.value)
                setPage(1)
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'सभी में खोजें' : 'Search all fields'}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setNameQuery('')
              setDesignationQuery('')
              setDepartmentQuery('')
              setOccupationQuery('')
              setStateCode('')
              setDistrictCode('')
              setCityCode('')
              setAddressQuery('')
              setKeywordQuery('')
              setPage(1)
            }}
            className="rounded-2xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            {lang === 'hi' ? 'रीसेट' : 'Reset'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-48 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {sortedProfiles.length === 0
            ? lang === 'hi'
              ? 'अभी कोई विवाह प्रोफ़ाइल उपलब्ध नहीं है।'
              : 'No matrimony profiles are available yet.'
            : lang === 'hi'
              ? 'कोई परिणाम नहीं मिला।'
              : 'No results found.'}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
            <div>
              <span>
                {lang === 'hi' ? 'कुल' : 'Total'}: <span className="font-semibold text-slate-900">{total}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                {lang === 'hi' ? 'प्रति पृष्ठ' : 'Rows'}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value) || 10)
                    setPage(1)
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  {lang === 'hi' ? 'पिछला' : 'Prev'}
                </button>
                <span className="text-sm text-slate-600">
                  {lang === 'hi' ? 'पेज' : 'Page'} <span className="font-semibold text-slate-900">{page}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!canGoNext}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  {lang === 'hi' ? 'अगला' : 'Next'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
          {pagedProfiles.map((profile) => {
            const user = profile.user || {}
            const avatar = API_File + profile?.photos?.[0] || API_File + user.avatarUrl || makeInitialAvatar(profile?.name || user.displayName || 'Member', { size: 96, radius: 28 })
            const interested = user.id ? likedSet.has(user.id) : false
            return (
              <article key={profile.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <Link to={urlmake(profile)}>
                  <header className="flex items-center gap-4">
                    <img src={avatar} alt="image" className="h-14 w-14 rounded-2xl object-cover shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 text-wrap-anywhere line-clamp-1">
                        {profile?.name || user.displayName || (lang === 'hi' ? 'सदस्य' : 'Member')}
                      </h3>
                      <p className="text-sm text-slate-500 text-wrap-anywhere line-clamp-1">{profile.age ? `${profile.age} ${lang === 'hi' ? 'वर्ष' : 'years'}` : '—'}</p>
                    </div>
                  </header>
                  <dl className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'गोत्र' : 'Gotra'}</dt>
                      <dd className="text-wrap-anywhere line-clamp-1">{profile.gotra?.self || '—'}</dd>
                    </div>

                    <div>
                      <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'लंबाई' : 'Height'}</dt>
                      <dd className="text-wrap-anywhere line-clamp-1">{profile.height || '—'}</dd>
                    </div>

                    <div>
                      <dt className="font-semibold text-slate-500 uppercase tracking-wide">{lang === 'hi' ? 'स्थान' : 'Location'}</dt>
                      <dd className="text-wrap-anywhere line-clamp-1">
                        {[profile.location?.city, profile.location?.state].filter(Boolean).join(', ') || '—'}
                      </dd>
                    </div>
                  </dl>
                </Link>
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
        </>
      )}
    </div>
  )
}
