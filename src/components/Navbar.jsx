import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { currentLangFromPath, switchLangInPath } from '../lib/i18nPath'
import { useLang } from '../lib/useLang'
import { me } from '../lib/auth'
import { makeInitialAvatar } from '../lib/avatar'
let API_File = import.meta.env.VITE_API_File

const navItems = [
  { key: 'home', labelEn: 'Home', labelHi: 'होम', segment: '' },
  { key: 'uddeshay', labelEn: 'Uddeshay', labelHi: 'उद्देश्य', segment: 'uddeshay' },
  { key: 'founders', labelEn: 'Founders', labelHi: 'संस्थापक', segment: 'founders' },
  { key: 'management', labelEn: 'Management', labelHi: 'प्रबंधन', segment: 'management' },
  { key: 'visheshayen', labelEn: 'Highlights', labelHi: 'विशेषताएँ', segment: 'visheshayen' },
  { key: 'history', labelEn: 'History', labelHi: 'इतिहास', segment: 'history' },
  { key: 'news', labelEn: 'Community News', labelHi: 'कम्युनिटी न्यूज़', segment: 'news' },
  { key: 'dharamshalaye', labelEn: 'Dharamshalae', labelHi: 'धर्मशालाएँ', segment: 'dharamshala' },
  { key: 'sansthaye', labelEn: 'Sansthaye', labelHi: 'संस्थाएँ', segment: 'sanstha' },
  { key: 'samajKeGaurav', labelEn: 'Samaj Ke Gaurav', labelHi: 'समाज के गौरव', segment: 'samajKeGaurav' },
]

const externalItems = [
  // { labelEn: 'Jaipur Times', labelHi: 'जयपुर टाइम्स', href: 'https://www.jaipurtimes.org/' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { lang, makePath } = useLang()
  const [avatarError, setAvatarError] = useState(false)

  const { data: meData, isLoading: authLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
    staleTime: 60_000,
    retry: false,
  })
  const user = meData?.user || null

  useEffect(() => {
    setAvatarError(false)
  }, [user?._id, user?.avatarUrl])

  const avatarUrl = useMemo(() => {
    if (!user) return null
    if (avatarError || !user.avatarUrl) {
      return makeInitialAvatar(user.displayName || user.name || user.phone || 'Member', {
        size: 160,
        radius: 60,
      })
    }
    return API_File + user.avatarUrl
  }, [avatarError, user])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);



  const switchLang = (to) => {
    const current = currentLangFromPath(pathname)
    if (to === current) return
    const next = switchLangInPath(pathname, to)
    navigate(next)
    setOpen(false)
  }

  const translate = (item) => (lang === 'hi' ? item.labelHi : item.labelEn)

  const goToDashboard = () => {
    navigate(makePath('dashboard'))
    setOpen(false)
  }

  const renderAuthDesktop = () => {
    if (authLoading) {
      return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse " aria-hidden="true" />
    }
    if (user) {
      return (
        <button
          onClick={goToDashboard}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
          aria-label={lang === 'hi' ? 'डैशबोर्ड खोलें' : 'Open dashboard'}
        >
          <img
            src={avatarUrl}
            alt="Member "
            onError={() => setAvatarError(true)}
            className="h-10 w-10 rounded-full object-cover"
          />
        </button>
      )
    }
    return (
      <Link
        to={makePath('login')}
        className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
      >
        {lang === 'hi' ? 'लॉगिन' : 'Login'}
      </Link>
    )
  }

  const renderAuthMobile = () => {
    if (authLoading) {
      return <div className="ml-auto h-10 w-10 rounded-full bg-gray-200 animate-pulse" aria-hidden="true" />
    }
    if (user) {
      return (
        <button
          onClick={goToDashboard}
          className="ml-auto inline-flex items-center gap-3 rounded-full px-2 py-1 hover:bg-gray-100"
        >
          <span className="sr-only">{lang === 'hi' ? 'डैशबोर्ड खोलें' : 'Open dashboard'}</span>
          <img
            src={avatarUrl}
            alt='Member avatar'
            onError={() => setAvatarError(true)}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-sm font-semibold text-gray-900">
            {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </span>
        </button>
      )
    }
    return (
      <Link
        to={makePath('login')}
        onClick={() => setOpen(false)}
        className="ml-auto inline-flex items-center justify-center px-3 h-10 rounded-lg text-sm font-semibold bg-blue-600 text-white"
      >
        {lang === 'hi' ? 'लॉगिन' : 'Login'}
      </Link>
    )
  }

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition border-b ',
          scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-slate-200' : 'bg-white/90 border-transparent',
        ].join(' ')}
        role="banner"
      >
        {/* Wider container */}
        <div className="mx-auto max-w-[1280px] px-4">
          <div className="h-16 flex items-center justify-between gap-3">
            <Link to={lang === 'hi' ? '/hi' : '/en'} className="flex items-center gap-3 group -ml-2 sm:-ml-4">
              <img
                src="/icons/20251021_1854_Jat Parivar Unity Logo_simple_compose_01k83f0p3behrre80djf6y47aj.png"
                alt="Jat Parivar logo"
                className={['h-30 w-auto transition-transform duration-300 group-hover:scale-105'].join(' ')}
              />
              <span className="sr-only">Jat Parivar</span>
            </Link>

            <nav className="hidden h-16 lg:flex items-center gap-1 flex-1" aria-label="Primary">
              {navItems.map((it) => (
                <NavLink
                  key={it.key}
                  to={makePath(it.segment)}
                  end={it.segment === ''}
                  className={({ isActive }) =>
                    [
                      'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                    ].join(' ')
                  }

                >
                  {translate(it)}
                </NavLink>
              ))}

              {externalItems.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  target="_blank"
                  rel="noopener"
                  className="px-3 py-2 rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-100 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
                >
                  {translate(it)}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => switchLang('en')}
                  className={[
                    'inline-flex items-center justify-center px-3 h-10 text-sm font-semibold transition',
                    lang === 'en' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100',
                  ].join(' ')}
                  aria-pressed={lang === 'en'}
                >
                  EN
                </button>
                <button
                  onClick={() => switchLang('hi')}
                  className={[
                    'inline-flex items-center justify-center px-3 h-10 text-sm font-semibold transition',
                    lang === 'hi' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100',
                  ].join(' ')}
                  aria-pressed={lang === 'hi'}
                >
                  HI
                </button>
              </div>
              {renderAuthDesktop()}
            </div>

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/20"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="3" y="6" width="18" height="2" rx="1" />
                <rect x="3" y="11" width="18" height="2" rx="1" />
                <rect x="3" y="16" width="18" height="2" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={[
          'fixed inset-0 z-50 lg:hidden transition',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        ].join(' ')}
        aria-hidden={!open}
      >
        {/* Background Overlay */}
        <div
          onClick={() => setOpen(false)}
          className={[
            'absolute inset-0 bg-black/40 transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0'
          ].join(' ')}
        />

        {/* Sidebar */}
        <aside
          className={[
            'absolute top-0 right-0 h-full w-[86%] max-w-[360px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out  overflow-y-auto',
            open ? 'translate-x-0' : 'translate-x-full'
          ].join(' ')}
          role="dialog"
          aria-label="Mobile navigation"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between overflow-y-auto">
            <span className="text-lg font-extrabold text-gray-900">Jat Parivar</span>

            <button
              onClick={() => setOpen(false)}
              className="h-9 w-9 grid place-items-center rounded-md hover:bg-gray-100 "
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.4 5l12.6 12.6-1.4 1.4L5 6.4 6.4 5z" />
                <path d="M18.6 5L6 17.6l-1.4-1.4L17.2 3.6 18.6 5z" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4" aria-label="Mobile">
            <ul className="space-y-1">
              {navItems.map((it) => (
                <li key={it.key}>
                  <Link
                    to={makePath(it.segment)}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-100"
                  >
                    {translate(it)}
                  </Link>
                </li>
              ))}

              {externalItems.map((it) => (
                <li key={it.href}>
                  <a
                    href={it.href}
                    target="_blank"
                    rel="noopener"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-100"
                  >
                    {translate(it)}
                  </a>
                </li>
              ))}
            </ul>

            {/* Buttons */}
            <div className="mt-4 border-t border-gray-200 pt-4 flex items-center gap-2">
              <button
                onClick={() => switchLang('en')}
                className={[
                  'inline-flex items-center justify-center px-3 h-10 rounded-lg text-sm font-semibold',
                  lang === 'en' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
                ].join(' ')}
              >
                EN
              </button>

              <button
                onClick={() => switchLang('hi')}
                className={[
                  'inline-flex items-center justify-center px-3 h-10 rounded-lg text-sm font-semibold',
                  lang === 'hi' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
                ].join(' ')}
              >
                HI
              </button>

              {renderAuthMobile()}
            </div>
          </nav>
        </aside>
      </div>


      <div className="h-16" />
    </>
  )
}
