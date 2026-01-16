import { useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2, 10)}`)

const defaultImpact = {
  stats: [],
  milestones: [],
}

export default function SettingsPage() {
  const { token } = useAdminAuth()
  const { data, isLoading, refetch } = useAdminQuery(['admin', 'settings'], '/settings')
  const settings = useMemo(() => data?.data || {}, [data])

  const [contact, setContact] = useState(() => ({
    addressLine1: settings['site.contact']?.addressLine1 || '',
    addressLine2: settings['site.contact']?.addressLine2 || '',
    phone: settings['site.contact']?.phone || '',
    email: settings['site.contact']?.email || '',
  }))

  const [socials, setSocials] = useState(() =>
    Array.isArray(settings['site.socials'])
      ? settings['site.socials'].map((item) => ({ ...item, id: item.id || makeId() }))
      : []
  )

  const [links, setLinks] = useState(() =>
    normalizeLinks(settings['site.footerLinks'])
  )

  const [impact, setImpact] = useState(() => normalizeImpact(settings['site.home.impact']))

  useEffect(() => {
    setContact({
      addressLine1: settings['site.contact']?.addressLine1 || '',
      addressLine2: settings['site.contact']?.addressLine2 || '',
      phone: settings['site.contact']?.phone || '',
      email: settings['site.contact']?.email || '',
    })
    setSocials(
      Array.isArray(settings['site.socials'])
        ? settings['site.socials'].map((item) => ({ ...item, id: item.id || makeId() }))
        : []
    )
    setLinks(normalizeLinks(settings['site.footerLinks']))
    setImpact(normalizeImpact(settings['site.home.impact']))
  }, [settings])

  const [saving, setSaving] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async (payload) => {
    try {
      setSaving((prev) => ({ ...prev, ...payload }))
      setError('')
      setSuccess('')
      await adminApiFetch('/settings', { token, method: 'PATCH', body: payload })
      setSuccess('Settings saved')
      refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving({})
    }
  }

  const contactSave = async (event) => {
    event.preventDefault()
    await handleSave({ 'site.contact': contact })
  }

  const socialsSave = async (event) => {
    event.preventDefault()
    const cleaned = socials.map(({ id, ...rest }) => ({ id, ...rest }))
    await handleSave({ 'site.socials': cleaned })
  }

  const linksSave = async (event) => {
    event.preventDefault()
    await handleSave({
      'site.footerLinks': {
        quick: links.quick.map(stripId),
        secondary: links.secondary.map(stripId),
      },
    })
  }

  const impactSave = async (event) => {
    event.preventDefault()
    await handleSave({
      'site.home.impact': {
        stats: impact.stats.map(stripId),
        milestones: impact.milestones.map(stripId),
      },
    })
  }

  const addSocial = () => {
    setSocials((prev) => [...prev, { id: makeId(), label: '', href: '', icon: 'facebook' }])
  }

  const removeSocial = (id) => {
    setSocials((prev) => prev.filter((item) => item.id !== id))
  }

  const addLink = (kind) => {
    setLinks((prev) => ({
      ...prev,
      [kind]: [...prev[kind], { id: makeId(), labelEn: '', labelHi: '', segment: '' }],
    }))
  }

  const removeLink = (kind, id) => {
    setLinks((prev) => ({
      ...prev,
      [kind]: prev[kind].filter((link) => link.id !== id),
    }))
  }

  const addImpactStat = () => {
    setImpact((prev) => ({
      ...prev,
      stats: [
        ...prev.stats,
        {
          id: makeId(),
          value: '',
          labelEn: '',
          labelHi: '',
          descriptionEn: '',
          descriptionHi: '',
        },
      ],
    }))
  }

  const removeImpactStat = (id) => {
    setImpact((prev) => ({
      ...prev,
      stats: prev.stats.filter((item) => item.id !== id),
    }))
  }

  const addImpactMilestone = () => {
    setImpact((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: makeId(),
          titleEn: '',
          titleHi: '',
          descriptionEn: '',
          descriptionHi: '',
          dateLabelEn: '',
          dateLabelHi: '',
        },
      ],
    }))
  }

  const removeImpactMilestone = (id) => {
    setImpact((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((item) => item.id !== id),
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Site settings</h1>
        <p className="text-sm text-slate-500">Update footer contact details, social profiles, and homepage stats.</p>
      </div>
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading settings…
        </div>
      ) : (
        <div className="space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <form onSubmit={contactSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Footer contact</h2>
              <p className="text-xs text-slate-500">Shown at the bottom of every public page.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Address line 1" value={contact.addressLine1} onChange={(e) => setContact((prev) => ({ ...prev, addressLine1: e.target.value }))} />
              <Field label="Address line 2" value={contact.addressLine2} onChange={(e) => setContact((prev) => ({ ...prev, addressLine2: e.target.value }))} />
              <Field label="Phone" value={contact.phone} onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))} />
              <Field label="Email" type="email" value={contact.email} onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={Boolean(saving['site.contact'])}>
                {saving['site.contact'] ? 'Saving…' : 'Save contact'}
              </button>
            </div>
          </form>

          <form onSubmit={socialsSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Social profiles</h2>
                <p className="text-xs text-slate-500">Displayed in the footer.</p>
              </div>
              <button type="button" onClick={addSocial} className="px-3 py-2 text-sm border border-slate-300 rounded">
                Add link
              </button>
            </div>
            <div className="space-y-3">
              {socials.length === 0 && <p className="text-sm text-slate-500">No social profiles yet.</p>}
              {socials.map((social) => (
                <div key={social.id} className="grid md:grid-cols-[1fr_1fr_140px_auto] gap-2 items-end border border-slate-200 rounded-lg p-3">
                  <Field label="Label" value={social.label} onChange={(e) => setSocials((prev) => updateById(prev, social.id, { label: e.target.value }))} />
                  <Field label="URL" value={social.href} onChange={(e) => setSocials((prev) => updateById(prev, social.id, { href: e.target.value }))} />
                  <Field label="Icon keyword" value={social.icon || ''} onChange={(e) => setSocials((prev) => updateById(prev, social.id, { icon: e.target.value }))} placeholder="facebook, instagram…" />
                  <button type="button" onClick={() => removeSocial(social.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={Boolean(saving['site.socials'])}>
                {saving['site.socials'] ? 'Saving…' : 'Save socials'}
              </button>
            </div>
          </form>

          <form onSubmit={linksSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Footer links</h2>
                <p className="text-xs text-slate-500">Manage quick links for both languages.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => addLink('quick')} className="px-3 py-2 text-sm border border-slate-300 rounded">
                  Add quick link
                </button>
                <button type="button" onClick={() => addLink('secondary')} className="px-3 py-2 text-sm border border-slate-300 rounded">
                  Add secondary link
                </button>
              </div>
            </div>
            <LinkList
              title="Quick links"
              links={links.quick}
              onChange={(link) => setLinks((prev) => ({ ...prev, quick: updateById(prev.quick, link.id, link) }))}
              onRemove={(id) => removeLink('quick', id)}
            />
            <LinkList
              title="Secondary links"
              links={links.secondary}
              onChange={(link) => setLinks((prev) => ({ ...prev, secondary: updateById(prev.secondary, link.id, link) }))}
              onRemove={(id) => removeLink('secondary', id)}
            />
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={Boolean(saving['site.footerLinks'])}>
                {saving['site.footerLinks'] ? 'Saving…' : 'Save links'}
              </button>
            </div>
          </form>

          <form onSubmit={impactSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Homepage impact & milestones</h2>
                <p className="text-xs text-slate-500">Shown in the Impact & milestones block on the homepage.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={addImpactStat} className="px-3 py-2 text-sm border border-slate-300 rounded">
                  Add stat
                </button>
                <button type="button" onClick={addImpactMilestone} className="px-3 py-2 text-sm border border-slate-300 rounded">
                  Add milestone
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-600 uppercase">Stats</h3>
              {impact.stats.length === 0 && <p className="text-sm text-slate-500">No stats yet.</p>}
              {impact.stats.map((stat) => (
                <div key={stat.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <Field label="Value" value={stat.value} onChange={(e) => setImpact((prev) => ({ ...prev, stats: updateById(prev.stats, stat.id, { value: e.target.value }) }))} />
                    <Field label="Label (EN)" value={stat.labelEn} onChange={(e) => setImpact((prev) => ({ ...prev, stats: updateById(prev.stats, stat.id, { labelEn: e.target.value }) }))} />
                    <Field label="Label (HI)" value={stat.labelHi} onChange={(e) => setImpact((prev) => ({ ...prev, stats: updateById(prev.stats, stat.id, { labelHi: e.target.value }) }))} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Textarea label="Description (EN)" value={stat.descriptionEn} onChange={(e) => setImpact((prev) => ({ ...prev, stats: updateById(prev.stats, stat.id, { descriptionEn: e.target.value }) }))} rows={3} />
                    <Textarea label="Description (HI)" value={stat.descriptionHi} onChange={(e) => setImpact((prev) => ({ ...prev, stats: updateById(prev.stats, stat.id, { descriptionHi: e.target.value }) }))} rows={3} />
                  </div>
                  <button type="button" onClick={() => removeImpactStat(stat.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
                    Remove stat
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-600 uppercase">Milestones</h3>
              {impact.milestones.length === 0 && <p className="text-sm text-slate-500">No milestones yet.</p>}
              {impact.milestones.map((milestone) => (
                <div key={milestone.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Title (EN)" value={milestone.titleEn} onChange={(e) => setImpact((prev) => ({ ...prev, milestones: updateById(prev.milestones, milestone.id, { titleEn: e.target.value }) }))} />
                    <Field label="Title (HI)" value={milestone.titleHi} onChange={(e) => setImpact((prev) => ({ ...prev, milestones: updateById(prev.milestones, milestone.id, { titleHi: e.target.value }) }))} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Textarea label="Description (EN)" value={milestone.descriptionEn} onChange={(e) => setImpact((prev) => ({ ...prev, milestones: updateById(prev.milestones, milestone.id, { descriptionEn: e.target.value }) }))} rows={3} />
                    <Textarea label="Description (HI)" value={milestone.descriptionHi} onChange={(e) => setImpact((prev) => ({ ...prev, milestones: updateById(prev.milestones, milestone.id, { descriptionHi: e.target.value }) }))} rows={3} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Date label (EN)" value={milestone.dateLabelEn} onChange={(e) => setImpact((prev) => ({ ...prev, milestones: updateById(prev.milestones, milestone.id, { dateLabelEn: e.target.value }) }))} placeholder="1987" />
                    <Field label="Date label (HI)" value={milestone.dateLabelHi} onChange={(e) => setImpact((prev) => ({ ...prev, milestones: updateById(prev.milestones, milestone.id, { dateLabelHi: e.target.value }) }))} placeholder="1987" />
                  </div>
                  <button type="button" onClick={() => removeImpactMilestone(milestone.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
                    Remove milestone
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={Boolean(saving['site.home.impact'])}>
                {saving['site.home.impact'] ? 'Saving…' : 'Save impact'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
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
        className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}

function LinkList({ title, links, onChange, onRemove }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-600 uppercase">{title}</h3>
      {links.length === 0 && <p className="text-sm text-slate-500">No links.</p>}
      {links.map((link) => (
        <div key={link.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Label (EN)" value={link.labelEn} onChange={(e) => onChange({ ...link, labelEn: e.target.value })} />
            <Field label="Label (HI)" value={link.labelHi} onChange={(e) => onChange({ ...link, labelHi: e.target.value })} />
            <Field label="Route segment" value={link.segment} onChange={(e) => onChange({ ...link, segment: e.target.value })} placeholder="news, founders…" />
          </div>
          <button type="button" onClick={() => onRemove(link.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
            Remove link
          </button>
        </div>
      ))}
    </div>
  )
}

function updateById(arr, id, updates) {
  return arr.map((item) => (item.id === id ? { ...item, ...updates } : item))
}

function stripId({ id, ...rest }) {
  return { id, ...rest }
}

const normalizeLinks = (value) => {
  if (!value || typeof value !== 'object') {
    return { quick: [], secondary: [] }
  }
  return {
    quick: Array.isArray(value.quick) ? value.quick.map((item) => ({ ...item, id: item.id || makeId() })) : [],
    secondary: Array.isArray(value.secondary) ? value.secondary.map((item) => ({ ...item, id: item.id || makeId() })) : [],
  }
}

const normalizeImpact = (value) => {
  if (!value || typeof value !== 'object') return defaultImpact
  return {
    stats: Array.isArray(value.stats)
      ? value.stats.map((stat) => ({ ...stat, id: stat.id || makeId() }))
      : [],
    milestones: Array.isArray(value.milestones)
      ? value.milestones.map((milestone) => ({ ...milestone, id: milestone.id || makeId() }))
      : [],
  }
}
