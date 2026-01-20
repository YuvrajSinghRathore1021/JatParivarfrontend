import { useLocation, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchJobs } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'

const formatAddress = (job) => {
  const parts = [job?.locationVillage, job?.locationCity, job?.locationDistrict, job?.locationState].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

export default function JobDetail() {
  const { jobId } = useParams()
  const location = useLocation()
  const { lang } = useLang()

  const { data } = useQuery({ queryKey: ['jobs', 'public'], queryFn: fetchJobs })
  const list = data || []

  const fallbackJob = list.find((j) => j.id === jobId)
  const job = location.state?.job || fallbackJob

  if (!job) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        {lang === 'hi' ? 'नौकरी विवरण नहीं मिला।' : 'Job not found.'}
        <div className="mt-3">
          <Link to="../" className="text-blue-600 underline">
            {lang === 'hi' ? 'सूची पर वापस जाएँ' : 'Back to list'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 break-words">{job.title}</h1>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {lang === 'hi' ? 'नौकरी प्रकार' : 'Job type'}: {job.type?.replace('_', ' ') || '—'}
            </span>
            {job.salaryRange && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {lang === 'hi' ? 'वेतन' : 'Salary'}: {job.salaryRange}
              </span>
            )}
          </div>
        </div>
        <Link to="../" className="text-blue-600 underline text-sm">
          {lang === 'hi' ? 'सूची पर वापस जाएँ' : 'Back to list'}
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? 'विवरण' : 'Description'}</h2>
        <p className="text-sm text-slate-700 whitespace-pre-wrap break-all">
          {job.description || '—'}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? 'स्थान' : 'Location'}</h2>
        <p className="text-sm text-slate-700">{formatAddress(job)}</p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {job.locationState && <span className="rounded-full bg-slate-100 px-3 py-1">{job.locationState}</span>}
          {job.locationDistrict && <span className="rounded-full bg-slate-100 px-3 py-1">{job.locationDistrict}</span>}
          {job.locationCity && <span className="rounded-full bg-slate-100 px-3 py-1">{job.locationCity}</span>}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? 'विवरण' : 'Details'}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label={lang === 'hi' ? 'वेतन सीमा' : 'Salary range'} value={job.salaryRange || '—'} />
          <Info label={lang === 'hi' ? 'संपर्क फोन' : 'Contact phone'} value={job.contactPhone || '—'} />
          <Info label={lang === 'hi' ? 'प्रकाशित तिथि' : 'Posted on'} value={job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'} />
          <Info label={lang === 'hi' ? 'अपडेटेड' : 'Updated'} value={job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : '—'} />
        </div>
      </section>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="text-sm text-slate-700">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="mt-1 break-words">{value}</div>
    </div>
  )
}
