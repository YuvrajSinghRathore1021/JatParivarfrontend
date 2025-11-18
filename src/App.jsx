// frontend/src/App.jsx
import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ScrollToTop from './components/ScrollToTop.jsx'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Uddeshay from './pages/Uddeshay'
import Founders from './pages/Founders'
import Management from './pages/Management'
import Visheshayen from './pages/Visheshayen'
import History from './pages/History'
import News from './pages/News'
import NewsArticle from './pages/news/NewsArticle.jsx'
import Login from './pages/auth/Login'
import ForgetPassword from './pages/auth/ForgetPassword'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import MatrimonyBrowse from './pages/matrimony/Browse'
import JobsIndex from './pages/jobs/JobsIndex'
import Dharamshalaye from './pages/Dharamshalaye'
import Sansthaye from './pages/Sansthaye'
import Subscriptions from './pages/Subscriptions'
import PersonDetail from './pages/people/PersonDetail'
import SamajKeGaurav from './pages/people/Samaj ke gorav.jsx'
import { useLang, DEFAULT_LANG, SUPPORTED_LANGS } from './lib/useLang'
import i18n from './i18n'
import AdminApp from './admin/AdminApp.jsx'
import { me } from './lib/auth'

function LangLayout({ lang }) {
  const normalized = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG

  useEffect(() => {
    i18n.changeLanguage(normalized)
  }, [normalized])

  if (lang !== normalized) {
    return <Navigate to={`/${normalized}`} replace />
  }

  return <Outlet />
}

function PublicShell() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

function RequireAuth() {
  const location = useLocation()
  const { makePath } = useLang()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
    staleTime: 60_000,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Checking membership status…
      </div>
    )
  }

  if (isError || !data?.user) {
    return <Navigate to={makePath('login')} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default function App() {
  const renderPublicRoutes = () => (
    <>
      <Route element={<PublicShell />}>
        <Route index element={<Home />} />
        <Route path="uddeshay" element={<Uddeshay />} />
        <Route path="founders" element={<Founders />} />
        <Route path="founders/:personId" element={<PersonDetail />} />
        <Route path="management" element={<Management />} />
        <Route path="management/:personId" element={<PersonDetail />} />
        <Route path="visheshayen" element={<Visheshayen />} />
        <Route path="history" element={<History />} />
        <Route path="news" element={<News />} />
        <Route path="news/:slug" element={<NewsArticle />} />
        <Route path="login" element={<Login />} />
        <Route path="forget-password" element={<ForgetPassword />} />
        <Route path="register" element={<Register />} />
        <Route path="matrimony" element={<MatrimonyBrowse />} />
        <Route path="jobs" element={<JobsIndex />} />
        <Route path="dharamshaalaye" element={<Dharamshalaye />} />
        <Route path="sansthaye" element={<Sansthaye />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="samajKeGaurav" element={<SamajKeGaurav />} />
        <Route path="*" element={<Navigate to="." replace />} />

      </Route>
      <Route element={<RequireAuth />}>
        <Route path="dashboard/*" element={<Dashboard />} />
      </Route>
    </>
  )

  return (
    <Routes>
      {/* Keep admin first so it never gets caught by locale routes */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* Duplicate public routes for each supported language */}
      {SUPPORTED_LANGS.map((lang) => (
        <Route key={lang} path={`/${lang}/*`} element={<LangLayout lang={lang} />}>
          {renderPublicRoutes()}
        </Route>
      ))}

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
      <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
    </Routes>
  )
}
