import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useLang } from '../../lib/useLang'
import { fetchPublicNewsDetail } from '../../lib/publicApi'
let API_File = import.meta.env.VITE_API_File
const FALLBACK_ARTICLE = {
  title: {
    en: 'Story not found',
    hi: 'समाचार उपलब्ध नहीं',
  },
  body: {
    en: 'We could not find this story. Please explore other community news items.',
    hi: 'हम यह समाचार नहीं खोज पाए। कृपया अन्य सामुदायिक समाचार देखें।',
  },
}

const toDisplayDate = (value, lang) => {
  if (!value) return ''
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const useNewsArticle = (slug) =>
  useQuery({
    queryKey: ['public', 'news', slug],
    queryFn: () => fetchPublicNewsDetail(slug),
    enabled: Boolean(slug),
    retry: false,
    staleTime: 2 * 60 * 1000,
  })

const renderParagraphs = (text) =>
  text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)

export default function NewsArticle() {
  const { slug } = useParams()
  const { lang, makePath } = useLang()
  const langKey = lang === 'hi' ? 'hi' : 'en'

  const { data, isError, isLoading } = useNewsArticle(slug)

  const article = useMemo(() => {
    if (!data) return null
    return {
      title: {
        en: data.titleEn ?? FALLBACK_ARTICLE.title.en,
        hi: data.titleHi ?? FALLBACK_ARTICLE.title.hi,
      },
      excerpt: {
        en: data.excerptEn,
        hi: data.excerptHi,
      },
      body: {
        en: data.bodyEn ?? FALLBACK_ARTICLE.body.en,
        hi: data.bodyHi ?? FALLBACK_ARTICLE.body.hi,
      },
      heroImageUrl: data.heroImageUrl,
      publishedAt: data.publishedAt || data.createdAt,
    }
  }, [data])

  if (isLoading) {
    return (
      <main className="bg-slate-50">
        <div className="mx-auto max-w-[820px] px-4 sm:px-6 lg:px-8 py-16 space-y-6">
          <div className="h-8 w-2/3 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-slate-200 animate-pulse rounded" />
          <div className="h-48 bg-slate-200 animate-pulse rounded-3xl" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-3 bg-slate-200/80 rounded" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (isError || !article) {
    return (
      <main className="bg-slate-50">
        <div className="mx-auto max-w-[720px] px-4 sm:px-6 lg:px-8 py-16 space-y-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {FALLBACK_ARTICLE.title[langKey]}
          </h1>
          <p className="text-slate-600">{FALLBACK_ARTICLE.body[langKey]}</p>
          <Link
            to={makePath('news')}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {lang === 'hi' ? 'सभी समाचार देखें' : 'View all news'}
          </Link>
        </div>
      </main>
    )
  }

  const paragraphs = renderParagraphs(article.body[langKey])

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[820px] px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <Link to={makePath('news')} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
          ← {lang === 'hi' ? 'सभी समाचार' : 'All news'}
        </Link>

        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            {toDisplayDate(article.publishedAt, lang)}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            {article.title[langKey]}
          </h1>
          {article.excerpt[langKey] ? (
            <p className="text-slate-600 leading-relaxed">{article.excerpt[langKey]}</p>
          ) : null}
        </header>

        {article.heroImageUrl ? (
          <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img
              src={API_File+article.heroImageUrl}
              alt={article.title[langKey]}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </figure>
        ) : null}

        <article className="space-y-5 text-left">
          {paragraphs.length
            ? paragraphs.map((para, idx) => (
                <p key={idx} className="text-slate-700 leading-relaxed">
                  {para}
                </p>
              ))
            : (
              <p className="text-slate-600 leading-relaxed">{FALLBACK_ARTICLE.body[langKey]}</p>
              )}
        </article>
      </div>
    </main>
  )
}
