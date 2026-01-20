// frontend/src/hooks/useGotraOptions.js
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchGotras } from '../lib/geo'

const STALE_TIME = 1000 * 60 * 60 * 24 // 24 hours

const asGotraOptions = (items = [], lang = 'en') =>
  items.map((g) => ({ value: g.value, label: lang === 'hi' ? g.hi : g.en }))

export function useGotraOptions(lang = 'en') {
  const { data: gotras = [] } = useQuery({
    queryKey: ['geo', 'gotras'],
    queryFn: fetchGotras,
    staleTime: STALE_TIME,
  })

  const gotraOptions = useMemo(() => {
    const base = asGotraOptions(gotras, lang)
    const custom = {
      value: '__custom',
      label: lang === 'hi' ? 'अन्य (खुद लिखें)' : 'Other (type your own)',
    }
    return [custom, ...base]
  }, [gotras, lang])

  const gotraValueSet = useMemo(() => new Set(gotras.map((g) => g.value).filter(Boolean)), [gotras])

  return { gotras, gotraOptions, gotraValueSet }
}
