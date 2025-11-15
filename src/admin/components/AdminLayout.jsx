import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'

const menu = [
  { label: 'Dashboard', to: '/admin', exact: true },
  { label: 'Members', to: '/admin/members' },
  { label: 'Founders', to: '/admin/founders' },
  { label: 'Management', to: '/admin/management' },
  { label: 'Payments', to: '/admin/payments' },
  { label: 'Plans', to: '/admin/plans' },
  { label: 'Achievements', to: '/admin/achievements' },
  { label: 'Content', to: '/admin/pages' },
  { label: 'News', to: '/admin/news' },
  { label: 'History', to: '/admin/history' },
  { label: 'Institutions', to: '/admin/institutions' },
  { label: 'Matrimony', to: '/admin/matrimony' },
  { label: 'Jobs', to: '/admin/jobs' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'Audit Log', to: '/admin/audit-log' }
]

function NavigationLinks({ onNavigate }) {
  return (
    <ul className="py-2">
      {menu.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `block px-4 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
            onClick={() => onNavigate?.()}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function AdminLayout() {
  const { admin, logout, setAdmin, token } = useAdminAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      if (token) await adminApiFetch('/auth/logout', { token, method: 'POST' })
    } catch (err) {
      console.error(err)
    } finally {
      logout()
      setAdmin(null)
      navigate('/admin/login', { replace: true })
    }
  }

  const handleLogoutAndClose = async () => {
    setMobileOpen(false)
    await handleLogout()
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex md:flex-col">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-lg font-semibold">Admin Portal</h1>
          <p className="text-xs text-slate-500">{admin?.name}</p>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <NavigationLinks />
        </nav>
        <button onClick={handleLogout} className="m-4 px-3 py-2 text-sm border border-slate-200 rounded hover:bg-slate-50">
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
              aria-label="Open navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-semibold">{admin?.name}</h2>
              <p className="text-xs text-slate-500">{admin?.phone}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-3 py-2 text-sm border border-slate-200 rounded hover:bg-slate-50 md:hidden">
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 max-w-[80%] bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Admin Portal</h1>
                <p className="text-xs text-slate-500">{admin?.name}</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200"
                aria-label="Close navigation menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <NavigationLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
            <button onClick={handleLogoutAndClose} className="m-4 px-3 py-2 text-sm border border-slate-200 rounded hover:bg-slate-50">
              Logout
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
