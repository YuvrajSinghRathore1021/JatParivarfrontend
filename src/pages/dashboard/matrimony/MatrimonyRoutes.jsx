import { NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useLang } from '../../../lib/useLang'
import MatrimonyBrowse from './MatrimonyBrowse'
import MatrimonyProfileForm from './MatrimonyProfileForm'
import MatrimonyInterests from './MatrimonyInterests'

/**
 * Returns the absolute base path up to and including a route segment.
 * Example: if pathname is "/hi/dashboard/matrimony/profile",
 * useSectionRoot('matrimony') -> "/hi/dashboard/matrimony"
 */
function useSectionRoot(segment) {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const idx = parts.indexOf(segment)
  // Fallback: if segment isn’t found (e.g. first render), return pathname without trailing slash
  const base = idx >= 0 ? '/' + parts.slice(0, idx + 1).join('/') : pathname.replace(/\/$/, '')
  return base
}

function MatrimonyLayout() {
  const { lang } = useLang()
  const root = useSectionRoot('matrimony') // -> "/en/dashboard/matrimony" or "/hi/dashboard/matrimony"

  const links = [
    { key: 'browse',    to: root,                end: true,  labelEn: 'Browse profiles',          labelHi: 'प्रोफ़ाइल देखें' },
    { key: 'profile',   to: `${root}/profile`,               labelEn: 'Create or update profile', labelHi: 'प्रोफ़ाइल बनाएँ / अपडेट करें' },
    { key: 'interests', to: `${root}/interests`,             labelEn: 'Matrimony interests',      labelHi: 'विवाह रुचियाँ' },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {lang === 'hi' ? 'नेविगेशन' : 'Navigation'}
        </h2>

        <nav className="mt-4 space-y-2" aria-label={lang === 'hi' ? 'विवाह' : 'Matrimony'}>
          {links.map((link) => (
            <NavLink
              key={link.key}
              to={link.to}         // absolute path (never duplicates)
              end={link.end}       // only the index pill matches exactly
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

export default function MatrimonyRoutes() {
  return (
    <Routes>
      <Route element={<MatrimonyLayout />}>
        <Route index element={<MatrimonyBrowse />} />
        <Route path="profile" element={<MatrimonyProfileForm />} />
        <Route path="interests" element={<MatrimonyInterests />} />
      </Route>
    </Routes>
  )
}
