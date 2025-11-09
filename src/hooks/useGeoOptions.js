// frontend/src/hooks/useGeoOptions.js
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchStates, fetchDistricts, fetchCities, asOptions } from '../lib/geo'

const STALE_TIME = 1000 * 60 * 60 * 24 // 24 hours

export function useGeoOptions(stateCode, districtCode, lang = 'en') {
  const { data: states = [] } = useQuery({
    queryKey: ['geo', 'states'],
    queryFn: fetchStates,
    staleTime: STALE_TIME,
  })

  const { data: districts = [] } = useQuery({
    queryKey: ['geo', 'districts', stateCode],
    queryFn: () => fetchDistricts(stateCode),
    enabled: Boolean(stateCode),
    staleTime: STALE_TIME,
  })

  const { data: cities = [] } = useQuery({
    queryKey: ['geo', 'cities', stateCode, districtCode],
    queryFn: () => fetchCities(stateCode, districtCode),
    enabled: Boolean(stateCode && districtCode),
    staleTime: STALE_TIME,
  })

  return {
    states,
    districts,
    cities,
    stateOptions: useMemo(() => asOptions(states, lang), [states, lang]),
    districtOptions: useMemo(() => asOptions(districts, lang), [districts, lang]),
    cityOptions: useMemo(() => asOptions(cities, lang), [cities, lang]),
  }
}
