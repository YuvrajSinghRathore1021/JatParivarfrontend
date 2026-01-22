import { useMemo, useState, useEffect } from 'react'
import { useLang } from '../lib/useLang'
import { Link } from 'react-router-dom'
import { makeInitialAvatar } from '../lib/avatar'
import { get, patch } from '../lib/api'
import { useGeoOptions } from '../hooks/useGeoOptions'
import { useGotraOptions } from '../hooks/useGotraOptions'
import NumberRequestButton from './NumberRequestButton'

const API_File = import.meta.env.VITE_API_File

const fetchFounders = async (params) => {
  const qs = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    qs.set(key, String(value))
  })
  return get(`/found/foundpeople?${qs.toString()}`)
}

export default function Found() {
  const { lang, makePath } = useLang()

  const [stateCode, setStateCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [cityCode, setCityCode] = useState('')
  const [gotra, setGotra] = useState('')
  const [occupation, setOccupation] = useState('')
  const [name, setName] = useState('')
  const [designation, setDesignation] = useState('')
  const [department, setDepartment] = useState('')
  const [address, setAddress] = useState('')
  const [search, setSearch] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [applied, setApplied] = useState({
    stateCode: '',
    districtCode: '',
    cityCode: '',
    gotra: '',
    occupation: '',
    name: '',
    designation: '',
    department: '',
    address: '',
    search: '',
  })

  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [incomingRequests, setIncomingRequests] = useState([])
  const [approvalModal, setApprovalModal] = useState(false)

  const { stateOptions, districtOptions, cityOptions } = useGeoOptions(stateCode, districtCode, lang)
  const { gotraOptions: gotraChoices } = useGotraOptions(lang)

  const loadFounders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchFounders({
        page,
        pageSize,
        state: applied.stateCode || undefined,
        district: applied.districtCode || undefined,
        city: applied.cityCode || undefined,
        gotra: applied.gotra || undefined,
        occupation: applied.occupation || undefined,
        name: applied.name || undefined,
        designation: applied.designation || undefined,
        department: applied.department || undefined,
        address: applied.address || undefined,
        search: applied.search || undefined,
      })
      setData(res?.data || [])
      setMeta(res?.meta || null)
    } catch (err) {
      setError(err?.message || 'Failed to load list')
      setData([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFounders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, applied])

  const loadIncomingRequests = async () => {
    const res = await get('/found/request/incoming')
    setIncomingRequests(res || [])
  }

  useEffect(() => {
    loadIncomingRequests().catch(() => {})
  }, [])

  const handleRequestDecision = async (reqId, decision) => {
    const res = await patch(`/found/request/approve/${reqId}`, { decision })
    if (res?.success) {
      setIncomingRequests((prev) => prev.filter((r) => r._id !== reqId))
      alert(`Request ${decision}`)
    }
  }

  const OCCUPATION = {
    en: [
      { value: 'government_job', label: 'Government job' },
      { value: 'private_job', label: 'Private job' },
      { value: 'business', label: 'Business' },
      { value: 'student', label: 'Student' },
    ],
    hi: [
      { value: 'government_job', label: 'सरकारी नौकरी' },
      { value: 'private_job', label: 'निजी नौकरी' },
      { value: 'business', label: 'व्यवसाय' },
      { value: 'student', label: 'छात्र' },
    ],
  }

  const cards = useMemo(() => {
    const OCC_LABELS = {
      government_job: lang === 'hi' ? 'सरकारी नौकरी' : 'Government job',
      private_job: lang === 'hi' ? 'निजी नौकरी' : 'Private job',
      business: lang === 'hi' ? 'व्यवसाय' : 'Business',
      student: lang === 'hi' ? 'छात्र' : 'Student',
    }

    return (data || []).map((p) => {
      const addr = p.currentAddress || p.occupationAddress || p.parentalAddress || {}
      return {
        id: p.id,
        name: p.name,
        designation: p.designation || '',
        department: p.department || '',
        image: p.avatarUrl ? API_File + p.avatarUrl : makeInitialAvatar(p.name || 'Member', { size: 100, radius: 28 }),
        state: addr.state || '',
        district: addr.district || '',
        city: addr.city || '',
        gotra: p.gotra?.self || '',
        occupation: OCC_LABELS[p.occupation] || p.occupation || '',
      }
    })
  }, [data, lang])

  const canGoNext = meta?.total != null ? page * pageSize < meta.total : true

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{lang === 'hi' ? 'सदस्य खोजें' : 'Find members'}</h2>
          <p className="text-sm text-slate-600">
            {lang === 'hi'
              ? 'नाम, पद, विभाग, स्थान और पते के आधार पर खोजें।'
              : 'Search by name, designation, department, location, and address.'}
          </p>
        </div>

        <button
          onClick={() => {
            setApprovalModal(true)
            loadIncomingRequests().catch(() => {})
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
        >
          {lang === 'hi' ? 'नंबर रिक्वेस्ट' : 'Number Requests'}
          {incomingRequests.length > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 text-xs font-bold">
              {incomingRequests.length}
            </span>
          )}
        </button>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'नाम' : 'Name'}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'नाम लिखें' : 'Enter name'}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पद' : 'Designation'}</span>
            <input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'पद लिखें' : 'Enter designation'}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'विभाग' : 'Department'}</span>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'विभाग लिखें' : 'Enter department'}
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पता' : 'Address'}</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'गाँव/पता' : 'Village/address'}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2"
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
            className="rounded-xl border border-slate-200 px-3 py-2"
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
            className="rounded-xl border border-slate-200 px-3 py-2"
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

          <select className="rounded-xl border border-slate-200 px-3 py-2" value={gotra} onChange={(e) => setGotra(e.target.value)}>
            <option value="">{lang === 'hi' ? 'गोत्र' : 'Gotra'}</option>
            {gotraChoices.map((g, i) => (
              <option key={i} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 px-3 py-2"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          >
            <option value="">{lang === 'hi' ? 'व्यवसाय' : 'Occupation'}</option>
            {(lang === 'hi' ? OCCUPATION.hi : OCCUPATION.en).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'कीवर्ड खोज' : 'Keyword search'}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setStateCode('')
              setDistrictCode('')
              setCityCode('')
              setGotra('')
              setOccupation('')
              setName('')
              setDesignation('')
              setDepartment('')
              setAddress('')
              setSearch('')
              setApplied({
                stateCode: '',
                districtCode: '',
                cityCode: '',
                gotra: '',
                occupation: '',
                name: '',
                designation: '',
                department: '',
                address: '',
                search: '',
              })
              setPage(1)
            }}
            className="rounded-2xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            {lang === 'hi' ? 'रीसेट' : 'Reset'}
          </button>
          <button
            type="button"
            onClick={() => {
              setApplied({
                stateCode,
                districtCode,
                cityCode,
                gotra,
                occupation,
                name,
                designation,
                department,
                address,
                search,
              })
              setPage(1)
            }}
            className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            {lang === 'hi' ? 'खोजें' : 'Search'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-40 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {lang === 'hi' ? 'कोई परिणाम नहीं मिला।' : 'No results found.'}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
            <div>
              {meta?.total != null ? (
                <span>
                  {lang === 'hi' ? 'कुल' : 'Total'}: <span className="font-semibold text-slate-900">{meta.total}</span>
                </span>
              ) : null}
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

          <section className="grid gap-4 md:grid-cols-2">
            {cards.map((p) => (
              <Link
                key={p.id}
                to={makePath(`/dashboard/found/${p.id}`)}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex gap-5">
                  <img
                    src={p.image}
                    alt="image"
                    className="h-20 w-20 rounded-2xl object-cover bg-slate-100"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = makeInitialAvatar(p.name || 'Member', { size: 100, radius: 28 })
                    }}
                  />

                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900 break-words line-clamp-2">{p.name}</h3>

                    {(p.designation || p.department) && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-blue-700">{p.designation}</span>
                        {p.designation && p.department ? ' • ' : ''}
                        <span className="text-slate-600">{p.department}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-700">
                      {p.gotra ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {lang === 'hi' ? 'गोत्र' : 'Gotra'}: {p.gotra}
                        </span>
                      ) : null}
                      {p.occupation ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {lang === 'hi' ? 'व्यवसाय' : 'Occupation'}: {p.occupation}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {lang === 'hi' ? 'स्थान' : 'Location'}: {[p.city, p.district, p.state].filter(Boolean).join(', ') || '—'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <NumberRequestButton receiverId={p.id} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </>
      )}

      {approvalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800">{lang === 'hi' ? 'लंबित रिक्वेस्ट' : 'Pending Requests'}</h2>

            {incomingRequests.length === 0 ? (
              <p className="text-center text-slate-600 py-4">{lang === 'hi' ? 'कोई लंबित अनुरोध नहीं है।' : 'No pending requests.'}</p>
            ) : (
              incomingRequests.map((r) => (
                <div key={r._id} className="border rounded-xl p-4 mb-3 flex items-center gap-4">
                  <img src={r.senderId?.avatarUrl ? API_File + r.senderId.avatarUrl : makeInitialAvatar(r.senderId?.name || 'Member', { size: 48, radius: 24 })} alt="image" className="w-12 h-12 rounded-full object-cover border" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{r.senderId?.name}</p>
                    <p className="text-sm text-slate-600">{lang === 'hi' ? 'आपका नंबर देखना चाहता है' : 'wants to view your number'}</p>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleRequestDecision(r._id, 'approved')} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                        {lang === 'hi' ? 'स्वीकृत' : 'Approve'}
                      </button>
                      <button onClick={() => handleRequestDecision(r._id, 'rejected')} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                        {lang === 'hi' ? 'अस्वीकृत' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => {
                setApprovalModal(false)
                loadFounders()
              }}
              className="mt-4 w-full py-2 bg-slate-200 rounded-xl font-medium"
            >
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
