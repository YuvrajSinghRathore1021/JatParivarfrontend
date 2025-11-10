// frontend/src/admin/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminApiFetch } from '../api/client.js'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken, setAdmin } = useAdminAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminApiFetch('/auth/login', { method: 'POST', body: { phone, password } })
      setToken(res.token)
      setAdmin(res.admin)
      const redirectTo = location.state?.from && location.state.from.startsWith('/admin') ? location.state.from : '/admin'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-slate-200"
              required
            />
          </div>
          <div className="relative w-full">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-slate-200"
              required
            />
            <img
              width="22"
              height="22"
              onClick={() => setShowPassword(!showPassword)}
              src={
                showPassword
                  ? "https://img.icons8.com/fluency-systems-regular/60/hide.png"
                  : "https://img.icons8.com/fluency-systems-regular/60/visible.png"
              }
              alt="toggle visibility"
              className="absolute right-3 bottom-3 cursor-pointer"
            />

          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded py-2 font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
