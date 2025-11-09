import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'
import { fetchPublicNews } from '../lib/publicApi'

const DEFAULT_NEWS = [
  {
    id: 'scholarship-2025',
    slug: 'scholarship-2025',
    title: {
      en: 'Scholarship 2025: applications now open',
      hi: 'स्कॉलरशिप 2025: आवेदन शुरू',
    },
    excerpt: {
      en: 'Submit your verified documents before 30 March to be eligible for the founder-funded scholarship.',
      hi: 'फाउंडर द्वारा समर्थित छात्रवृत्ति के लिए 30 मार्च से पहले सत्यापित दस्तावेज़ जमा करें।',
    },
    publishedAt: '2025-03-14T00:00:00.000Z',
  },
  {
    id: 'phonepe-success',
    slug: 'phonepe-success',
    title: {
      en: 'PhonePe integration completes first 1000 transactions',
      hi: 'PhonePe इंटीग्रेशन ने 1000 ट्रांजैक्शन पूरे किए',
    },
    excerpt: {
      en: 'Instant receipts, auto-upgrades, and invoice downloads are now live for all plans.',
      hi: 'अब सभी प्लान के लिए तुरंत रसीद, ऑटो अपग्रेड और इनवॉइस डाउनलोड उपलब्ध।',
    },
    publishedAt: '2025-03-02T00:00:00.000Z',
  },
]

const toDisplayDate = (value, lang) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeNews = (items) => {
  if (!items?.length) return DEFAULT_NEWS
  return items.map((item, idx) => ({
    id: item.id || item.slug || `news-${idx}`,
    slug: item.slug || DEFAULT_NEWS[idx % DEFAULT_NEWS.length].slug,
    title: {
      en: item.titleEn || DEFAULT_NEWS[idx % DEFAULT_NEWS.length].title.en,
      hi: item.titleHi || DEFAULT_NEWS[idx % DEFAULT_NEWS.length].title.hi,
    },
    excerpt: {
      en: item.excerptEn || item.bodyEn?.slice(0, 160) || DEFAULT_NEWS[idx % DEFAULT_NEWS.length].excerpt.en,
      hi: item.excerptHi || item.bodyHi?.slice(0, 160) || DEFAULT_NEWS[idx % DEFAULT_NEWS.length].excerpt.hi,
    },
    publishedAt: item.publishedAt || item.createdAt,
  }))
}

export default function News() {
  const { lang, makePath } = useLang()

  const { data } = useQuery({
    queryKey: ['public', 'news'],
    queryFn: fetchPublicNews,
    staleTime: 60 * 1000,
  })

  const articles = useMemo(() => normalizeNews(data), [data])

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {lang === 'hi' ? 'सामुदायिक समाचार' : 'Community news'}
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'जाट परिवार के लिए चुनी गई खबरें, घोषणाएँ और अपडेट।'
              : 'Stories, announcements, and updates curated for the Jat Parivar.'}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {articles.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                {toDisplayDate(post.publishedAt, lang)}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{post.title[lang === 'hi' ? 'hi' : 'en']}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">
                {post.excerpt[lang === 'hi' ? 'hi' : 'en']}
              </p>
              <Link
                to={makePath(`news/${post.slug || post.id}`)}
                className="mt-4 inline-flex text-sm font-semibold text-blue-600"
              >
                {lang === 'hi' ? 'पूरा पढ़ें' : 'Read story'} →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
