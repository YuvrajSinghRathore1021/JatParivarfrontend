import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useLang } from '../../../lib/useLang'
import { useSectionRoot } from '../../../lib/useSectionRoot'
import JobBoard from './JobBoard'
import PostJob from './PostJob'
import ManageJobs from './ManageJobs'
import JobDetail from './JobDetail'

function JobsLayout() {
  const { lang } = useLang()
  const root = useSectionRoot('jobs') // "/en/dashboard/jobs" or "/hi/dashboard/jobs"

  const links = [
    { key: 'browse', to: root,               end: true, labelEn: 'Browse openings',    labelHi: 'नौकरी सूची' },
    { key: 'create', to: `${root}/create`,             labelEn: 'Post a job opening',  labelHi: 'नौकरी पोस्ट करें' },
    { key: 'manage', to: `${root}/manage`,             labelEn: 'Manage my postings',  labelHi: 'मेरी पोस्टिंग प्रबंधित करें' },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {lang === 'hi' ? 'नौकरी नेविगेशन' : 'Jobs navigation'}
        </h2>
        <nav className="mt-4 space-y-2" aria-label={lang === 'hi' ? 'नौकरी' : 'Jobs'}>
          {links.map(link => (
            <NavLink
              key={link.key}
              to={link.to}            // absolute, so no double-append
              end={link.end}
              className={({ isActive }) =>
                [
                  'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')
              }
            >
              {lang === 'hi' ? link.labelHi : link.labelEn}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="space-y-6">
        <Outlet />
      </section>
    </div>
  )
}

export default function JobsRoutes() {
  return (
    <Routes>
      <Route element={<JobsLayout />}>
        <Route index element={<JobBoard />} />
        <Route path="create" element={<PostJob />} />
        <Route path="manage" element={<ManageJobs />} />
        <Route path=":jobId" element={<JobDetail />} />
      </Route>
    </Routes>
  )
}
