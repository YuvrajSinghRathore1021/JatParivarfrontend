// frontend/src/lib/geo.js
import { get } from './api'

export const fetchStates = async (applyRemove = true) => {
  const res = await get(applyRemove ? '/geo/states?filtered=1' : '/geo/states')
  return res.states || []
}

export const fetchDistricts = async (stateCode, applyRemove = true) => {
  if (!stateCode) return []
  const res = await get(`/geo/districts?state=${encodeURIComponent(stateCode)}${applyRemove ? '&filtered=1' : ''}`)
  return res.districts || []
}

export const fetchCities = async (stateCode, districtCode, applyRemove = true) => {
  if (!stateCode || !districtCode) return []
  const res = await get(`/geo/cities?state=${encodeURIComponent(stateCode)}&district=${encodeURIComponent(districtCode)}${applyRemove ? '&filtered=1' : ''}`)
  return res.cities || []
}

export const fetchGotras = async () => {
  const res = await get('/geo/gotras')
  return res.gotras || []
}

const labelFor = (item = {}, lang = 'en') => {
  const code = item.code || ''
  const name = item.name || {}
  const primary = lang === 'hi' ? name.hi : name.en
  const fallback = lang === 'hi' ? name.en : name.hi
  return (primary || fallback || code || '').toString().trim() || code
}

export const asOptions = (items = [], lang = 'en') =>
  items
    .filter((item) => item?.code)
    .map((item) => ({ value: item.code, label: labelFor(item, lang) }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
