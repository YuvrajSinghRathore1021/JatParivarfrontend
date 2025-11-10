import { useEffect, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
let API_File = import.meta.env.VITE_API_File

const makeId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 10)}`)

const PAGE_BLUEPRINTS = {
  uddeshay: {
    label: 'Uddeshay',
    description: 'Purpose page hero and pillars.',
    createDefault: () => ({
      heroTitleEn: '',
      heroTitleHi: '',
      introEn: '',
      introHi: '',
      closingEn: '',
      closingHi: '',
      pillars: [],
    }),
    toForm: (page) => {
      const form = PAGE_BLUEPRINTS.uddeshay.createDefault()
      form.heroTitleEn = page?.titleEn || form.heroTitleEn
      form.heroTitleHi = page?.titleHi || form.heroTitleHi
      form.introEn = page?.contentEn?.intro || form.introEn
      form.introHi = page?.contentHi?.intro || form.introHi
      form.closingEn = page?.contentEn?.closing || form.closingEn
      form.closingHi = page?.contentHi?.closing || form.closingHi
      const enPillars = Array.isArray(page?.contentEn?.pillars) ? page.contentEn.pillars : []
      const hiPillars = Array.isArray(page?.contentHi?.pillars) ? page.contentHi.pillars : []
      form.pillars = enPillars.map((pillar, idx) => {
        const id = pillar.id || makeId()
        const hiMatch = hiPillars.find((p) => p.id === id) || hiPillars[idx] || {}
        return {
          id,
          headingEn: pillar.heading || '',
          headingHi: hiMatch.heading || '',
          bodyEn: pillar.body || '',
          bodyHi: hiMatch.body || '',
        }
      })
      return form
    },
    toPayload: (form) => ({
      titleEn: form.heroTitleEn,
      titleHi: form.heroTitleHi,
      contentEn: {
        intro: form.introEn,
        closing: form.closingEn,
        pillars: form.pillars.map((pillar) => ({
          id: pillar.id,
          heading: pillar.headingEn,
          body: pillar.bodyEn,
        })),
      },
      contentHi: {
        intro: form.introHi,
        closing: form.closingHi,
        pillars: form.pillars.map((pillar) => ({
          id: pillar.id,
          heading: pillar.headingHi,
          body: pillar.bodyHi,
        })),
      },
    }),
  },
  visheshayen: {
    label: 'Visheshayen',
    description: 'Highlights grid with key features.',
    createDefault: () => ({
      heroTitleEn: '',
      heroTitleHi: '',
      introEn: '',
      introHi: '',
      items: [],
    }),
    toForm: (page) => {
      const form = PAGE_BLUEPRINTS.visheshayen.createDefault()
      form.heroTitleEn = page?.titleEn || form.heroTitleEn
      form.heroTitleHi = page?.titleHi || form.heroTitleHi
      form.introEn = page?.contentEn?.intro || form.introEn
      form.introHi = page?.contentHi?.intro || form.introHi
      const enItems = Array.isArray(page?.contentEn?.items) ? page.contentEn.items : []
      const hiItems = Array.isArray(page?.contentHi?.items) ? page.contentHi.items : []
      form.items = enItems.map((item, idx) => {
        const id = item.id || makeId()
        const hiMatch = hiItems.find((p) => p.id === id) || hiItems[idx] || {}
        return {
          id,
          headingEn: item.heading || '',
          headingHi: hiMatch.heading || '',
          bodyEn: item.body || '',
          bodyHi: hiMatch.body || '',
        }
      })
      return form
    },
    toPayload: (form) => ({
      titleEn: form.heroTitleEn,
      titleHi: form.heroTitleHi,
      contentEn: {
        intro: form.introEn,
        items: form.items.map((item) => ({
          id: item.id,
          heading: item.headingEn,
          body: item.bodyEn,
        })),
      },
      contentHi: {
        intro: form.introHi,
        items: form.items.map((item) => ({
          id: item.id,
          heading: item.headingHi,
          body: item.bodyHi,
        })),
      },
    }),
  },
  history: {
    label: 'History hero',
    description: 'Hero title and intro for the history timeline page.',
    createDefault: () => ({
      heroTitleEn: '',
      heroTitleHi: '',
      introEn: '',
      introHi: '',
    }),
    toForm: (page) => ({
      heroTitleEn: page?.titleEn || '',
      heroTitleHi: page?.titleHi || '',
      introEn: page?.contentEn?.intro || '',
      introHi: page?.contentHi?.intro || '',
    }),
    toPayload: (form) => ({
      titleEn: form.heroTitleEn,
      titleHi: form.heroTitleHi,
      contentEn: { intro: form.introEn },
      contentHi: { intro: form.introHi },
    }),
  },
}

const PAGE_ORDER = ['uddeshay', 'visheshayen', 'history']

export default function PagesPage() {
  const [activeSlug, setActiveSlug] = useState('uddeshay')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Page content</h1>
        <p className="text-sm text-slate-500">Update hero text and sections for public pages.</p>
      </div>
      <div className="flex gap-2">
        {PAGE_ORDER.map((slug) => (
          <button
            key={slug}
            onClick={() => setActiveSlug(slug)}
            className={`px-3 py-2 text-sm rounded-lg border ${
              activeSlug === slug ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'
            }`}
          >
            {PAGE_BLUEPRINTS[slug].label}
          </button>
        ))}
      </div>
      <PageEditor slug={activeSlug} key={activeSlug} />
    </div>
  )
}

function PageEditor({ slug }) {
  const blueprint = PAGE_BLUEPRINTS[slug]
  const { token } = useAdminAuth()
  const [form, setForm] = useState(blueprint.createDefault())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await adminApiFetch(`/pages/${slug}`, { token })
        setForm(blueprint.toForm(res.page))
      } catch {
        setForm(blueprint.createDefault())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, token, blueprint])

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = blueprint.toPayload(form)
      await adminApiFetch(`/pages/${slug}`, { token, method: 'PUT', body: payload })
      await adminApiFetch(`/pages/${slug}/publish`, { token, method: 'POST' })
      setSuccess('Saved and published')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Loading page content…
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{blueprint.label}</h2>
        <p className="text-xs text-slate-500">{blueprint.description}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      {slug === 'uddeshay' && <UddeshayForm form={form} onChange={setForm} />}
      {slug === 'visheshayen' && <VisheshayenForm form={form} onChange={setForm} />}
      {slug === 'history' && <HistoryForm form={form} onChange={setForm} />}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save & publish'}
        </button>
      </div>
    </form>
  )
}

function UddeshayForm({ form, onChange }) {
  const update = (updates) => onChange({ ...form, ...updates })
  const updatePillar = (id, updates) => {
    onChange({
      ...form,
      pillars: form.pillars.map((pillar) => (pillar.id === id ? { ...pillar, ...updates } : pillar)),
    })
  }
  const addPillar = () => {
    onChange({
      ...form,
      pillars: [
        ...form.pillars,
        {
          id: makeId(),
          headingEn: '',
          headingHi: '',
          bodyEn: '',
          bodyHi: '',
        },
      ],
    })
  }
  const removePillar = (id) => {
    onChange({
      ...form,
      pillars: form.pillars.filter((pillar) => pillar.id !== id),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Hero title (EN)" value={form.heroTitleEn} onChange={(e) => update({ heroTitleEn: e.target.value })} />
        <Field label="Hero title (HI)" value={form.heroTitleHi} onChange={(e) => update({ heroTitleHi: e.target.value })} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Textarea label="Intro (EN)" value={form.introEn} onChange={(e) => update({ introEn: e.target.value })} rows={3} />
        <Textarea label="Intro (HI)" value={form.introHi} onChange={(e) => update({ introHi: e.target.value })} rows={3} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Textarea label="Closing (EN)" value={form.closingEn} onChange={(e) => update({ closingEn: e.target.value })} rows={3} />
        <Textarea label="Closing (HI)" value={form.closingHi} onChange={(e) => update({ closingHi: e.target.value })} rows={3} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600 uppercase">Pillars</h3>
          <button type="button" onClick={addPillar} className="px-3 py-2 text-sm border border-slate-300 rounded">
            Add pillar
          </button>
        </div>
        {form.pillars.length === 0 && <p className="text-sm text-slate-500">No pillars yet.</p>}
        {form.pillars.map((pillar) => (
          <div key={pillar.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Heading (EN)" value={pillar.headingEn} onChange={(e) => updatePillar(pillar.id, { headingEn: e.target.value })} />
              <Field label="Heading (HI)" value={pillar.headingHi} onChange={(e) => updatePillar(pillar.id, { headingHi: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Textarea label="Body (EN)" value={pillar.bodyEn} onChange={(e) => updatePillar(pillar.id, { bodyEn: e.target.value })} rows={3} />
              <Textarea label="Body (HI)" value={pillar.bodyHi} onChange={(e) => updatePillar(pillar.id, { bodyHi: e.target.value })} rows={3} />
            </div>
            <button type="button" onClick={() => removePillar(pillar.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
              Remove pillar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisheshayenForm({ form, onChange }) {
  const update = (updates) => onChange({ ...form, ...updates })
  const updateItem = (id, updates) => {
    onChange({
      ...form,
      items: form.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })
  }
  const addItem = () => {
    onChange({
      ...form,
      items: [
        ...form.items,
        {
          id: makeId(),
          headingEn: '',
          headingHi: '',
          bodyEn: '',
          bodyHi: '',
        },
      ],
    })
  }
  const removeItem = (id) => {
    onChange({
      ...form,
      items: form.items.filter((item) => item.id !== id),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Hero title (EN)" value={form.heroTitleEn} onChange={(e) => update({ heroTitleEn: e.target.value })} />
        <Field label="Hero title (HI)" value={form.heroTitleHi} onChange={(e) => update({ heroTitleHi: e.target.value })} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Textarea label="Intro (EN)" value={form.introEn} onChange={(e) => update({ introEn: e.target.value })} rows={3} />
        <Textarea label="Intro (HI)" value={form.introHi} onChange={(e) => update({ introHi: e.target.value })} rows={3} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600 uppercase">Highlights</h3>
          <button type="button" onClick={addItem} className="px-3 py-2 text-sm border border-slate-300 rounded">
            Add highlight
          </button>
        </div>
        {form.items.length === 0 && <p className="text-sm text-slate-500">No highlights yet.</p>}
        {form.items.map((item) => (
          <div key={item.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Heading (EN)" value={item.headingEn} onChange={(e) => updateItem(item.id, { headingEn: e.target.value })} />
              <Field label="Heading (HI)" value={item.headingHi} onChange={(e) => updateItem(item.id, { headingHi: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Textarea label="Body (EN)" value={item.bodyEn} onChange={(e) => updateItem(item.id, { bodyEn: e.target.value })} rows={3} />
              <Textarea label="Body (HI)" value={item.bodyHi} onChange={(e) => updateItem(item.id, { bodyHi: e.target.value })} rows={3} />
            </div>
            <button type="button" onClick={() => removeItem(item.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
              Remove highlight
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryForm({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Hero title (EN)" value={form.heroTitleEn} onChange={(e) => onChange({ ...form, heroTitleEn: e.target.value })} />
        <Field label="Hero title (HI)" value={form.heroTitleHi} onChange={(e) => onChange({ ...form, heroTitleHi: e.target.value })} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Textarea label="Intro (EN)" value={form.introEn} onChange={(e) => onChange({ ...form, introEn: e.target.value })} rows={4} />
        <Textarea label="Intro (HI)" value={form.introHi} onChange={(e) => onChange({ ...form, introHi: e.target.value })} rows={4} />
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}

function Textarea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <textarea
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}
