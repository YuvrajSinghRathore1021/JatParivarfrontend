// frontend/src/hooks/useGeoOptions.js
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchStates, fetchDistricts, fetchCities, asOptions } from '../lib/geo'

const STALE_TIME = 1000 * 60 * 5 // 5 minutes

export function useGeoOptions(stateCode, districtCode, lang = 'en', options = {}) {
  const applyRemove = !options.includeRemoved

  const { data: states = [] } = useQuery({
    queryKey: ['geo', 'states', applyRemove ? 'filtered' : 'all'],
    queryFn: () => fetchStates(applyRemove),
    staleTime: STALE_TIME,
    refetchOnMount: 'always',
  })

  const { data: districts = [] } = useQuery({
    queryKey: ['geo', 'districts', stateCode, applyRemove ? 'filtered' : 'all'],
    queryFn: () => fetchDistricts(stateCode, applyRemove),
    enabled: Boolean(stateCode),
    staleTime: STALE_TIME,
    refetchOnMount: 'always',
  })

  const { data: cities = [] } = useQuery({
    queryKey: ['geo', 'cities', stateCode, districtCode, applyRemove ? 'filtered' : 'all'],
    queryFn: () => fetchCities(stateCode, districtCode, applyRemove),
    enabled: Boolean(stateCode && districtCode),
    staleTime: STALE_TIME,
    refetchOnMount: 'always',
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
