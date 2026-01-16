// frontend/src/lib/publicApi.js
import { get } from './api'

/**
 * Public people (spotlight) listing.
 * role: 'founder' | 'management'
 * limit: number of records to return (default 10).
 */
export const fetchPublicPeople = (role, limit = 10) => {
  const qs = new URLSearchParams({
    role,
    limit: String(limit),
  })
  return get(`/public/people?${qs.toString()}`)
}

export const fetchPublicPage = (slug) => get(`/public/pages/${slug}`)

export const fetchPublicNews = () => get('/public/news')

export const fetchPublicNewsDetail = (slug) => get(`/public/news/${slug}`)

export const fetchPublicHistory = (category = 'history') => {
  const qs = new URLSearchParams({ category })
  return get(`/public/history?${qs.toString()}`)
}
export const fetchHistory = () => {
  return get(`/public/history`)
}

export const fetchPublicPlans = () => get('/public/plans')

export const fetchHomeImpact = () => get('/public/site/home-impact')

export const fetchFooterInfo = () => get('/public/site/footer')
