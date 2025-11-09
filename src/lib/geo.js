// frontend/src/lib/geo.js
import { get } from './api'

export const fetchStates = async () => {
  const res = await get('/geo/states')
  return res.states || []
}

export const fetchDistricts = async (stateCode) => {
  if (!stateCode) return []
  const res = await get(`/geo/districts?state=${encodeURIComponent(stateCode)}`)
  return res.districts || []
}

export const fetchCities = async (stateCode, districtCode) => {
  if (!stateCode || !districtCode) return []
  const res = await get(`/geo/cities?state=${encodeURIComponent(stateCode)}&district=${encodeURIComponent(districtCode)}`)
  return res.cities || []
}

export const asOptions = (items, lang = 'en') =>
  items.map((item) => ({ value: item.code, label: lang === 'hi' ? item.name.hi : item.name.en }))
