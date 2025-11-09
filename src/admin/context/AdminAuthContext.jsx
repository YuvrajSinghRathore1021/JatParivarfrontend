// frontend/src/admin/context/AdminAuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AdminAuthContext = createContext(null)

const STORAGE_KEY = 'jp_admin_token'

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(STORAGE_KEY)
      setAdmin(null)
    } else {
      localStorage.setItem(STORAGE_KEY, token)
    }
  }, [token])

  const value = useMemo(() => ({ token, setToken, admin, setAdmin, logout: () => setToken('') }), [token, admin])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
