import { get, post } from './api'

const ADMIN_TOKEN_KEY = 'jp_admin_token'
const ADMIN_PROFILE_KEY = 'jp_admin_profile'

const persistAdminSession = (token, admin) => {
  if (typeof window === 'undefined') return
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_PROFILE_KEY)
    return
  }
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
  if (admin) {
    try {
      localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin))
    } catch (err) {
      console.error('Failed to persist admin profile', err)
    }
  }
}

// Check current logged user (normal)
export const me = () => get('/auth/me')

// Unified login: tries admin first, falls back to user
export const login = async (phone, password) => {
  const clearAdminSession = () => persistAdminSession('', null)

  try {
    const adminRes = await post('/admin/auth/login', { phone, password })
    persistAdminSession(adminRes.token, adminRes.admin)
    return { kind: 'admin', ...adminRes }
  } catch (err) {
    const message = `${err?.message || ''}`
    if (!message.includes('Invalid') && !message.includes('401')) {
      throw err
    }
    clearAdminSession()
  }

  const userRes = await post('/auth/login', { phone, password })
  clearAdminSession()
  return { kind: 'user', ...userRes }
}

// Logout (normal users)
export const logout = () => post('/auth/logout', {})

// Admin logout: send the token via /admin/* (api.js now auto-attaches it)
export const adminLogout = async () => {
  await post('/admin/auth/logout', {}) // Authorization header gets added automatically now
  persistAdminSession('', null)
  return true
}
