import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { useGeoOptions } from '../../hooks/useGeoOptions'

const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2, 10)}`)

const makeGeoItem = () => ({ id: makeId(), code: '', nameEn: '', nameHi: '' })

export default function LocationsPage() {
  const { token } = useAdminAuth()
  const qc = useQueryClient()
  const { data, isLoading, refetch } = useAdminQuery(['admin', 'settings'], '/settings')
  const settings = useMemo(() => data?.data || {}, [data])

  const [geoCustom, setGeoCustom] = useState(() => normalizeGeoCustom(settings['geo.custom']))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setGeoCustom(normalizeGeoCustom(settings['geo.custom']))
  }, [settings])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await adminApiFetch('/settings', { token, method: 'PATCH', body: { 'geo.custom': cleanGeoCustom(geoCustom) } })
      setSuccess('Location directory saved')
      ;[
        ['geo', 'states'],
        ['geo', 'districts'],
        ['geo', 'cities'],
      ].forEach((key) => qc.invalidateQueries({ queryKey: key }))
      refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const [lookupState, setLookupState] = useState('')
  const [lookupDistrictState, setLookupDistrictState] = useState('')
  const [lookupDistrictSearch, setLookupDistrictSearch] = useState('')
  const [lookupCityState, setLookupCityState] = useState('')
  const [lookupCityDistrict, setLookupCityDistrict] = useState('')
  const [lookupCitySearch, setLookupCitySearch] = useState('')

  const geoStates = useGeoOptions('', '', 'en', { includeRemoved: true })
  const geoDistricts = useGeoOptions(lookupDistrictState, '', 'en', { includeRemoved: true })
  const geoCities = useGeoOptions(lookupCityState, lookupCityDistrict, 'en', { includeRemoved: true })

  const filteredStates = useMemo(() => {
    const q = lookupState.trim().toLowerCase()
    if (!q) return geoStates.states
    return geoStates.states.filter((st) => {
      const code = (st.code || '').toLowerCase()
      const en = (st.name?.en || '').toLowerCase()
      const hi = (st.name?.hi || '').toLowerCase()
      return code.includes(q) || en.includes(q) || hi.includes(q)
    })
  }, [geoStates.states, lookupState])

  const filteredDistricts = useMemo(() => {
    const q = lookupDistrictSearch.trim().toLowerCase()
    if (!q) return geoDistricts.districts
    return geoDistricts.districts.filter((d) => {
      const code = (d.code || '').toLowerCase()
      const en = (d.name?.en || '').toLowerCase()
      const hi = (d.name?.hi || '').toLowerCase()
      return code.includes(q) || en.includes(q) || hi.includes(q)
    })
  }, [geoDistricts.districts, lookupDistrictSearch])

  const filteredCities = useMemo(() => {
    const q = lookupCitySearch.trim().toLowerCase()
    if (!q) return geoCities.cities
    return geoCities.cities.filter((c) => {
      const code = (c.code || '').toLowerCase()
      const en = (c.name?.en || '').toLowerCase()
      const hi = (c.name?.hi || '').toLowerCase()
      return code.includes(q) || en.includes(q) || hi.includes(q)
    })
  }, [geoCities.cities, lookupCitySearch])

  const stateSelectOptions = useMemo(
    () => geoStates.states.map((st) => ({ value: st.code, label: `${st.name?.en || st.code} (${st.code})` })),
    [geoStates.states]
  )

  const districtSelectOptions = useMemo(
    () => geoDistricts.districts.map((d) => ({ value: d.code, label: `${d.name?.en || d.code} (${d.code})` })),
    [geoDistricts.districts]
  )

  const copyToClipboard = async (value) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore
    }
  }

  const addStateRow = () => setGeoCustom((prev) => ({ ...prev, states: [...prev.states, makeGeoItem()] }))

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

  const [districtStateCode, setDistrictStateCode] = useState('')
  const [cityStateCode, setCityStateCode] = useState('')
  const [cityDistrictCode, setCityDistrictCode] = useState('')
  const [hiddenStateInput, setHiddenStateInput] = useState('')
  const [hiddenDistrictInput, setHiddenDistrictInput] = useState('')
  const [hiddenCityInput, setHiddenCityInput] = useState('')
  const districtStateKey = districtStateCode.trim()
  const cityStateKey = cityStateCode.trim()
  const cityDistrictKey = cityDistrictCode.trim()

  const geoAdminStates = useGeoOptions('', '', 'en', { includeRemoved: true })
  const geoAdminDistricts = useGeoOptions(districtStateKey, '', 'en', { includeRemoved: true })
  const geoAdminCities = useGeoOptions(cityStateKey, cityDistrictKey, 'en', { includeRemoved: true })

  const stateChoices = combineOptions(
    geoAdminStates.stateOptions,
    geoCustom.states.map(entryToOption)
  )
  const districtChoices = combineOptions(
    geoAdminDistricts.districtOptions,
    (geoCustom.districts[districtStateKey] || []).map(entryToOption)
  )
  const cityDistrictChoices = combineOptions(
    geoAdminCities.districtOptions,
    (geoCustom.districts[cityStateKey] || []).map(entryToOption)
  )
  const cityChoices = combineOptions(
    geoAdminCities.cityOptions,
    ((geoCustom.cities[cityStateKey] || {})[cityDistrictKey] || []).map(entryToOption)
  )

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
          const codes = removeDistricts[districtStateKey]
          removeDistricts[districtStateKey] = codes.includes(current.code)
            ? uniqList([...codes.filter((code) => code !== current.code), nextCode])
            : codes
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
      const cities = { ...prev.cities }
      const removeCities = { ...prev.remove.cities }
      const removeDistricts = { ...prev.remove.districts }
      const code = target?.code
      if (code) {
        if (cities[districtStateKey]) {
          const next = { ...(cities[districtStateKey] || {}) }
          delete next[code]
          cities[districtStateKey] = next
        }
        if (removeCities[districtStateKey]) {
          const next = { ...(removeCities[districtStateKey] || {}) }
          delete next[code]
          removeCities[districtStateKey] = next
        }
        if (removeDistricts[districtStateKey]) {
          removeDistricts[districtStateKey] = removeDistricts[districtStateKey].filter((c) => c !== code)
        }
      }
      return {
        ...prev,
        districts,
        cities,
        remove: { ...prev.remove, districts: removeDistricts, cities: removeCities },
      }
    })
  }

  const addCityRow = () => {
    if (!cityStateKey || !cityDistrictKey) return
    setGeoCustom((prev) => {
      const stateCities = { ...(prev.cities[cityStateKey] || {}) }
      const list = stateCities[cityDistrictKey] || []
      stateCities[cityDistrictKey] = [...list, makeGeoItem()]
      return { ...prev, cities: { ...prev.cities, [cityStateKey]: stateCities } }
    })
  }

  const updateCityRow = (id, updates) => {
    if (!cityStateKey || !cityDistrictKey) return
    setGeoCustom((prev) => {
      const stateCities = { ...(prev.cities[cityStateKey] || {}) }
      const list = stateCities[cityDistrictKey] || []
      stateCities[cityDistrictKey] = list.map((c) => (c.id === id ? { ...c, ...updates } : c))
      return { ...prev, cities: { ...prev.cities, [cityStateKey]: stateCities } }
    })
  }

  const removeCityRow = (id) => {
    if (!cityStateKey || !cityDistrictKey) return
    setGeoCustom((prev) => {
      const stateCities = { ...(prev.cities[cityStateKey] || {}) }
      const list = stateCities[cityDistrictKey] || []
      stateCities[cityDistrictKey] = list.filter((c) => c.id !== id)
      return { ...prev, cities: { ...prev.cities, [cityStateKey]: stateCities } }
    })
  }

  const addHiddenState = () => {
    const code = hiddenStateInput.trim()
    if (!code) return
    setGeoCustom((prev) => ({ ...prev, remove: { ...prev.remove, states: uniqList([...prev.remove.states, code]) } }))
    setHiddenStateInput('')
  }

  const removeHiddenState = (code) => {
    setGeoCustom((prev) => ({ ...prev, remove: { ...prev.remove, states: prev.remove.states.filter((c) => c !== code) } }))
  }

  const addHiddenDistrict = () => {
    const code = hiddenDistrictInput.trim()
    if (!districtStateKey || !code) return
    setGeoCustom((prev) => {
      const removeDistricts = { ...(prev.remove.districts || {}) }
      const list = removeDistricts[districtStateKey] || []
      removeDistricts[districtStateKey] = uniqList([...list, code])
      return { ...prev, remove: { ...prev.remove, districts: removeDistricts } }
    })
    setHiddenDistrictInput('')
  }

  const removeHiddenDistrict = (code) => {
    if (!districtStateKey) return
    setGeoCustom((prev) => {
      const removeDistricts = { ...(prev.remove.districts || {}) }
      if (!removeDistricts[districtStateKey]) return prev
      removeDistricts[districtStateKey] = removeDistricts[districtStateKey].filter((c) => c !== code)
      if (!removeDistricts[districtStateKey].length) delete removeDistricts[districtStateKey]
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Locations</h1>
        <p className="text-sm text-slate-500">Look up state/district/city codes and manage the directory used across profile addresses.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Code lookup</h2>
            <p className="text-xs text-slate-500">Search and copy codes before entering them anywhere else.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">States</label>
            <input value={lookupState} onChange={(e) => setLookupState(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="Search by name or code" />
            <div className="max-h-64 overflow-auto border border-slate-200 rounded">
              {filteredStates.map((st) => (
                <div key={st.code} className="flex items-center justify-between gap-3 px-3 py-2 text-sm border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{st.name?.en || st.code}</div>
                    <div className="text-xs text-slate-500 font-mono">{st.code}</div>
                  </div>
                  <button type="button" onClick={() => copyToClipboard(st.code)} className="text-xs underline text-slate-700">
                    copy
                  </button>
                </div>
              ))}
              {filteredStates.length === 0 && <div className="px-3 py-3 text-sm text-slate-500">No matches.</div>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Districts</label>
            <select value={lookupDistrictState} onChange={(e) => setLookupDistrictState(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">Select state</option>
              {stateSelectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input value={lookupDistrictSearch} onChange={(e) => setLookupDistrictSearch(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="Search district" disabled={!lookupDistrictState} />
            <div className="max-h-64 overflow-auto border border-slate-200 rounded">
              {!lookupDistrictState && <div className="px-3 py-3 text-sm text-slate-500">Pick a state.</div>}
              {lookupDistrictState && filteredDistricts.map((d) => (
                <div key={d.code} className="flex items-center justify-between gap-3 px-3 py-2 text-sm border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.name?.en || d.code}</div>
                    <div className="text-xs text-slate-500 font-mono">{d.code}</div>
                  </div>
                  <button type="button" onClick={() => copyToClipboard(d.code)} className="text-xs underline text-slate-700">
                    copy
                  </button>
                </div>
              ))}
              {lookupDistrictState && filteredDistricts.length === 0 && <div className="px-3 py-3 text-sm text-slate-500">No matches.</div>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Cities</label>
            <select value={lookupCityState} onChange={(e) => { setLookupCityState(e.target.value); setLookupCityDistrict('') }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">Select state</option>
              {stateSelectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select value={lookupCityDistrict} onChange={(e) => setLookupCityDistrict(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" disabled={!lookupCityState}>
              <option value="">Select district</option>
              {districtSelectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input value={lookupCitySearch} onChange={(e) => setLookupCitySearch(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" placeholder="Search city" disabled={!lookupCityState || !lookupCityDistrict} />
            <div className="max-h-64 overflow-auto border border-slate-200 rounded">
              {(!lookupCityState || !lookupCityDistrict) && <div className="px-3 py-3 text-sm text-slate-500">Pick state and district.</div>}
              {lookupCityState && lookupCityDistrict && filteredCities.map((c) => (
                <div key={c.code} className="flex items-center justify-between gap-3 px-3 py-2 text-sm border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name?.en || c.code}</div>
                    <div className="text-xs text-slate-500 font-mono">{c.code}</div>
                  </div>
                  <button type="button" onClick={() => copyToClipboard(c.code)} className="text-xs underline text-slate-700">
                    copy
                  </button>
                </div>
              ))}
              {lookupCityState && lookupCityDistrict && filteredCities.length === 0 && <div className="px-3 py-3 text-sm text-slate-500">No matches.</div>}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading settings…</div>
      ) : (
        <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Location directory</h2>
              <p className="text-xs text-slate-500">Add or hide states, districts, and cities that appear in address dropdowns.</p>
            </div>
            <button type="submit" className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50" disabled={saving}>
              {saving ? 'Saving…' : 'Save locations'}
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
              {geoCustom.states.length === 0 && <p className="text-sm text-slate-500">No custom states configured.</p>}
              {geoCustom.states.map((st) => (
                <div key={st.id} className="grid gap-2 md:grid-cols-[140px_1fr_1fr_auto] items-end">
                  <Field label="Code" value={st.code} onChange={(e) => updateStateRow(st.id, { code: e.target.value })} placeholder="RJ" />
                  <Field label="Name (EN)" value={st.nameEn} onChange={(e) => updateStateRow(st.id, { nameEn: e.target.value })} />
                  <Field label="Name (HI)" value={st.nameHi} onChange={(e) => updateStateRow(st.id, { nameHi: e.target.value })} />
                  <button type="button" onClick={() => removeStateRow(st.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded h-10">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">State code for districts</label>
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
                  {(geoCustom.districts[districtStateKey] || []).map((d) => (
                    <div key={d.id} className="grid gap-2 md:grid-cols-[140px_1fr_1fr_auto] items-end">
                      <Field label="Code" value={d.code} onChange={(e) => updateDistrictRow(d.id, { code: e.target.value })} placeholder="RJ-01" />
                      <Field label="Name (EN)" value={d.nameEn} onChange={(e) => updateDistrictRow(d.id, { nameEn: e.target.value })} />
                      <Field label="Name (HI)" value={d.nameHi} onChange={(e) => updateDistrictRow(d.id, { nameHi: e.target.value })} />
                      <button type="button" onClick={() => removeDistrictRow(d.id)} className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded h-10">
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
                    <div key={city.id} className="grid gap-2 md:grid-cols-[160px_1fr_1fr_auto] items-end">
                      <Field label="Code" value={city.code} onChange={(e) => updateCityRow(city.id, { code: e.target.value })} placeholder="RJ-01-001" />
                      <Field label="Name (EN)" value={city.nameEn} onChange={(e) => updateCityRow(city.id, { nameEn: e.target.value })} placeholder="City name" />
                      <Field label="Name (HI)" value={city.nameHi} onChange={(e) => updateCityRow(city.id, { nameHi: e.target.value })} placeholder="हिंदी नाम" />
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

            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Hidden states</h3>
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
              {geoCustom.remove.states.length ? (
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
          </div>
        </form>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm text-slate-600">
      <span className="font-medium">{label}</span>
      <input
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </label>
  )
}

const safeList = (v) => (Array.isArray(v) ? v : [])

const uniqList = (list) => Array.from(new Set(safeList(list).map((x) => (x || '').toString().trim()).filter(Boolean)))

const cleanGeoEntry = (item) => {
  if (!item || typeof item !== 'object') return null
  const code = (item.code || '').toString().trim()
  if (!code) return null
  return {
    code,
    nameEn: (item.nameEn || item.name?.en || '').toString().trim(),
    nameHi: (item.nameHi || item.name?.hi || '').toString().trim(),
  }
}

const normalizeRemoveLists = (value) => {
  const states = uniqList(value?.states)
  const districts = {}
  for (const [stateCode, list] of Object.entries(value?.districts || {})) {
    const code = (stateCode || '').toString().trim()
    const items = uniqList(list)
    if (code && items.length) districts[code] = items
  }
  const cities = {}
  for (const [stateCode, distMap] of Object.entries(value?.cities || {})) {
    const sCode = (stateCode || '').toString().trim()
    if (!sCode || !distMap || typeof distMap !== 'object') continue
    for (const [districtCode, list] of Object.entries(distMap)) {
      const dCode = (districtCode || '').toString().trim()
      const items = uniqList(list)
      if (!dCode || !items.length) continue
      if (!cities[sCode]) cities[sCode] = {}
      cities[sCode][dCode] = items
    }
  }
  return { states, districts, cities }
}

const normalizeGeoCustom = (value) => {
  if (!value || typeof value !== 'object') {
    return { states: [], districts: {}, cities: {}, remove: { states: [], districts: {}, cities: {} } }
  }

  const states = safeList(value.states).map((entry) => ({
    id: entry.id || makeId(),
    code: (entry.code || '').toString().trim(),
    nameEn: (entry.nameEn || entry.name?.en || '').toString().trim(),
    nameHi: (entry.nameHi || entry.name?.hi || '').toString().trim(),
  })).filter((st) => st.id)

  const districts = {}
  for (const [stateCode, list] of Object.entries(value.districts || {})) {
    const code = (stateCode || '').toString().trim()
    const items = safeList(list).map((entry) => ({
      id: entry.id || makeId(),
      code: (entry.code || '').toString().trim(),
      nameEn: (entry.nameEn || entry.name?.en || '').toString().trim(),
      nameHi: (entry.nameHi || entry.name?.hi || '').toString().trim(),
    }))
    if (code) districts[code] = items
  }

  const cities = {}
  for (const [stateCode, distMap] of Object.entries(value.cities || {})) {
    const sCode = (stateCode || '').toString().trim()
    if (!sCode || !distMap || typeof distMap !== 'object') continue
    for (const [districtCode, list] of Object.entries(distMap)) {
      const dCode = (districtCode || '').toString().trim()
      const items = safeList(list).map((entry) => ({
        id: entry.id || makeId(),
        code: (entry.code || '').toString().trim(),
        nameEn: (entry.nameEn || entry.name?.en || '').toString().trim(),
        nameHi: (entry.nameHi || entry.name?.hi || '').toString().trim(),
      }))
      if (!dCode) continue
      if (!cities[sCode]) cities[sCode] = {}
      cities[sCode][dCode] = items
    }
  }

  const remove = normalizeRemoveLists(value.remove)
  return { states, districts, cities, remove }
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

const entryToOption = (item) => ({ value: item.code, label: item.nameEn || item.nameHi || item.code })

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

