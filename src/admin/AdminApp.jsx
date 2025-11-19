// frontend/src/admin/AdminApp.jsx
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext.jsx'
import { AdminLayout } from './components/AdminLayout.jsx'
import LoginPage from './pages/Login.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import MembersPage from './pages/Members.jsx'
import MemberDetailPage from './pages/MemberDetail.jsx'
import PeoplePage from './pages/People.jsx'
import PaymentsPage from './pages/Payments.jsx'
import PlansPage from './pages/Plans.jsx'
import AchievementsPage from './pages/Achievements.jsx'
import PagesPage from './pages/Pages.jsx'
import NewsPage from './pages/News.jsx'
import HistoryPage from './pages/History.jsx'
import InstitutionsPage from './pages/Institutions.jsx'
import Matrimony from './pages/Matrimony.jsx'
import SettingsPage from './pages/Settings.jsx'
import JobsPage from './pages/Jobs.jsx'
import AuditLogPage from './pages/AuditLog.jsx'
import MatrimonyDetail from './pages/MatrimonyDetail.jsx'

import { adminApiFetch } from './api/client.js'
{/* Samaj ke Gaurav */ }
import SamajkeGaurav from './pages/SamajkeGaurav.jsx'
import SamajkeGauravDetail from './pages/SamajkeGauravDetail.jsx'

function RequireAdmin({ children }) {
  const { token, admin, setAdmin, setToken } = useAdminAuth()
  const location = useLocation()

  useEffect(() => {
    const load = async () => {
      if (!token || admin) return
      try {
        const res = await adminApiFetch('/auth/me', { token })
        setAdmin(res.admin)
      } catch (err) {
        console.error(err)
        setToken('')
      }
    }
    load()
  }, [token, admin, setAdmin, setToken])

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="/*" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />

        <Route path="founders" element={<PeoplePage role="founder" />} />
        <Route path="management" element={<PeoplePage role="management" />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="institutions" element={<InstitutionsPage />} />
        <Route path="matrimony" element={<Matrimony />} />
        <Route path="matrimony/:id" element={<MatrimonyDetail />} />

        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="samaj_ke_gaurav" element={<SamajkeGaurav />} />
        <Route path="samaj_ke_gaurav/:id" element={<SamajkeGauravDetail />} />
      </Route>
    </Routes>
  )
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminRoutes />
    </AdminAuthProvider>
  )
}
