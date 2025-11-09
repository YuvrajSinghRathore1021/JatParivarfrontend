import { useLocation } from 'react-router-dom'

/**
 * Returns the absolute base path up to and including a segment.
 * Example: pathname "/hi/dashboard/jobs/create" + "jobs" => "/hi/dashboard/jobs"
 */
export function useSectionRoot(segment) {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const idx = parts.indexOf(segment)
  return idx >= 0 ? '/' + parts.slice(0, idx + 1).join('/') : pathname.replace(/\/$/, '')
}
