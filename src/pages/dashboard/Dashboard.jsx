// frontend/src/pages/dashboard/Dashboard.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { me, logout } from '../../lib/auth'
import { makeInitialAvatar } from '../../lib/avatar'
import { useLang } from '../../lib/useLang'
import { switchLangInPath } from '../../lib/i18nPath'
import Overview from './Overview'
import MatrimonyRoutes from './matrimony/MatrimonyRoutes'
import JobsRoutes from './jobs/JobsRoutes'
import InstitutionRoutes from './institutions/InstitutionRoutes'
import ProfileEditor from './profile/ProfileEditor'

const navItems = [
  { key: 'overview', labelEn: 'Overview', labelHi: 'अवलोकन', to: 'dashboard' },
  { key: 'matrimony', labelEn: 'Matrimony', labelHi: 'विवाह सेवा', to: 'dashboard/matrimony' },
  { key: 'jobs', labelEn: 'Jobs', labelHi: 'नौकरियाँ', to: 'dashboard/jobs' },
  { key: 'dharamshalaye', labelEn: 'Dharamshalae', labelHi: 'धर्मशालाएँ', to: 'dashboard/dharamshalaye' },
  { key: 'sansthaye', labelEn: 'Sansthaye', labelHi: 'संस्थाएँ', to: 'dashboard/sansthaye' },
  { key: 'profile', labelEn: 'Profile', labelHi: 'व्यक्तिगत विवरण', to: 'dashboard/profile' },
]

function DashboardTopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, makePath } = useLang()
  const qc = useQueryClient()
  const { data: meData } = useQuery({ queryKey: ['auth', 'me'], queryFn: me, staleTime: 60_000 })
  const user = meData?.user || null
  const [avatarError, setAvatarError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.clear()
      navigate(makePath('login'), { replace: true })
    },
  })

  useEffect(() => {
    setAvatarError(false)
    setMenuOpen(false)
  }, [user?.avatarUrl, user?._id])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onClick = (event) => {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [menuOpen])

  const fallbackAvatar = useMemo(() => {
    if (!user) return null
    return makeInitialAvatar(user.displayName || user.name || user.phone || 'Member', { size: 80, radius: 24 })
  }, [user])

  const avatar = !user ? null : avatarError || !user.avatarUrl ? fallbackAvatar : user.avatarUrl

  const translate = (item) => (lang === 'hi' ? item.labelHi : item.labelEn)

  const switchLang = (to) => {
    if (to === lang) return
    const next = switchLangInPath(location.pathname, to)
    navigate(next)
  }

  const menuItems = [
    {
      key: 'profile',
      label: lang === 'hi' ? 'प्रोफ़ाइल देखें' : 'Open profile',
      action: () => {
        navigate(makePath('dashboard/profile'))
        setMenuOpen(false)
      },
    },
    user?.referralCode
      ? {
        key: 'referral',
        label: `${lang === 'hi' ? 'रेफ़रल कोड' : 'Referral code'}: ${user.referralCode}`,
        action: () => { },
        muted: true,
      }
      : null,
    {
      key: 'logout',
      label: logoutMutation.isPending
        ? lang === 'hi'
          ? 'लॉगआउट…'
          : 'Logging out…'
        : lang === 'hi'
          ? 'लॉगआउट'
          : 'Log out',
      action: () => {
        logoutMutation.mutate()
        setMenuOpen(false)
      },
      danger: true,
      disabled: logoutMutation.isPending,
    },
  ].filter(Boolean)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);


  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to={lang === 'hi' ? '/hi' : '/en'} className="flex items-center gap-3 group -ml-2 sm:-ml-4">
          <img
            src="/icons/20251021_1854_Jat Parivar Unity Logo_simple_compose_01k83f0p3behrre80djf6y47aj.png"
            alt="Jat Parivar logo"
            className={['h-30 w-auto', 'transition-transform duration-300 group-hover:scale-105'].join(' ')}
          />
          <span className="sr-only">Jat Parivar</span>
        </Link>

        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-2 md:flex" aria-label="Dashboard">
          {navItems.map((item) => {
            const to = makePath(item.to)
            return (
              <NavLink
                key={item.key}
                to={to}
                end={item.key === 'overview'}
                className={({ isActive }) =>
                  [
                    'inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive || (item.key !== 'overview' && location.pathname.startsWith(to))
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                {translate(item)}
              </NavLink>
            )
          })}
        </nav>


        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {lang === 'hi' ? 'स्वागत है' : 'Welcome back'}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {user?.displayName || user?.name || user?.phone || 'Member'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
            <button
              type="button"
              onClick={() => switchLang('en')}
              className={[
                'rounded-full px-2 py-1 transition',
                lang === 'en' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100',
              ].join(' ')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => switchLang('hi')}
              className={[
                'rounded-full px-2 py-1 transition',
                lang === 'hi' ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-100',
              ].join(' ')}
              aria-pressed={lang === 'hi'}
            >
              HI
            </button>
          </div>

          {avatar && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/50"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <img
                  src={avatar}
                  alt={user?.displayName || 'Member avatar'}
                  onError={() => setAvatarError(true)}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </button>


              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-lg"
                >
                  <div className="mb-3 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {lang === 'hi' ? 'सदस्य' : 'Signed in as'}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user?.displayName || user?.name || user?.phone}
                    </p>
                    {user?.referralCode && (
                      <p className="mt-1 text-xs text-slate-500">
                        {lang === 'hi' ? 'आपका रेफ़रल कोड' : 'Your referral code'}: {user.referralCode}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-1" role="none">
                    {menuItems.map((item) => (
                      <li key={item.key} role="none">
                        <button
                          type="button"
                          onClick={item.action}
                          role="menuitem"
                          disabled={item.disabled}
                          className={[
                            'w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition',
                            item.muted
                              ? 'cursor-default bg-slate-50 text-slate-500'
                              : item.danger
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-slate-700 hover:bg-slate-100',
                            item.disabled ? 'cursor-not-allowed opacity-60' : '',
                          ].join(' ')}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {logoutMutation.isError && (
                    <p className="mt-3 text-xs text-red-600">{lang === 'hi' ? 'लॉगआउट विफल रहा' : 'Failed to log out'}</p>
                  )}
                </div>
              )}

            </div>

          )}
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>

      </div>
      {/* Mobile Drawer */}
      <div
        className={`fixed  inset-y-0 right-0 z-50 w-64 h-90 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${+mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <span className="text-lg font-semibold">{lang === 'hi' ? 'मेनू' : 'Menu'}</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
            ✕
          </button>
        </div>

        <nav className="flex flex-col h-full gap-2 p-4 bg-white">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={makePath(item.to)}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                [
                  'block rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-slate-900 text-white shadow-sm ' : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')
              }
            >
              {translate(item)}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Background overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 +bg-black md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}


    </header>
  )
}

function DashboardShell() {
  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardTopBar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-500 sm:px-6">
          <span>© {new Date().getFullYear()} Jat Parivar</span>
          <span>{' '}Community powered services</span>
        </div>
      </footer>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Routes>
      <Route element={<DashboardShell />}>
        <Route index element={<Overview />} />
        <Route path="matrimony/*" element={<MatrimonyRoutes />} />
        <Route path="jobs/*" element={<JobsRoutes />} />
        <Route path="dharamshalaye/*" element={<InstitutionRoutes kind="dharamshala" />} />
        <Route path="sansthaye/*" element={<InstitutionRoutes kind="sanstha" />} />
        <Route path="profile" element={<ProfileEditor />} />
        <Route path="*" element={<Navigate to="." replace />} />

      </Route>
    </Routes>
  )
}
