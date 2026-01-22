

// frontend/src/pages/dashboard/jobs/JobBoard.jsx
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJobs, applyToJob } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'
import { Link } from 'react-router-dom'
import { useGeoOptions } from '../../../hooks/useGeoOptions'

export default function JobBoard() {
  const { lang } = useLang()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [cityCode, setCityCode] = useState('')
  const [addressQuery, setAddressQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openApply, setOpenApply] = useState(null)

  const { stateOptions, districtOptions, cityOptions } = useGeoOptions(stateCode, districtCode, lang)


  // 🔹 Fetch jobs
  const { data, isLoading } = useQuery({
    queryKey: ['jobs', 'public'],
    queryFn: fetchJobs,
  })

  // 🔹 Apply job + auto refresh
  const applyMutation = useMutation({
    mutationFn: ({ jobId, payload }) => applyToJob(jobId, payload),
    onSuccess: () => {
      qc.invalidateQueries(['jobs', 'public']) // ✅ refresh list
      setOpenApply(null) // close form
    },
  })

  // 🔹 Filter jobs
  const filtered = useMemo(() => {
    const list = data || []
    return list.filter((job) => {
      const matchesType = typeFilter ? job.type === typeFilter : true
      const matchesState = stateCode ? job.locationStateCode === stateCode : true
      const matchesDistrict = districtCode ? job.locationDistrictCode === districtCode : true
      const matchesCity = cityCode ? job.locationCityCode === cityCode : true
      const matchesAddress = addressQuery
        ? `${job.locationVillage || ''} ${job.locationCity || ''} ${job.locationDistrict || ''} ${job.locationState || ''}`
          .toLowerCase()
          .includes(addressQuery.toLowerCase())
        : true
      const text = `${job.title} ${job.description} ${job.locationVillage} ${job.locationCity} ${job.locationDistrict} ${job.locationState}`.toLowerCase()
      const matchesSearch = search ? text.includes(search.toLowerCase()) : true
      return matchesType && matchesState && matchesDistrict && matchesCity && matchesAddress && matchesSearch
    })
  }, [data, search, typeFilter, stateCode, districtCode, cityCode, addressQuery])

  const total = filtered.length
  const canGoNext = page * pageSize < total
  const pagedJobs = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  // 🔹 Submit handler
  const onApply = (jobId, event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    applyMutation.mutate({
      jobId,
      payload: {
        coverLetter: form.get('coverLetter') || '',
        expectedSalary: form.get('expectedSalary') || '',
      },
    })
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {lang === 'hi' ? 'समुदाय नौकरी अवसर' : 'Community job openings'}
          </h2>
          <p className="text-sm text-slate-600">
            {lang === 'hi'
              ? 'केवल स्वीकृत नौकरी पोस्टिंग यहाँ दिखती हैं। आवेदन करने पर पोस्ट करने वाले सदस्य को सूचना मिलेगी।'
              : 'Only admin-approved postings appear here. Applying notifies the poster instantly.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'खोजें…' : 'Search…'}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-64"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-48"
          >
            <option value="">{lang === 'hi' ? 'सभी प्रकार' : 'All types'}</option>
            <option value="full_time">{lang === 'hi' ? 'पूर्णकालिक' : 'Full time'}</option>
            <option value="part_time">{lang === 'hi' ? 'अंशकालिक' : 'Part time'}</option>
            <option value="contract">{lang === 'hi' ? 'कॉन्ट्रैक्ट' : 'Contract'}</option>
            <option value="internship">{lang === 'hi' ? 'इंटर्नशिप' : 'Internship'}</option>
          </select>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
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
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'पता / गाँव' : 'Address / village'}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setStateCode('')
              setDistrictCode('')
              setCityCode('')
              setAddressQuery('')
              setSearch('')
              setTypeFilter('')
              setPage(1)
            }}
            className="rounded-2xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            {lang === 'hi' ? 'रीसेट' : 'Reset'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-40 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {lang === 'hi' ? 'कोई नौकरी पोस्टिंग उपलब्ध नहीं है।' : 'No job postings are available right now.'}
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

          <div className="space-y-4">
          {pagedJobs.map((job) => {
            const applied = applyMutation.isSuccess && applyMutation.variables?.jobId === job.id
            return (
              <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 break-words">{job.title}</h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                      <Info label={lang === 'hi' ? 'नौकरी प्रकार' : 'Job type'} value={job.type?.replace('_',' ') || '—'} />
                      <Info label={lang === 'hi' ? 'वेतन सीमा' : 'Salary'} value={job.salaryRange || '—'} />
                      <Info label={lang === 'hi' ? 'संपर्क फोन' : 'Contact phone'} value={job.contactPhone || '—'} />
                      <Info label={lang === 'hi' ? 'पता' : 'Address'} value={job.locationVillage || '—'} />
                      <Info label={lang === 'hi' ? 'राज्य' : 'State'} value={job.locationState || '—'} />
                      <Info label={lang === 'hi' ? 'ज़िला' : 'District'} value={job.locationDistrict || '—'} />
                      <Info label={lang === 'hi' ? 'शहर' : 'City'} value={job.locationCity || '—'} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={job.id}
                      state={{ job }}
                      className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 w-full sm:w-auto text-center"
                    >
                      {lang === 'hi' ? 'पूरा विवरण' : 'Open detail'}
                    </Link>

                    {!job.applied && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenApply((prev) => (prev === job.id ? null : job.id))
                        }
                        className="rounded-2xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:border-blue-300"
                      >
                        {openApply === job.id
                          ? lang === 'hi'
                            ? 'फॉर्म बंद करें'
                            : 'Hide form'
                          : lang === 'hi'
                            ? 'आवेदन करें'
                            : 'Apply now'}
                      </button>
                    )}
                  </div>

                  {openApply === job.id && (
                    <form
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4"
                      onSubmit={(event) => onApply(job.id, event)}
                    >
                      <label className="block text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'संक्षिप्त परिचय' : 'Cover letter'}</span>
                        <textarea name="coverLetter" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      </label>
                      <label className="block text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'अपेक्षित वेतन' : 'Expected salary'}</span>
                        <input name="expectedSalary" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      </label>
                      <button
                        type="submit"
                        disabled={applyMutation.isPending}
                        className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {applyMutation.isPending
                          ? lang === 'hi'
                            ? 'भेजा जा रहा है...'
                            : 'Submitting...'
                          : lang === 'hi'
                            ? 'आवेदन भेजें'
                            : 'Submit application'}
                      </button>
                      {applied && (
                        <p className="text-sm text-blue-600">
                          {lang === 'hi'
                            ? 'आपका आवेदन भेज दिया गया है। सदस्य आपसे संपर्क करेगा।'
                            : 'Your application has been shared with the poster.'}
                        </p>
                      )}
                      {applyMutation.isError && (
                        <p className="text-sm text-red-600">
                          {lang === 'hi' ? 'आवेदन भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Failed to submit application. Please try again.'}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </article>
            )
          })}
        </div>
        </>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="text-sm text-slate-700">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 break-words break-all font-semibold">{value}</div>
    </div>
  )
}
