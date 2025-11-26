// frontend/src/pages/dashboard/jobs/JobBoard.jsx
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchJobs, applyToJob } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'

export default function JobBoard() {
  const { lang } = useLang()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['jobs', 'public'], queryFn: fetchJobs })

  const applyMutation = useMutation({ mutationFn: ({ jobId, payload }) => applyToJob(jobId, payload) })

  const filtered = useMemo(() => {
    const list = data || []
    return list.filter((job) => {
      const matchesType = typeFilter ? job.type === typeFilter : true
      const text = `${job.title} ${job.description} ${job.locationCity} ${job.locationDistrict} ${job.locationState}`.toLowerCase()
      const matchesSearch = search ? text.includes(search.toLowerCase()) : true
      return matchesType && matchesSearch
    })
  }, [data, search, typeFilter])

  const onApply = (jobId, event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      coverLetter: form.get('coverLetter') || '',
      expectedSalary: form.get('expectedSalary') || '',
    }
    applyMutation.mutate({ jobId, payload })
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
        <div className="space-y-4">
          {filtered.map((job) => {
            const isExpanded = expanded === job.id
            const applied = applyMutation.isSuccess && applyMutation.variables?.jobId === job.id
            return (
              <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{job.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                      {(() => {
                        const parts = [job.locationCity, job.locationDistrict, job.locationState].filter(Boolean)
                        return parts.length ? parts.join(', ') : '—'
                      })()}
                    </p>
                    {job.salaryRange && (
                      <p className="text-xs font-semibold text-slate-500">
                        {lang === 'hi' ? 'वेतन सीमा:' : 'Salary:'} {job.salaryRange}
                      </p>
                    )}
                  </div>
                  {!job.applied &&(
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => (prev === job.id ? null : job.id))}
                    className="self-start rounded-2xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:border-blue-300"
                  >
                    {isExpanded
                      ? lang === 'hi'
                        ? 'आवेदन फॉर्म छिपाएँ'
                        : 'Hide apply form'
                      : lang === 'hi'
                      ? 'आवेदन करें'
                      : 'Apply now'}
                  </button>
                  )}
                </div>

                {isExpanded && (
                  <form className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={(event) => onApply(job.id, event)}>
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
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
