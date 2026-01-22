// frontend/src/pages/dashboard/institutions/InstitutionBrowse.jsx

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchInstitutions } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'
import { Link } from 'react-router-dom'
import { useGeoOptions } from '../../../hooks/useGeoOptions'

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

export default function InstitutionBrowse({ kind, web = false }) {
  const { lang } = useLang()
  const [query, setQuery] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [cityCode, setCityCode] = useState('')
  const [address, setAddress] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = useQuery({ queryKey: ['institutions', kind], queryFn: () => fetchInstitutions(kind) })
  const labels = copy[kind] || copy.dharamshala

  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(stateCode, districtCode, lang)
  const stateNameEn = states.find((s) => s.code === stateCode)?.name?.en || ''
  const districtNameEn = districts.find((d) => d.code === districtCode)?.name?.en || ''
  const cityNameEn = cities.find((c) => c.code === cityCode)?.name?.en || ''

  const filtered = useMemo(() => {
    const list = data || []
    const q = query.trim().toLowerCase()
    const addrQ = address.trim().toLowerCase()

    return list.filter((item) => {
      if (stateCode && stateNameEn) {
        if ((item.state || '').toLowerCase() !== stateNameEn.toLowerCase()) return false
      }
      if (districtCode && districtNameEn) {
        if ((item.district || '').toLowerCase() !== districtNameEn.toLowerCase()) return false
      }
      if (cityCode && cityNameEn) {
        if ((item.city || '').toLowerCase() !== cityNameEn.toLowerCase()) return false
      }

      if (q) {
        const text = `${item.titleEn} ${item.titleHi} ${item.businessEn} ${item.businessHi} ${item.descriptionEn} ${item.descriptionHi} ${item.city} ${item.district} ${item.state}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      if (addrQ) {
        const text = `${item.addressEn} ${item.addressHi} ${item.city} ${item.district} ${item.state}`.toLowerCase()
        if (!text.includes(addrQ)) return false
      }

      return true
    })
  }, [data, query, address, stateCode, districtCode, cityCode, stateNameEn, districtNameEn, cityNameEn])

  const total = filtered.length
  const canGoNext = page * pageSize < total
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  function urlmake(item) {
    if (kind == "dharamshala" && web == false) {
      return `/${lang}/dashboard/dharamshalaye/${item._id}`;
    } else if (kind == "sanstha" && web == false) {
      return `/${lang}/dashboard/sansthaye/${item._id}`;
    }
    if (kind == "dharamshala" && web == true) {
      return `/${lang}/dharamshala/${item._id}`;
    } else if (kind == "sanstha" && web == true) {
      return `/${lang}/sanstha/${item._id}`;
    }
    return;
  }
  // mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-10
  return (

    <div className={web == true ? 'mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-10' : 'space-y-6'}>

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{lang === 'hi' ? labels.titleHi : labels.titleEn}</h2>
          <p className="text-sm text-slate-600">
            {lang === 'hi' ? 'यहाँ केवल व्यवस्थापक द्वारा स्वीकृत सूची दिखाई देती है।' : 'Only admin-approved listings are visible here.'}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'hi' ? labels.searchHi : labels.searchEn}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm md:w-64"
          />
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setStateCode('')
              setDistrictCode('')
              setCityCode('')
              setAddress('')
              setPage(1)
            }}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            {lang === 'hi' ? 'रीसेट' : 'Reset'}
          </button>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={stateCode}
            onChange={(e) => {
              setStateCode(e.target.value)
              setDistrictCode('')
              setCityCode('')
            }}
          >
            <option value="">{lang === 'hi' ? 'राज्य' : 'State'}</option>
            {stateOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={districtCode}
            disabled={!stateCode}
            onChange={(e) => {
              setDistrictCode(e.target.value)
              setCityCode('')
            }}
          >
            <option value="">{lang === 'hi' ? 'जिला' : 'District'}</option>
            {districtOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={cityCode}
            disabled={!districtCode}
            onChange={(e) => setCityCode(e.target.value)}
          >
            <option value="">{lang === 'hi' ? 'शहर' : 'City'}</option>
            {cityOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={lang === 'hi' ? 'पता / लोकेशन' : 'Address / location'}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <p className="text-xs text-slate-500">
          {lang === 'hi'
            ? 'उन्नत खोज: नाम, व्यवसाय (संस्था), शहर/जिला/राज्य और पते से फ़िल्टर करें।'
            : 'Advanced search: filter by name, business (sanstha), city/district/state, and address.'}
        </p>
      </div>

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

        <div className={`grid gap-4 md:grid-cols-2 ${web ? '' : ''}`}>
          {paged.map((item) => (
            <article
              key={item._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
                <Link to={urlmake(item)} className="block space-y-3">

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 text-wrap-anywhere line-clamp-2">
                    {lang === 'hi'
                      ? item.titleHi || item.titleEn
                      : item.titleEn || item.titleHi}
                  </h3>

                  {/* Business (if sanstha) */}
                  {kind === "sanstha" && (
                    <p className="text-sm text-slate-600 text-wrap-anywhere line-clamp-2">
                      <span className="font-medium">
                        {lang === 'hi' ? 'व्यवसाय:' : 'Business:'}
                      </span>{' '}
                      {lang === 'hi'
                        ? item?.businessHi || item?.businessEn
                        : item?.businessEn || item?.businessHi}
                    </p>
                  )}

                  {/* Description / Long Text (IMPORTANT FIX) */}
                  {(item.descriptionEn || item.descriptionHi) && (
                    <p className="text-sm text-slate-700 text-wrap-anywhere overflow-hidden line-clamp-4 whitespace-pre-wrap">
                      {lang === 'hi' ? item.descriptionHi || item.descriptionEn : item.descriptionEn || item.descriptionHi}
                    </p>
                  )}

                  {/* Location */}
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {[item.city, item.state].filter(Boolean).join(', ') || '—'}
                  </p>

                  {/* Contact */}
                  <div className="pt-2 space-y-1 text-sm text-slate-700">
                    {item.contact?.phone && (
                      <p>
                        <span className="font-medium">
                          {lang === 'hi' ? 'संपर्क:' : 'Phone:'}
                        </span>{' '}
                        {item.contact.phone}
                      </p>
                    )}

                    {item.contact?.email && (
                      <p className="break-all">
                        <span className="font-medium">
                          {lang === 'hi' ? 'ईमेल:' : 'Email:'}
                        </span>{' '}
                        {item.contact.email}
                      </p>
                    )}
                  </div>

                  {/* Read more hint */}
                  <span className="inline-block pt-2 text-sm font-medium text-blue-600">
                    {lang === 'hi' ? 'और देखें →' : 'View details →'}
                  </span>

                </Link>
              </article>
            ))}
          </div>

        </>
      )}
    </div>

  )
}
