// frontend/src/lib/api.js
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// read admin token from localStorage for any /admin/* call
const ADMIN_TOKEN_KEY = 'jp_admin_token'
let authRedirectInFlight = false

const isDashboardPath = (pathname = '') => /\/(en|hi)\/dashboard(\/|$)/.test(pathname)
const resolveLangFromPath = (pathname = '') => {
  const match = pathname.match(/^\/(en|hi)(\/|$)/)
  return match?.[1] || 'en'
}

const handleUnauthorized = async (url, res) => {
  if (res.status !== 401) return
  if (typeof window === 'undefined') return
  if (url.startsWith('/admin/')) return
  const pathname = window.location.pathname || ''
  if (!isDashboardPath(pathname)) return
  if (authRedirectInFlight) return
  authRedirectInFlight = true
  try {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch {
  }
  const loginPath = `/${resolveLangFromPath(pathname)}/login`
  if (pathname !== loginPath) {
    window.location.replace(loginPath)
  }
}
const addAdminAuthIfNeeded = (url, opts = {}) => {
  try {
    if (typeof window !== 'undefined' && url.startsWith('/admin/')) {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (token) {
        opts.headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` }
      }
    }
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('Unable to read admin auth token from storage', err)
    }
  }
  return opts
}

const handleJson = async (res) => {
  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const get = async (url, opts = {}) => {
  const res = await fetch(`${API}${url}`, {
    credentials: 'include',
    ...addAdminAuthIfNeeded(url, opts),
  })
  if (!res.ok) {
    await handleUnauthorized(url, res)
    throw new Error(await res.text())
  }
  return handleJson(res)
}

export const getAllow404 = async (url, opts = {}) => {
  const res = await fetch(`${API}${url}`, {
    credentials: 'include',
    ...addAdminAuthIfNeeded(url, opts),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    await handleUnauthorized(url, res)
    throw new Error(await res.text())
  }
  return handleJson(res)
}

export const post = async (url, body, opts = {}) => {
  const res = await fetch(`${API}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(addAdminAuthIfNeeded(url, opts).headers || {}) },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    await handleUnauthorized(url, res)
    throw new Error(await res.text())
  }
  return res.json()
}

const write = async (method, url, body, opts = {}) => {
  const res = await fetch(`${API}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(addAdminAuthIfNeeded(url, opts).headers || {}) },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    await handleUnauthorized(url, res)
    throw new Error(await res.text())
  }
  return res.json()
}

export const put = (url, body, opts = {}) => write('PUT', url, body, opts)
export const patch = (url, body, opts = {}) => write('PATCH', url, body, opts)
export const del = (url, opts = {}) => write('DELETE', url, undefined, opts)

export const upload = async (url, file, field = 'file', opts = {}) => {
  const fd = new FormData()
  fd.append(field, file)
  const headers = (addAdminAuthIfNeeded(url, opts).headers || {})
  const res = await fetch(`${API}${url}`, { method: 'POST', body: fd, credentials: 'include', headers })
  if (!res.ok) {
    await handleUnauthorized(url, res)
    throw new Error(await res.text())
  }
  return res.json()
}
