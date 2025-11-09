import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { currentLangFromPath } from './i18nPath'

const SUPPORTED = ['en', 'hi']
const DEFAULT_LANG = 'hi'

export function useLang() {
  const { pathname } = useLocation()
  const langFromPath = currentLangFromPath(pathname)
  const lang = SUPPORTED.includes(langFromPath) ? langFromPath : DEFAULT_LANG
  const basePath = `/${lang}`

  const makePath = useMemo(() => {
    return (segment = '') => {
      if (!segment) return basePath
      if (segment.startsWith('http')) return segment
      const normalized = segment.startsWith('/') ? segment : `/${segment}`
      return `${basePath}${normalized}`
    }
  }, [basePath])

  return { lang, basePath, makePath }
}

export { SUPPORTED as SUPPORTED_LANGS, DEFAULT_LANG }
