import { get, post } from './api'

const ADMIN_TOKEN_KEY = 'jp_admin_token'
const ADMIN_PROFILE_KEY = 'jp_admin_profile'
const REGISTER_DRAFT_KEYS = ['jp_register_draft_v2', 'jp_register_draft_v1']

const clearRegisterDraft = () => {
  try {
    if (typeof window === 'undefined') return
    for (const key of REGISTER_DRAFT_KEYS) {
      try { window.sessionStorage.removeItem(key) } catch { /* ignore */ }
      try { window.localStorage.removeItem(key) } catch { /* ignore */ }
    }
  } catch {
    // ignore
  }
}

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
    clearRegisterDraft()
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
  clearRegisterDraft()
  return { kind: 'user', ...userRes }
}

// Logout (normal users)
export const logout = async () => {
  await post('/auth/logout', {})
  clearRegisterDraft()
  return true
}

// Admin logout: send the token via /admin/* (api.js now auto-attaches it)
export const adminLogout = async () => {
  await post('/admin/auth/logout', {}) // Authorization header gets added automatically now
  persistAdminSession('', null)
  clearRegisterDraft()
  return true
}
