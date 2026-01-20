import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { useGeoOptions } from '../../hooks/useGeoOptions'
import { JAT_GOTRAS } from '../../constants/gotras'

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2, 10)}`)

const defaultImpact = {
  stats: [],
  milestones: [],
}

export default function SettingsPage() {
  const { token } = useAdminAuth()
  const { data, isLoading, refetch } = useAdminQuery(['admin', 'settings'], '/settings')
  const settings = useMemo(() => data?.data || {}, [data])
  const qc = useQueryClient()
  const [geoCustom, setGeoCustom] = useState(() => normalizeGeoCustom(settings['geo.custom']))
  const [gotras, setGotras] = useState(() => normalizeGotras(settings['gotras']))
  const [districtStateCode, setDistrictStateCode] = useState('')
  const [cityStateCode, setCityStateCode] = useState('')
  const [cityDistrictCode, setCityDistrictCode] = useState('')
  const [hiddenStateInput, setHiddenStateInput] = useState('')
  const [hiddenDistrictInput, setHiddenDistrictInput] = useState('')
  const [hiddenCityInput, setHiddenCityInput] = useState('')
  const districtStateKey = districtStateCode.trim()
  const cityStateKey = cityStateCode.trim()
  const cityDistrictKey = cityDistrictCode.trim()
  const geoStates = useGeoOptions('', '', 'en', { includeRemoved: true })
  const geoDistricts = useGeoOptions(districtStateKey, '', 'en', { includeRemoved: true })
  const geoCities = useGeoOptions(cityStateKey, cityDistrictKey, 'en', { includeRemoved: true })

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
    setGeoCustom(normalizeGeoCustom(settings['geo.custom']))
    setGotras(normalizeGotras(settings['gotras']))
    setDistrictStateCode('')
    setCityStateCode('')
    setCityDistrictCode('')
    setHiddenStateInput('')
    setHiddenDistrictInput('')
    setHiddenCityInput('')
  }, [settings])

  const [saving, setSaving] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async (payload, { invalidate = [], successMessage } = {}) => {
    try {
      const savingKeys = Object.keys(payload || {}).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      setSaving((prev) => ({ ...prev, ...savingKeys }))
      setError('')
      setSuccess('')
      await adminApiFetch('/settings', { token, method: 'PATCH', body: payload })
      setSuccess(successMessage || 'Settings saved')
      invalidate.forEach((key) => qc.invalidateQueries({ queryKey: key }))
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

  const geoSave = async (event) => {
    event.preventDefault()
    await handleSave(
      { 'geo.custom': cleanGeoCustom(geoCustom) },
      {
        invalidate: [
          ['geo', 'states'],
          ['geo', 'districts'],
          ['geo', 'cities'],
        ],
        successMessage: 'Location directory saved',
      }
    )
  }

  const gotraSave = async (event) => {
    event.preventDefault()
    await handleSave(
      { gotras: cleanGotras(gotras) },
      { invalidate: [['geo', 'gotras']], successMessage: 'Gotra list saved' }
    )
  }

  const addStateRow = () => {
    setGeoCustom((prev) => ({ ...prev, states: [...prev.states, makeGeoItem()] }))
  }

  const updateStateRow = (id, updates) => {
    setGeoCustom((prev) => {
      const current = prev.states.find((st) => st.id === id)
      if (!current) return prev
      const nextCode = updates.code?.trim()
      const states = prev.states.map((st) => (st.id === id ? { ...st, ...updates } : st))
      if (nextCode && nextCode !== current.code) {
        const districts = { ...prev.districts }
        const cities = { ...prev.cities }
        const removeDistricts = { ...prev.remove.districts }
        const removeCities = { ...prev.remove.cities }
        if (districts[current.code]) {
          districts[nextCode] = districts[current.code]
          delete districts[current.code]
        }
        if (cities[current.code]) {
          cities[nextCode] = cities[current.code]
          delete cities[current.code]
        }
        if (removeDistricts[current.code]) {
          removeDistricts[nextCode] = removeDistricts[current.code]
          delete removeDistricts[current.code]
        }
        if (removeCities[current.code]) {
          removeCities[nextCode] = removeCities[current.code]
          delete removeCities[current.code]
        }
        const removeStates = prev.remove.states.includes(current.code)
          ? uniqList([...prev.remove.states.filter((code) => code !== current.code), nextCode])
          : prev.remove.states
        return {
          ...prev,
          states,
          districts,
          cities,
          remove: { ...prev.remove, states: removeStates, districts: removeDistricts, cities: removeCities },
        }
      }
      return { ...prev, states }
    })
  }

  const removeStateRow = (id) => {
    setGeoCustom((prev) => {
      const target = prev.states.find((st) => st.id === id)
      const code = target?.code
      const states = prev.states.filter((st) => st.id !== id)
      const districts = { ...prev.districts }
      const cities = { ...prev.cities }
      const removeDistricts = { ...prev.remove.districts }
      const removeCities = { ...prev.remove.cities }
      if (code) {
        delete districts[code]
        delete cities[code]
        delete removeDistricts[code]
        delete removeCities[code]
      }
      return {
        ...prev,
        states,
        districts,
        cities,
        remove: {
          ...prev.remove,
          states: prev.remove.states.filter((stCode) => stCode !== code),
          districts: removeDistricts,
          cities: removeCities,
        },
      }
    })
  }

  const addDistrictRow = () => {
    if (!districtStateKey) return
    setGeoCustom((prev) => {
      const list = prev.districts[districtStateKey] || []
      return {
        ...prev,
        districts: { ...prev.districts, [districtStateKey]: [...list, makeGeoItem()] },
      }
    })
  }

  const updateDistrictRow = (id, updates) => {
    if (!districtStateKey) return
    setGeoCustom((prev) => {
      const list = prev.districts[districtStateKey] || []
      const current = list.find((d) => d.id === id)
      if (!current) return prev
      const nextCode = updates.code?.trim()
      const updatedList = list.map((d) => (d.id === id ? { ...d, ...updates } : d))
      let cities = { ...prev.cities }
      let removeDistricts = { ...prev.remove.districts }
      let removeCities = { ...prev.remove.cities }
      if (nextCode && nextCode !== current.code) {
        if (cities[districtStateKey]?.[current.code]) {
          const stateCities = { ...(cities[districtStateKey] || {}) }
          stateCities[nextCode] = stateCities[current.code]
          delete stateCities[current.code]
          cities = { ...cities, [districtStateKey]: stateCities }
        }
        if (removeCities[districtStateKey]?.[current.code]) {
          const stateCities = { ...(removeCities[districtStateKey] || {}) }
          stateCities[nextCode] = stateCities[current.code]
          delete stateCities[current.code]
          removeCities = { ...removeCities, [districtStateKey]: stateCities }
        }
        if (removeDistricts[districtStateKey]) {
          const list = removeDistricts[districtStateKey]
          removeDistricts[districtStateKey] = list.includes(current.code)
            ? uniqList([...list.filter((code) => code !== current.code), nextCode])
            : list
        }
      }
      return {
        ...prev,
        districts: { ...prev.districts, [districtStateKey]: updatedList },
        cities,
        remove: { ...prev.remove, districts: removeDistricts, cities: removeCities },
      }
    })
  }

  const removeDistrictRow = (id) => {
    if (!districtStateKey) return
    setGeoCustom((prev) => {
      const list = prev.districts[districtStateKey] || []
      const target = list.find((d) => d.id === id)
      const districts = {
        ...prev.districts,
        [districtStateKey]: list.filter((d) => d.id !== id),
      }
      const cleanedDistricts = districts[districtStateKey]?.length ? districts : Object.fromEntries(
        Object.entries(districts).filter(([key, val]) => key !== districtStateKey || val.length)
      )
      const code = target?.code
      const removeDistricts = { ...prev.remove.districts }
      const removeCities = { ...prev.remove.cities }
      const cities = { ...prev.cities }
      if (code) {
        if (cities[districtStateKey]) {
          const stateCities = { ...cities[districtStateKey] }
          delete stateCities[code]
          cities[districtStateKey] = stateCities
        }
        if (removeCities[districtStateKey]) {
          const stateCities = { ...removeCities[districtStateKey] }
          delete stateCities[code]
          removeCities[districtStateKey] = stateCities
        }
        if (removeDistricts[districtStateKey]) {
          removeDistricts[districtStateKey] = removeDistricts[districtStateKey].filter((c) => c !== code)
          if (!removeDistricts[districtStateKey].length) delete removeDistricts[districtStateKey]
        }
      }
      return {
        ...prev,
        districts: cleanedDistricts,
        cities,
        remove: { ...prev.remove, districts: removeDistricts, cities: removeCities },
      }
    })
  }

  const addCityRow = () => {
    if (!cityStateKey || !cityDistrictKey) return
    setGeoCustom((prev) => {
      const stateCities = prev.cities[cityStateKey] || {}
      const list = stateCities[cityDistrictKey] || []
      const nextStateCities = { ...stateCities, [cityDistrictKey]: [...list, makeGeoItem()] }
      return { ...prev, cities: { ...prev.cities, [cityStateKey]: nextStateCities } }
    })
  }

  const updateCityRow = (id, updates) => {
    if (!cityStateKey || !cityDistrictKey) return
    setGeoCustom((prev) => {
      const stateCities = prev.cities[cityStateKey] || {}
      const list = stateCities[cityDistrictKey] || []
      if (!list.find((c) => c.id === id)) return prev
      const updated = list.map((c) => (c.id === id ? { ...c, ...updates } : c))
      const nextStateCities = { ...stateCities, [cityDistrictKey]: updated }
      return { ...prev, cities: { ...prev.cities, [cityStateKey]: nextStateCities } }
    })
  }

  const removeCityRow = (id) => {
    if (!cityStateKey || !cityDistrictKey) return
    setGeoCustom((prev) => {
      const stateCities = prev.cities[cityStateKey] || {}
      const list = stateCities[cityDistrictKey] || []
      const target = list.find((c) => c.id === id)
      const updatedList = list.filter((c) => c.id !== id)
      const nextStateCities = { ...stateCities, [cityDistrictKey]: updatedList }
      if (!nextStateCities[cityDistrictKey].length) delete nextStateCities[cityDistrictKey]
      const cities = { ...prev.cities, [cityStateKey]: nextStateCities }
      if (!Object.keys(nextStateCities).length) delete cities[cityStateKey]
      const removeCities = { ...prev.remove.cities }
      if (target?.code && removeCities[cityStateKey]?.[cityDistrictKey]) {
        const stateCities = { ...(removeCities[cityStateKey] || {}) }
        stateCities[cityDistrictKey] = stateCities[cityDistrictKey].filter((c) => c !== target.code)
        if (!stateCities[cityDistrictKey].length) delete stateCities[cityDistrictKey]
        removeCities[cityStateKey] = stateCities
        if (!Object.keys(stateCities).length) delete removeCities[cityStateKey]
      }
      return { ...prev, cities, remove: { ...prev.remove, cities: removeCities } }
    })
  }

  const addHiddenState = () => {
    const code = hiddenStateInput.trim()
    if (!code) return
    setGeoCustom((prev) => ({
      ...prev,
      remove: { ...prev.remove, states: uniqList([...(prev.remove.states || []), code]) },
    }))
    setHiddenStateInput('')
  }

  const removeHiddenState = (code) => {
    setGeoCustom((prev) => ({
      ...prev,
      remove: { ...prev.remove, states: (prev.remove.states || []).filter((c) => c !== code) },
    }))
  }

  const addHiddenDistrict = () => {
    const code = hiddenDistrictInput.trim()
    if (!districtStateKey || !code) return
    setGeoCustom((prev) => {
      const removeDistricts = { ...(prev.remove.districts || {}) }
      removeDistricts[districtStateKey] = uniqList([...(removeDistricts[districtStateKey] || []), code])
      return { ...prev, remove: { ...prev.remove, districts: removeDistricts } }
    })
    setHiddenDistrictInput('')
  }

  const removeHiddenDistrict = (code) => {
    if (!districtStateKey) return
    setGeoCustom((prev) => {
      const removeDistricts = { ...(prev.remove.districts || {}) }
      if (!removeDistricts[districtStateKey]) return prev
      const filtered = removeDistricts[districtStateKey].filter((c) => c !== code)
      if (filtered.length) {
        removeDistricts[districtStateKey] = filtered
      } else {
        delete removeDistricts[districtStateKey]
      }
      return { ...prev, remove: { ...prev.remove, districts: removeDistricts } }
    })
  }

  const addHiddenCity = () => {
    const code = hiddenCityInput.trim()
    if (!cityStateKey || !cityDistrictKey || !code) return
    setGeoCustom((prev) => {
      const removeCities = { ...(prev.remove.cities || {}) }
      const stateCities = { ...(removeCities[cityStateKey] || {}) }
      stateCities[cityDistrictKey] = uniqList([...(stateCities[cityDistrictKey] || []), code])
      removeCities[cityStateKey] = stateCities
      return { ...prev, remove: { ...prev.remove, cities: removeCities } }
    })
    setHiddenCityInput('')
  }

  const removeHiddenCity = (code) => {
    if (!cityStateKey || !cityDistrictKey) return
    setGeoCustom((prev) => {
      const removeCities = { ...(prev.remove.cities || {}) }
      const stateCities = { ...(removeCities[cityStateKey] || {}) }
      if (!stateCities[cityDistrictKey]) return prev
      stateCities[cityDistrictKey] = stateCities[cityDistrictKey].filter((c) => c !== code)
      if (!stateCities[cityDistrictKey].length) delete stateCities[cityDistrictKey]
      if (Object.keys(stateCities).length) {
        removeCities[cityStateKey] = stateCities
      } else {
        delete removeCities[cityStateKey]
      }
      return { ...prev, remove: { ...prev.remove, cities: removeCities } }
    })
  }

  const addGotra = () => {
    setGotras((prev) => [...prev, { id: makeId(), value: '', en: '', hi: '' }])
  }

  const stateChoices = combineOptions(
    geoStates.stateOptions,
    geoCustom.states.map(entryToOption)
  )
  const districtChoices = combineOptions(
    geoDistricts.districtOptions,
    (geoCustom.districts[districtStateKey] || []).map(entryToOption)
  )
  const cityDistrictChoices = combineOptions(
    geoCities.districtOptions,
    (geoCustom.districts[cityStateKey] || []).map(entryToOption)
  )
  const cityChoices = combineOptions(
    geoCities.cityOptions,
    ((geoCustom.cities[cityStateKey] || {})[cityDistrictKey] || []).map(entryToOption)
  )

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

          <form onSubmit={geoSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Location directory</h2>
                <p className="text-xs text-slate-500">Add or hide states, districts, and cities that appear in address dropdowns.</p>
              </div>
              <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={Boolean(saving['geo.custom'])}>
                {saving['geo.custom'] ? 'Savingƒ?İ' : 'Save locations'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">Custom states</h3>
                    <p className="text-xs text-slate-500">Add missing states or override names by reusing an existing state code.</p>
                  </div>
                  <button type="button" onClick={addStateRow} className="px-3 py-2 text-sm border border-slate-300 rounded">
                    Add state
                  </button>
                </div>
                {geoCustom.states.length === 0 && <p className="text-sm text-slate-500">No custom states yet.</p>}
                {geoCustom.states.map((state) => (
                  <div key={state.id} className="grid gap-2 md:grid-cols-[120px_1fr_1fr_auto] items-end">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Code</label>
                      <input
                        value={state.code}
                        onChange={(e) => updateStateRow(state.id, { code: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        placeholder="RJ"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Name (EN)</label>
                      <input
                        value={state.nameEn}
                        onChange={(e) => updateStateRow(state.id, { nameEn: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Rajasthan"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Name (HI)</label>
                      <input
                        value={state.nameHi}
                        onChange={(e) => updateStateRow(state.id, { nameHi: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        placeholder="हिंदी नाम"
                      />
                    </div>
                    <button type="button" onClick={() => removeStateRow(state.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded h-10">
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-slate-600">Hide state code</label>
                    <input
                      list="state-code-options"
                      value={hiddenStateInput}
                      onChange={(e) => setHiddenStateInput(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Type or pick a code"
                    />
                    <datalist id="state-code-options">
                      {stateChoices.map((opt) => (
                        <option key={opt.value} value={opt.value} label={opt.label} />
                      ))}
                    </datalist>
                  </div>
                  <button type="button" onClick={addHiddenState} className="px-3 py-2 text-sm border border-slate-300 rounded">
                    Hide
                  </button>
                </div>
                {geoCustom.remove.states?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {geoCustom.remove.states.map((code) => (
                      <span key={code} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs">
                        {code}
                        <button type="button" onClick={() => removeHiddenState(code)} className="text-red-600">
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No hidden states.</p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Manage districts for state code</label>
                    <input
                      list="district-state-options"
                      value={districtStateCode}
                      onChange={(e) => setDistrictStateCode(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Type or pick a state code"
                    />
                    <datalist id="district-state-options">
                      {stateChoices.map((opt) => (
                        <option key={opt.value} value={opt.value} label={opt.label} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    {districtStateKey && (
                      <button type="button" onClick={() => setDistrictStateCode('')} className="px-3 py-2 text-sm border border-slate-300 rounded">
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>

                {districtStateKey ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">Custom districts for {districtStateKey}</h3>
                      <button type="button" onClick={addDistrictRow} className="px-3 py-2 text-sm border border-slate-300 rounded">
                        Add district
                      </button>
                    </div>
                    {(geoCustom.districts[districtStateKey] || []).length === 0 && (
                      <p className="text-sm text-slate-500">No custom districts for this state.</p>
                    )}
                    {(geoCustom.districts[districtStateKey] || []).map((district) => (
                      <div key={district.id} className="grid gap-2 md:grid-cols-[120px_1fr_1fr_auto] items-end">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Code</label>
                          <input
                            value={district.code}
                            onChange={(e) => updateDistrictRow(district.id, { code: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="RJ-01"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Name (EN)</label>
                          <input
                            value={district.nameEn}
                            onChange={(e) => updateDistrictRow(district.id, { nameEn: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Jaipur"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Name (HI)</label>
                          <input
                            value={district.nameHi}
                            onChange={(e) => updateDistrictRow(district.id, { nameHi: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="हिंदी नाम"
                          />
                        </div>
                        <button type="button" onClick={() => removeDistrictRow(district.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded h-10">
                          Remove
                        </button>
                      </div>
                    ))}

                    <div className="rounded border border-slate-200 p-3 space-y-2">
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <label className="text-xs font-medium text-slate-600">Hide district code</label>
                          <input
                            list="district-code-options"
                            value={hiddenDistrictInput}
                            onChange={(e) => setHiddenDistrictInput(e.target.value)}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Type or pick a code"
                          />
                          <datalist id="district-code-options">
                            {districtChoices.map((opt) => (
                              <option key={opt.value} value={opt.value} label={opt.label} />
                            ))}
                          </datalist>
                        </div>
                        <button type="button" onClick={addHiddenDistrict} className="px-3 py-2 text-sm border border-slate-300 rounded">
                          Hide
                        </button>
                      </div>
                      {(geoCustom.remove.districts?.[districtStateKey] || []).length ? (
                        <div className="flex flex-wrap gap-2">
                          {geoCustom.remove.districts[districtStateKey].map((code) => (
                            <span key={code} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs">
                              {code}
                              <button type="button" onClick={() => removeHiddenDistrict(code)} className="text-red-600">
                                x
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No hidden districts for this state.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Pick a state code to manage its districts.</p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">State code for cities</label>
                    <input
                      list="city-state-options"
                      value={cityStateCode}
                      onChange={(e) => {
                        setCityStateCode(e.target.value)
                        setCityDistrictCode('')
                      }}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Type or pick a state code"
                    />
                    <datalist id="city-state-options">
                      {stateChoices.map((opt) => (
                        <option key={opt.value} value={opt.value} label={opt.label} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">District code</label>
                    <input
                      list="city-district-options"
                      value={cityDistrictCode}
                      onChange={(e) => setCityDistrictCode(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Type or pick a district code"
                      disabled={!cityStateKey}
                    />
                    <datalist id="city-district-options">
                      {cityDistrictChoices.map((opt) => (
                        <option key={opt.value} value={opt.value} label={opt.label} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {cityStateKey && cityDistrictKey ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Custom cities for {cityStateKey} / {cityDistrictKey}
                      </h3>
                      <button type="button" onClick={addCityRow} className="px-3 py-2 text-sm border border-slate-300 rounded">
                        Add city
                      </button>
                    </div>
                    {((geoCustom.cities[cityStateKey] || {})[cityDistrictKey] || []).length === 0 && (
                      <p className="text-sm text-slate-500">No custom cities for this district.</p>
                    )}
                    {((geoCustom.cities[cityStateKey] || {})[cityDistrictKey] || []).map((city) => (
                      <div key={city.id} className="grid gap-2 md:grid-cols-[120px_1fr_1fr_auto] items-end">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Code</label>
                          <input
                            value={city.code}
                            onChange={(e) => updateCityRow(city.id, { code: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="RJ-01-001"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Name (EN)</label>
                          <input
                            value={city.nameEn}
                            onChange={(e) => updateCityRow(city.id, { nameEn: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="City name"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Name (HI)</label>
                          <input
                            value={city.nameHi}
                            onChange={(e) => updateCityRow(city.id, { nameHi: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="हिंदी नाम"
                          />
                        </div>
                        <button type="button" onClick={() => removeCityRow(city.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded h-10">
                          Remove
                        </button>
                      </div>
                    ))}

                    <div className="rounded border border-slate-200 p-3 space-y-2">
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <label className="text-xs font-medium text-slate-600">Hide city code</label>
                          <input
                            list="city-code-options"
                            value={hiddenCityInput}
                            onChange={(e) => setHiddenCityInput(e.target.value)}
                            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Type or pick a code"
                          />
                          <datalist id="city-code-options">
                            {cityChoices.map((opt) => (
                              <option key={opt.value} value={opt.value} label={opt.label} />
                            ))}
                          </datalist>
                        </div>
                        <button type="button" onClick={addHiddenCity} className="px-3 py-2 text-sm border border-slate-300 rounded">
                          Hide
                        </button>
                      </div>
                      {((geoCustom.remove.cities?.[cityStateKey] || {})[cityDistrictKey] || []).length ? (
                        <div className="flex flex-wrap gap-2">
                          {geoCustom.remove.cities[cityStateKey][cityDistrictKey].map((code) => (
                            <span key={code} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs">
                              {code}
                              <button type="button" onClick={() => removeHiddenCity(code)} className="text-red-600">
                                x
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No hidden cities for this district.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Pick a state and district to manage cities.</p>
                )}
              </div>
            </div>
          </form>

          <form onSubmit={gotraSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Gotra directory</h2>
                <p className="text-xs text-slate-500">Control the gotras available across all profiles. Manual typing remains available.</p>
              </div>
              <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={Boolean(saving['gotras'])}>
                {saving['gotras'] ? 'Savingƒ?İ' : 'Save gotras'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Add, rename, or remove gotras shown in selectors.</p>
              <button type="button" onClick={addGotra} className="px-3 py-2 text-sm border border-slate-300 rounded">
                Add gotra
              </button>
            </div>
            {gotras.length === 0 && <p className="text-sm text-slate-500">No gotras configured yet.</p>}
            <div className="space-y-3">
              {gotras.map((g) => (
                <div key={g.id} className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end border border-slate-200 rounded-lg p-3">
                  <Field label="Value" value={g.value} onChange={(e) => setGotras((prev) => updateById(prev, g.id, { value: e.target.value }))} />
                  <Field label="Name (EN)" value={g.en} onChange={(e) => setGotras((prev) => updateById(prev, g.id, { en: e.target.value }))} />
                  <Field label="Name (HI)" value={g.hi} onChange={(e) => setGotras((prev) => updateById(prev, g.id, { hi: e.target.value }))} />
                  <button type="button" onClick={() => setGotras((prev) => prev.filter((row) => row.id !== g.id))} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded">
                    Remove
                  </button>
                </div>
              ))}
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

const safeList = (v) => (Array.isArray(v) ? v : [])

const makeGeoItem = () => ({ id: makeId(), code: '', nameEn: '', nameHi: '' })

const normalizeGeoEntry = (item = {}) => {
  const code = (item.code || '').toString().trim()
  if (!code) return null
  return {
    id: item.id || makeId(),
    code,
    nameEn: (item.nameEn || item.name?.en || item.en || '').toString().trim(),
    nameHi: (item.nameHi || item.name?.hi || item.hi || '').toString().trim(),
  }
}

const normalizeGeoCustom = (value) => {
  const states = safeList(value?.states).map(normalizeGeoEntry).filter(Boolean)

  const districts = {}
  if (value?.districts && typeof value.districts === 'object') {
    for (const [stateCode, list] of Object.entries(value.districts)) {
      const code = (stateCode || '').toString().trim()
      if (!code) continue
      const items = safeList(list).map(normalizeGeoEntry).filter(Boolean)
      if (items.length) districts[code] = items
    }
  }

  const cities = {}
  if (value?.cities && typeof value.cities === 'object') {
    for (const [stateCode, distMap] of Object.entries(value.cities)) {
      const sCode = (stateCode || '').toString().trim()
      if (!sCode || !distMap || typeof distMap !== 'object') continue
      for (const [districtCode, list] of Object.entries(distMap)) {
        const dCode = (districtCode || '').toString().trim()
        if (!dCode) continue
        const items = safeList(list).map(normalizeGeoEntry).filter(Boolean)
        if (!items.length) continue
        if (!cities[sCode]) cities[sCode] = {}
        cities[sCode][dCode] = items
      }
    }
  }

  return {
    states,
    districts,
    cities,
    remove: normalizeRemoveLists(value?.remove),
  }
}

const normalizeRemoveLists = (value = {}) => {
  const states = uniqList(safeList(value.states).map((v) => (v || '').toString().trim()).filter(Boolean))

  const districts = {}
  if (value.districts && typeof value.districts === 'object') {
    for (const [stateCode, list] of Object.entries(value.districts)) {
      const code = (stateCode || '').toString().trim()
      const entries = uniqList(safeList(list).map((v) => (v || '').toString().trim()).filter(Boolean))
      if (code && entries.length) districts[code] = entries
    }
  }

  const cities = {}
  if (value.cities && typeof value.cities === 'object') {
    for (const [stateCode, distMap] of Object.entries(value.cities)) {
      const sCode = (stateCode || '').toString().trim()
      if (!sCode || !distMap || typeof distMap !== 'object') continue
      for (const [districtCode, list] of Object.entries(distMap)) {
        const dCode = (districtCode || '').toString().trim()
        const entries = uniqList(safeList(list).map((v) => (v || '').toString().trim()).filter(Boolean))
        if (!dCode || !entries.length) continue
        if (!cities[sCode]) cities[sCode] = {}
        cities[sCode][dCode] = entries
      }
    }
  }

  return { states, districts, cities }
}

const cleanGeoEntry = (item = {}) => {
  const code = (item.code || '').toString().trim()
  if (!code) return null
  const nameEn = (item.nameEn || item.nameHi || code).toString().trim()
  const nameHi = (item.nameHi || item.nameEn || code).toString().trim()
  return { code, nameEn, nameHi }
}

const cleanGeoCustom = (value) => {
  const states = safeList(value?.states).map(cleanGeoEntry).filter(Boolean)

  const districts = {}
  for (const [stateCode, list] of Object.entries(value?.districts || {})) {
    const sCode = (stateCode || '').toString().trim()
    const items = safeList(list).map(cleanGeoEntry).filter(Boolean)
    if (sCode && items.length) districts[sCode] = items
  }

  const cities = {}
  for (const [stateCode, distMap] of Object.entries(value?.cities || {})) {
    const sCode = (stateCode || '').toString().trim()
    if (!sCode || !distMap || typeof distMap !== 'object') continue
    for (const [districtCode, list] of Object.entries(distMap)) {
      const dCode = (districtCode || '').toString().trim()
      const items = safeList(list).map(cleanGeoEntry).filter(Boolean)
      if (!dCode || !items.length) continue
      if (!cities[sCode]) cities[sCode] = {}
      cities[sCode][dCode] = items
    }
  }

  const remove = normalizeRemoveLists(value?.remove)

  return { states, districts, cities, remove }
}

const normalizeGotras = (value) => {
  const source = Array.isArray(value) && value.length
    ? value
    : JAT_GOTRAS.filter((g) => g.value && g.value !== '__custom')

  return source
    .map((g) => ({
      id: g.id || makeId(),
      value: (g.value || g.en || '').toString().trim(),
      en: (g.en || g.value || '').toString().trim(),
      hi: (g.hi || g.en || g.value || '').toString().trim(),
    }))
    .filter((g) => g.value)
}

const cleanGotras = (list) => {
  const seen = new Set()
  const cleaned = []
  for (const item of safeList(list)) {
    const value = (item.value || item.en || '').toString().trim()
    if (!value || value === '__custom') continue
    if (seen.has(value)) continue
    seen.add(value)
    cleaned.push({
      value,
      en: (item.en || value).toString().trim(),
      hi: (item.hi || item.en || value).toString().trim(),
    })
  }
  return cleaned
}

const combineOptions = (...lists) => {
  const map = new Map()
  lists.flat().forEach((list) => {
    safeList(list).forEach((opt) => {
      if (!opt?.value) return
      map.set(opt.value, opt.label || opt.value)
    })
  })
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
}

const entryToOption = (item) => {
  const code = item?.code?.toString().trim()
  if (!code) return null
  return { value: code, label: item.nameEn || item.nameHi || code }
}

const uniqList = (list = []) => {
  const seen = new Set()
  const out = []
  for (const item of list) {
    if (!item) continue
    const key = item.toString()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }
  return out
}
