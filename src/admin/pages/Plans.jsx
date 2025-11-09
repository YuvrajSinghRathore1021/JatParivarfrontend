import { useMemo, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { adminApiFetch } from '../api/client.js'

const PLAN_CONFIG = [
  { code: 'founder', label: 'Founder', labelHi: 'फाउंडर' },
  { code: 'member', label: 'Member', labelHi: 'मेम्बर' },
  { code: 'sadharan', label: 'Sadharan', labelHi: 'साधारण' },
]

const DEFAULT_PLAN = {
  titleEn: '',
  titleHi: '',
  descriptionEn: '',
  descriptionHi: '',
  buttonTextEn: 'Join now',
  buttonTextHi: 'जुड़ें',
  price: 0,
  active: true,
}

export default function PlansPage() {
  const { data, refetch, isLoading } = useAdminQuery(['admin', 'plans'], '/plans')
  const plans = useMemo(() => data?.data || [], [data])
  const planMap = useMemo(() => new Map(plans.map((p) => [p.code, p])), [plans])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Membership plans</h1>
        <p className="text-sm text-slate-500">
          Configure founder, member, and साधारण plans shown across the public site.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading plans…
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_CONFIG.map((config) => (
            <PlanCard key={config.code} config={config} plan={planMap.get(config.code)} onSaved={refetch} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlanCard({ config, plan, onSaved }) {
  const { token } = useAdminAuth()
  const [form, setForm] = useState(() => ({
    ...DEFAULT_PLAN,
    ...plan,
    buttonTextEn: plan?.buttonTextEn || DEFAULT_PLAN.buttonTextEn,
    buttonTextHi: plan?.buttonTextHi || DEFAULT_PLAN.buttonTextHi,
  }))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (field) => (event) => {
    const value = field === 'price' ? Number(event.target.value) : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const body = {
        code: config.code,
        titleEn: form.titleEn,
        titleHi: form.titleHi,
        descriptionEn: form.descriptionEn,
        descriptionHi: form.descriptionHi,
        buttonTextEn: form.buttonTextEn,
        buttonTextHi: form.buttonTextHi,
        price: Number(form.price) || 0,
        active: true,
      }
      if (plan?.id) {
        await adminApiFetch(`/plans/${plan.id}`, { token, method: 'PATCH', body })
      } else {
        await adminApiFetch('/plans', { token, method: 'POST', body })
      }
      setMessage('Saved')
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{config.label}</h2>
        <p className="text-xs text-slate-500">{config.labelHi}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
      <div className="space-y-3">
        <Field label="Title (EN)" value={form.titleEn} onChange={handleChange('titleEn')} required />
        <Field label="Title (HI)" value={form.titleHi} onChange={handleChange('titleHi')} />
        <Field label="Fee (₹)" type="number" value={form.price} onChange={handleChange('price')} required min="0" />
        <Textarea
          label="Description (EN)"
          value={form.descriptionEn}
          onChange={handleChange('descriptionEn')}
          rows={3}
        />
        <Textarea
          label="Description (HI)"
          value={form.descriptionHi}
          onChange={handleChange('descriptionHi')}
          rows={3}
        />
        <Field
          label="Button text (EN)"
          value={form.buttonTextEn}
          onChange={handleChange('buttonTextEn')}
        />
        <Field
          label="Button text (HI)"
          value={form.buttonTextHi}
          onChange={handleChange('buttonTextHi')}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save plan'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        {...rest}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </label>
  )
}

function Textarea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <textarea
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </label>
  )
}
