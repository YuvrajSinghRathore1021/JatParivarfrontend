import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useLang } from '../../../lib/useLang'
import { useSectionRoot } from '../../../lib/useSectionRoot'
import InstitutionBrowse from './InstitutionBrowse'
import InstitutionForm from './InstitutionForm'
import InstitutionManage from './InstitutionManage'

const labels = {
  dharamshala: {
    nav: {
      browseEn: 'Dharamshala listings', browseHi: 'धर्मशाला सूची',
      createEn: 'Add Dharamshala',      createHi: 'धर्मशाला जोड़ें',
      manageEn: 'Manage submissions',   manageHi: 'सबमिशन प्रबंधित करें',
    },
    segment: 'dharamshalaye',
  },
  sanstha: {
    nav: {
      browseEn: 'Sanstha listings',     browseHi: 'संस्था सूची',
      createEn: 'Add Sanstha',          createHi: 'संस्था जोड़ें',
      manageEn: 'Manage submissions',   manageHi: 'सबमिशन प्रबंधित करें',
    },
    segment: 'sansthaye',
  },
}

function InstitutionLayout({ kind }) {
  const { lang } = useLang()
  const meta = labels[kind] || labels.dharamshala
  const root = useSectionRoot(meta.segment) // "/hi/dashboard/dharamshalaye" etc.

  const links = [
    { key: 'browse', to: root,                 end: true, labelEn: meta.nav.browseEn, labelHi: meta.nav.browseHi },
    { key: 'create', to: `${root}/create`,               labelEn: meta.nav.createEn, labelHi: meta.nav.createHi },
    { key: 'manage', to: `${root}/manage`,               labelEn: meta.nav.manageEn, labelHi: meta.nav.manageHi },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {lang === 'hi' ? 'नेविगेशन' : 'Navigation'}
        </h2>
        <nav className="mt-4 space-y-2" aria-label={lang === 'hi' ? 'सूची' : 'Listings'}>
          {links.map(link => (
            <NavLink
              key={link.key}
              to={link.to}      // absolute link
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

export default function InstitutionRoutes({ kind }) {
  return (
    <Routes>
      <Route element={<InstitutionLayout kind={kind} />}>
        <Route index element={<InstitutionBrowse kind={kind} />} />
        <Route path="create" element={<InstitutionForm kind={kind} />} />
        <Route path="manage" element={<InstitutionManage kind={kind} />} />
      </Route>
    </Routes>
  )
}
