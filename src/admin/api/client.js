const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const adminApiFetch = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(`${API}/admin${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  return {}
}
